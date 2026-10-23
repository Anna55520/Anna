/* =========================================================
   U9 MESSAGE — CUSTOMER SERVICE PAGE
   File: JS/NORMAL/MESSAGE/customer-service.js

   Connects the Customer Service page to the dedicated
   Supabase Edge Function: customer-service-api.

   Customer actions:
   - Start or resume the active support conversation
   - View previous conversations, including closed history

   Agent actions:
   - Detect active agent permission through the protected API
   - View the active/unassigned queue and assigned conversations
   - Claim unassigned conversations and open the shared Chat Page

   Does NOT call or modify message-api/group-api.
========================================================= */

(function () {
  "use strict";

  if (window.__U9CustomerServicePageLoaded) return;
  window.__U9CustomerServicePageLoaded = true;

  const CUSTOMER_SERVICE_API_URL = "/api/customer-service-api";
  const ROOT_ID = "Message-model-customer-service-root";
  const PAGE_ID = "Message-model-customer-service-page";
  const REFRESH_INTERVAL_MS = 15000;
  const MAX_MESSAGE_LENGTH = 5000;

  const state = {
    shellRendered: false,
    eventsBound: false,
    loading: false,
    refreshTimer: null,
    refreshPromise: null,
    myConversations: [],
    agentConversations: [],
    isAgent: false,
    currentUserId: null,
    lastError: "",
    unreadCacheAt: 0,
    unreadSummaryPromise: null,
    unreadSummaryCache: { has_unread: false, unread_by_conversation: {} }
  };

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getPage() {
    return document.getElementById(PAGE_ID);
  }

  function isMessageModalOpen() {
    const modal = document.getElementById("U9-message-normal-modal");
    return Boolean(modal && modal.classList.contains("modal-open"));
  }

  function isPageActive() {
    const page = getPage();
    return Boolean(
      isMessageModalOpen() &&
      page &&
      !page.hidden &&
      page.getAttribute("aria-hidden") !== "true"
    );
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      return ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character];
    });
  }

  function getSessionToken() {
    for (const key of ["u9_token", "u9_access_token", "u9_session", "session_token", "access_token", "authToken", "token"]) {
      try {
        const token = localStorage.getItem(key);
        if (token && token.trim()) return token.trim();
      } catch (_) {
        // Use the cookie fallback below.
      }
    }

    try {
      const match = document.cookie.match(/(?:^|;\s*)u9_session=([^;]+)/);
      if (match && match[1]) return decodeURIComponent(match[1]);
    } catch (_) {
      // The API will return an authentication error when no session is available.
    }

    return "";
  }

  async function callCustomerServiceAPI(action, payload) {
    const headers = { "Content-Type": "application/json" };
    const token = getSessionToken();
    if (token) headers.Authorization = "Bearer " + token;

    let response;
    try {
      response = await fetch(CUSTOMER_SERVICE_API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action: action, ...(payload || {}) })
      });
    } catch (error) {
      const networkError = new Error(
        "Could not connect to customer service. Check your connection and the customer-service-api deployment/CORS settings."
      );
      networkError.cause = error;
      throw networkError;
    }

    let result;
    try {
      result = await response.json();
    } catch (_) {
      const invalidResponseError = new Error(
        "Customer service returned an invalid response (" + response.status + ")."
      );
      invalidResponseError.status = response.status;
      throw invalidResponseError;
    }

    if (!response.ok || !result || result.success !== true) {
      const apiError = new Error(
        result && result.error ? result.error : "Customer service request failed (" + response.status + ")."
      );
      apiError.status = response.status;
      throw apiError;
    }

    return result;
  }

  // Read the existing message read_at state through the current API. To keep
  // polling lightweight, only inspect conversations whose last activity is
  // newer than the customer's/agent's last-read timestamp (or has never been read).
  async function getUnreadCounts(conversations, incomingSenderType) {
    if (!isMessageModalOpen()) return {};
    const rows = Array.isArray(conversations) ? conversations : [];
    const counts = {};
    const candidates = rows.filter(function (conversation) {
      const id = String(conversation?.id || "");
      if (!id) return false;
      const readAt = incomingSenderType === "agent"
        ? conversation.customer_last_read_at
        : conversation.agent_last_read_at;
      const lastActivity = conversation.last_message_at || conversation.updated_at;
      if (readAt && lastActivity) {
        return new Date(lastActivity).getTime() > new Date(readAt).getTime();
      }
      return true;
    });

    // Bound concurrency so a user with many historical conversations does not
    // create a burst of requests against the existing Edge Function.
    let nextIndex = 0;
    const workers = Array.from({ length: Math.min(4, candidates.length) }, async function () {
      while (nextIndex < candidates.length && isMessageModalOpen()) {
        const conversation = candidates[nextIndex++];
        const id = String(conversation.id);
        try {
          const result = await callCustomerServiceAPI("list_messages", {
            conversation_id: id,
            limit: 200
          });
          const messages = Array.isArray(result.messages) ? result.messages : [];
          const unread = messages.filter(function (message) {
            return message.sender_type === incomingSenderType && !message.read_at && !message.deleted_at;
          }).length;
          if (unread > 0) counts[id] = unread;
        } catch (error) {
          // Keep the indicator conservative if an individual conversation fails.
          console.warn("U9 Customer Service: Could not inspect unread messages for conversation.", id, error);
        }
      }
    });
    await Promise.all(workers);
    return counts;
  }

  async function loadUnreadSummary(force) {
    // Global unread summaries must not trigger background requests while closed.
    if (!isMessageModalOpen()) {
      return state.unreadSummaryCache || { has_unread: false, unread_by_conversation: {} };
    }
    const now = Date.now();
    if (!force && state.unreadSummaryCache && now - state.unreadCacheAt < 10000) {
      return state.unreadSummaryCache;
    }
    if (state.unreadSummaryPromise) return state.unreadSummaryPromise;

    state.unreadSummaryPromise = (async function () {
      const mineResult = await callCustomerServiceAPI("list_my_conversations", { limit: 100 });
      if (!isMessageModalOpen()) return state.unreadSummaryCache;
      const mine = Array.isArray(mineResult.conversations) ? mineResult.conversations : [];
      const customerUnread = await getUnreadCounts(mine, "agent");
      if (!isMessageModalOpen()) return state.unreadSummaryCache;
      let agentUnread = {};
      try {
        const agentStatus = await callCustomerServiceAPI("get_my_agent_status", {});
        if (agentStatus.is_agent === true) {
          const agentResult = await callCustomerServiceAPI("list_agent_conversations", { status: "active", limit: 100 });
          const agentRows = Array.isArray(agentResult.conversations) ? agentResult.conversations : [];
          agentUnread = await getUnreadCounts(agentRows, "customer");
        }
      } catch (error) {
        // A normal customer is not allowed to load the agent queue; that is expected.
      }
      const combined = { ...customerUnread, ...agentUnread };
      const summary = {
        has_unread: Object.values(combined).some(function (count) { return Number(count) > 0; }),
        unread_by_conversation: combined
      };
      state.unreadSummaryCache = summary;
      state.unreadCacheAt = Date.now();
      return summary;
    })();

    try {
      return await state.unreadSummaryPromise;
    } finally {
      state.unreadSummaryPromise = null;
    }
  }

  window.getCustomerServiceUnreadSummary = function (force) {
    return loadUnreadSummary(force === true);
  };

  function invalidateUnreadSummary() {
    state.unreadCacheAt = 0;
  }

  function readCurrentUserId() {
    try {
      if (window.U9User && typeof window.U9User.get === "function") {
        const current = window.U9User.get();
        if (current && current.id) return String(current.id);
      }
    } catch (_) {
      // Fall back to existing U9 user state.
    }

    for (const id of [window.currentUserUUID, window.currentUserId, window.currentUser?.id, window.currentUserData?.id, window.U9_CURRENT_USER?.id]) {
      if (id) return String(id);
    }

    try {
      for (const key of ["u9_user_id", "currentUserUUID", "currentUserId"]) {
        const value = localStorage.getItem(key);
        if (value && value.trim()) return value.trim();
      }
      for (const key of ["u9_user", "currentUser"]) {
        const value = localStorage.getItem(key);
        if (!value) continue;
        try {
          const parsed = JSON.parse(value);
          const id = parsed?.id || parsed?.user?.id;
          if (id) return String(id);
        } catch (_) {
          // Ignore non-JSON values.
        }
      }
    } catch (_) {
      // Session/user state might not be readable in this browser context.
    }

    return null;
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function conversationStatus(status) {
    const values = {
      open: "Waiting for an agent",
      assigned: "Agent assigned",
      closed: "Closed"
    };
    return values[String(status || "").toLowerCase()] || "Customer support";
  }

  function setNotice(message, type) {
    const notice = getRoot()?.querySelector("#u9-cs-notice");
    if (!notice) return;
    notice.textContent = message || "";
    notice.className = "u9-cs-notice";
    if (type === "error") notice.classList.add("is-error");
    if (type === "success") notice.classList.add("is-success");
    if (type === "info") notice.classList.add("is-info");
    notice.hidden = !message;
  }

  function setAgentNotice(message, type) {
    const notice = getRoot()?.querySelector("#u9-cs-agent-notice");
    if (!notice) return;
    notice.textContent = message || "";
    notice.className = "u9-cs-notice u9-cs-agent-notice";
    if (type === "error") notice.classList.add("is-error");
    if (type === "success") notice.classList.add("is-success");
    notice.hidden = !message;
  }

  function renderShell() {
    const root = getRoot();
    if (!root) return false;

    root.innerHTML = `
      <div class="u9-cs-page">
        <header class="u9-cs-hero">
          <div class="u9-cs-hero-icon" aria-hidden="true">
            <img src="/SSVG/normal/customer-service.svg" alt="">
          </div>
          <div class="u9-cs-hero-copy">
            <p class="u9-cs-eyebrow">U9 SUPPORT</p>
            <h2 class="u9-cs-title">Customer Service</h2>
            <p class="u9-cs-subtitle">Have a question? Start a conversation with our support team.</p>
          </div>
          <button type="button" class="u9-cs-secondary-button u9-cs-refresh" data-cs-action="refresh" aria-label="Refresh customer service">Refresh</button>
        </header>

        <div id="u9-cs-notice" class="u9-cs-notice" role="status" aria-live="polite" hidden></div>

        <section class="u9-cs-start-card" aria-labelledby="u9-cs-start-title">
          <div class="u9-cs-start-copy">
            <span class="u9-cs-status-dot" aria-hidden="true"></span>
            <div>
              <h3 id="u9-cs-start-title">How can we help?</h3>
              <p id="u9-cs-start-description">Our team can help with your account and U9 questions.</p>
            </div>
          </div>
          <button id="u9-cs-start-button" type="button" class="u9-cs-primary-button" data-cs-action="start">Start a conversation</button>
        </section>

        <section class="u9-cs-panel" aria-labelledby="u9-cs-history-title">
          <div class="u9-cs-panel-header">
            <div>
              <h3 id="u9-cs-history-title">My conversations</h3>
              <p>Continue an open conversation or review an earlier one.</p>
            </div>
            <span id="u9-cs-history-count" class="u9-cs-count">0</span>
          </div>
          <div id="u9-cs-history-list" class="u9-cs-list" aria-live="polite">
            <div class="u9-cs-empty">Your conversations will appear here.</div>
          </div>
        </section>

        <section id="u9-cs-agent-panel" class="u9-cs-panel u9-cs-agent-panel" aria-labelledby="u9-cs-agent-title" hidden>
          <div class="u9-cs-panel-header">
            <div>
              <p class="u9-cs-eyebrow">STAFF AREA</p>
              <h3 id="u9-cs-agent-title">Customer Service Workspace</h3>
              <p>Review unassigned conversations and reply to conversations assigned to you.</p>
            </div>
            <span id="u9-cs-agent-count" class="u9-cs-count">0</span>
          </div>
          <div id="u9-cs-agent-notice" class="u9-cs-notice u9-cs-agent-notice" role="status" aria-live="polite" hidden></div>
          <div id="u9-cs-agent-list" class="u9-cs-list" aria-live="polite">
            <div class="u9-cs-empty">Loading support queue…</div>
          </div>
        </section>

        <p class="u9-cs-footnote">Please do not send passwords, verification codes, or other sensitive information in chat.</p>
      </div>
    `;

    state.shellRendered = true;
    bindEvents();
    return true;
  }

  function renderMyConversations() {
    const root = getRoot();
    if (!root) return;
    const list = root.querySelector("#u9-cs-history-list");
    const count = root.querySelector("#u9-cs-history-count");
    const startButton = root.querySelector("#u9-cs-start-button");
    const description = root.querySelector("#u9-cs-start-description");
    if (!list) return;

    const sorted = [...state.myConversations].sort((a, b) => {
      return new Date(b.last_message_at || b.updated_at || b.created_at || 0).getTime() -
        new Date(a.last_message_at || a.updated_at || a.created_at || 0).getTime();
    });
    const active = sorted.find((item) => ["open", "assigned"].includes(String(item.status).toLowerCase()));

    if (count) count.textContent = String(sorted.length);
    if (startButton) {
      startButton.textContent = active ? "Continue conversation" : "Start a conversation";
      startButton.dataset.activeConversationId = active ? String(active.id) : "";
    }
    if (description) {
      description.textContent = active
        ? "You already have an open support conversation. Continue where you left off."
        : "Start a chat and our support team will respond in your conversation.";
    }

    if (!sorted.length) {
      list.innerHTML = `<div class="u9-cs-empty"><span class="u9-cs-empty-icon" aria-hidden="true">✉</span><strong>No conversations yet</strong><span>Start a conversation with Customer Service when you need help.</span></div>`;
      return;
    }

    list.innerHTML = sorted.map((conversation) => {
      const status = String(conversation.status || "open").toLowerCase();
      const statusClass = status.replace(/[^a-z0-9_-]/g, "");
      const updated = formatDate(conversation.last_message_at || conversation.updated_at || conversation.created_at);
      const isClosed = status === "closed";
      return `
        <article class="u9-cs-conversation-row">
          <div class="u9-cs-conversation-avatar" aria-hidden="true">${isClosed ? "✓" : "CS"}</div>
          <div class="u9-cs-conversation-details">
            <div class="u9-cs-conversation-title-row">
              <h4>Customer Service</h4>
              <span class="u9-cs-status-pill is-${statusClass}">${escapeHTML(conversationStatus(status))}</span>
            </div>
            <p class="u9-cs-conversation-meta">${escapeHTML(updated || "Conversation")}</p>
            <p class="u9-cs-conversation-id">Reference: ${escapeHTML(String(conversation.id || "").slice(0, 8).toUpperCase())}</p>
          </div>
          <button type="button" class="u9-cs-row-button${Number(conversation.unread_count || 0) > 0 ? " has-unread" : ""}" data-cs-action="open-customer" data-conversation-id="${escapeHTML(conversation.id)}" aria-label="${Number(conversation.unread_count || 0) > 0 ? "Open chat, unread messages" : "Open chat"}">${isClosed ? "View history" : "Open chat"}</button>
        </article>`;
    }).join("");
  }

  function renderAgentConversations() {
    const root = getRoot();
    if (!root) return;
    const panel = root.querySelector("#u9-cs-agent-panel");
    const list = root.querySelector("#u9-cs-agent-list");
    const count = root.querySelector("#u9-cs-agent-count");
    if (!panel || !list) return;

    panel.hidden = !state.isAgent;
    if (!state.isAgent) return;

    const sorted = [...state.agentConversations].sort((a, b) => {
      return new Date(b.last_message_at || b.updated_at || b.created_at || 0).getTime() -
        new Date(a.last_message_at || a.updated_at || a.created_at || 0).getTime();
    });
    if (count) count.textContent = String(sorted.length);

    if (!sorted.length) {
      list.innerHTML = `<div class="u9-cs-empty"><strong>Queue is clear</strong><span>New customer conversations will appear here.</span></div>`;
      return;
    }

    list.innerHTML = sorted.map((conversation) => {
      const status = String(conversation.status || "open").toLowerCase();
      const customer = conversation.customer || {};
      const customerName = String(customer.username || customer.account || "Customer");
      const assignedToMe = Boolean(state.currentUserId && conversation.assigned_agent_id === state.currentUserId);
      const unassigned = !conversation.assigned_agent_id;
      const action = unassigned && status !== "closed" ? "claim-agent" : "open-agent";
      const label = action === "claim-agent" ? "Accept & open" : "Open conversation";
      const assignedName = conversation.assigned_agent?.username || conversation.assigned_agent?.account || "another agent";
      const assignmentText = unassigned ? "Waiting to be accepted" : (assignedToMe ? "Assigned to you" : "Assigned to " + assignedName);
      const statusClass = status.replace(/[^a-z0-9_-]/g, "");
      const updated = formatDate(conversation.last_message_at || conversation.updated_at || conversation.created_at);
      return `
        <article class="u9-cs-conversation-row u9-cs-agent-row">
          <div class="u9-cs-conversation-avatar u9-cs-agent-avatar" aria-hidden="true">${escapeHTML(customerName.slice(0, 2).toUpperCase())}</div>
          <div class="u9-cs-conversation-details">
            <div class="u9-cs-conversation-title-row">
              <h4>${escapeHTML(customerName)}</h4>
              <span class="u9-cs-status-pill is-${statusClass}">${escapeHTML(conversationStatus(status))}</span>
            </div>
            <p class="u9-cs-conversation-meta">${escapeHTML(assignmentText)}</p>
            <p class="u9-cs-conversation-id">Last activity: ${escapeHTML(updated || "—")}</p>
          </div>
          <button type="button" class="u9-cs-row-button${Number(conversation.unread_count || 0) > 0 ? " has-unread" : ""}" data-cs-action="${action}" data-conversation-id="${escapeHTML(conversation.id)}" aria-label="${Number(conversation.unread_count || 0) > 0 ? "Open conversation, unread messages" : label}">${label}</button>
        </article>`;
    }).join("");
  }

  function updateAllViews() {
    renderMyConversations();
    renderAgentConversations();
  }

  async function refreshPage(options) {
    const config = options || {};
    // Do not load conversation lists/messages unless the modal and CS page are visible.
    if (!isMessageModalOpen() || !isPageActive()) {
      if (state.refreshTimer !== null) {
        clearTimeout(state.refreshTimer);
        state.refreshTimer = null;
      }
      return false;
    }
    if (!getRoot()) return;
    if (state.refreshPromise) return state.refreshPromise;

    state.loading = true;
    const root = getRoot();
    const refreshButton = root?.querySelector('[data-cs-action="refresh"]');
    if (refreshButton) {
      refreshButton.disabled = true;
      refreshButton.textContent = "Refreshing…";
    }
    if (!config.silent && !state.myConversations.length) {
      const list = root?.querySelector("#u9-cs-history-list");
      if (list) list.innerHTML = `<div class="u9-cs-empty">Loading your conversations…</div>`;
    }

    state.refreshPromise = (async function () {
      try {
        const mine = await callCustomerServiceAPI("list_my_conversations", { limit: 100 });
        if (!isPageActive()) return false;
        state.myConversations = Array.isArray(mine.conversations) ? mine.conversations : [];
        const customerUnreadCounts = await getUnreadCounts(state.myConversations, "agent");
        if (!isPageActive()) return false;
        state.myConversations = state.myConversations.map(function (conversation) {
          return { ...conversation, unread_count: Number(customerUnreadCounts[String(conversation.id)] || 0) };
        });
        state.currentUserId = readCurrentUserId();
        setNotice("", "");

        // Check the signed-in user's agent role first. Ordinary customers receive
        // { is_agent: false } and never call the agent-only queue endpoint, avoiding
        // an expected-but-noisy 403 in the browser console.
        try {
          const agentStatus = await callCustomerServiceAPI("get_my_agent_status", {});
          if (!isPageActive()) return false;
          state.isAgent = agentStatus.is_agent === true;

          if (state.isAgent) {
            try {
              const agentResult = await callCustomerServiceAPI("list_agent_conversations", {
                status: "active",
                limit: 100
              });
              if (!isPageActive()) return false;
              state.agentConversations = Array.isArray(agentResult.conversations) ? agentResult.conversations : [];
              const agentUnreadCounts = await getUnreadCounts(state.agentConversations, "customer");
              if (!isPageActive()) return false;
              state.agentConversations = state.agentConversations.map(function (conversation) {
                return { ...conversation, unread_count: Number(agentUnreadCounts[String(conversation.id)] || 0) };
              });
              setAgentNotice("", "");
            } catch (agentError) {
              console.warn("U9 Customer Service: Agent queue unavailable.", agentError);
              state.agentConversations = [];
              if (agentError.status === 403) state.isAgent = false;
            }
          } else {
            state.agentConversations = [];
            setAgentNotice("", "");
          }
        } catch (agentStatusError) {
          // A failed status check must not block a customer's own support history.
          console.warn("U9 Customer Service: Could not check agent status; agent workspace hidden.", agentStatusError);
          state.isAgent = false;
          state.agentConversations = [];
        }

        updateAllViews();
        return true;
      } catch (error) {
        console.error("U9 Customer Service: Could not load conversations.", error);
        if (!config.silent) setNotice(error.message || "Could not load customer service.", "error");
        const list = getRoot()?.querySelector("#u9-cs-history-list");
        if (list && !state.myConversations.length) {
          list.innerHTML = `<div class="u9-cs-empty">Could not load conversations. Check your login and try again.</div>`;
        }
        return false;
      } finally {
        state.loading = false;
        state.refreshPromise = null;
        const button = getRoot()?.querySelector('[data-cs-action="refresh"]');
        if (button) {
          button.disabled = false;
          button.textContent = "Refresh";
        }
        scheduleRefresh();
      }
    })();

    return state.refreshPromise;
  }

  function scheduleRefresh() {
    if (state.refreshTimer !== null) {
      clearTimeout(state.refreshTimer);
      state.refreshTimer = null;
    }
    if (!isPageActive()) return;

    state.refreshTimer = setTimeout(async function () {
      state.refreshTimer = null;
      if (!isPageActive()) return;
      await refreshPage({ silent: true });
    }, REFRESH_INTERVAL_MS);
  }

  function openChat(conversation, side) {
    if (!conversation || !conversation.id) {
      setNotice("The conversation ID is missing. Refresh the page and try again.", "error");
      return false;
    }
    if (typeof window.openMessageChat !== "function") {
      setNotice("The shared Chat Page is unavailable. Check that normal-message.js and chat.js are loaded.", "error");
      console.error("U9 Customer Service: window.openMessageChat() is unavailable.");
      return false;
    }

    const customer = conversation.customer || {};
    const agentSide = side === "agent";
    const customerName = String(customer.username || customer.account || "Customer");
    return window.openMessageChat({
      id: String(conversation.id),
      conversation_id: String(conversation.id),
      conversationId: String(conversation.id),
      name: agentSide ? customerName : "Customer Service",
      username: agentSide ? customerName : "Customer Service",
      type: "customer_service",
      status: conversationStatus(conversation.status),
      metadata: {
        service_side: agentSide ? "agent" : "customer",
        conversation_status: String(conversation.status || "open").toLowerCase(),
        assigned_agent_id: conversation.assigned_agent_id || null,
        customer_name: customerName,
        customer_account: customer.account || null
      }
    });
  }

  async function startConversation() {
    const button = getRoot()?.querySelector("#u9-cs-start-button");
    if (button) {
      button.disabled = true;
      button.textContent = "Opening…";
    }
    try {
      const result = await callCustomerServiceAPI("start_or_get_conversation", {});
      const conversation = result.conversation;
      if (!conversation || !conversation.id) throw new Error("The API did not return a conversation.");

      const index = state.myConversations.findIndex((item) => item.id === conversation.id);
      if (index >= 0) state.myConversations[index] = { ...state.myConversations[index], ...conversation };
      else state.myConversations.unshift(conversation);
      updateAllViews();
      invalidateUnreadSummary();
      setNotice(result.created ? "Your support conversation is ready." : "Opening your existing support conversation.", "success");
      openChat(conversation, "customer");
    } catch (error) {
      console.error("U9 Customer Service: Could not start conversation.", error);
      setNotice(error.message || "Could not start a conversation.", "error");
    } finally {
      if (button) {
        button.disabled = false;
        // renderMyConversations resets this label when it refreshes.
        renderMyConversations();
      }
    }
  }

  async function acceptAndOpen(conversation) {
    try {
      setAgentNotice("Accepting conversation…", "info");
      const result = await callCustomerServiceAPI("claim_conversation", {
        conversation_id: conversation.id
      });
      const claimed = {
        ...conversation,
        ...(result.conversation || { assigned_agent_id: state.currentUserId, status: "assigned" }),
        customer: conversation.customer || result.conversation?.customer || null,
        assigned_agent: conversation.assigned_agent || result.conversation?.assigned_agent || null
      };
      const ix = state.agentConversations.findIndex((item) => item.id === claimed.id);
      if (ix >= 0) state.agentConversations[ix] = { ...state.agentConversations[ix], ...claimed };
      else state.agentConversations.unshift(claimed);
      updateAllViews();
      invalidateUnreadSummary();
      setAgentNotice("Conversation accepted.", "success");
      openChat(claimed, "agent");
    } catch (error) {
      console.error("U9 Customer Service: Could not claim conversation.", error);
      setAgentNotice(error.message || "Could not accept this conversation.", "error");
      await refreshPage({ silent: true });
    }
  }

  function bindEvents() {
    if (state.eventsBound) return;
    const root = getRoot();
    if (!root) return;
    state.eventsBound = true;

    root.addEventListener("click", function (event) {
      const button = event.target.closest("[data-cs-action]");
      if (!button || !root.contains(button)) return;
      const action = button.dataset.csAction;
      const conversationId = button.dataset.conversationId;

      if (action === "refresh") {
        refreshPage({ silent: false });
        return;
      }
      if (action === "start") {
        startConversation();
        return;
      }
      if (action === "open-customer") {
        const conversation = state.myConversations.find((item) => String(item.id) === String(conversationId));
        if (conversation) openChat(conversation, "customer");
        return;
      }
      if (action === "claim-agent" || action === "open-agent") {
        const conversation = state.agentConversations.find((item) => String(item.id) === String(conversationId));
        if (!conversation) {
          setAgentNotice("This conversation is no longer in the queue. Refresh and try again.", "error");
          return;
        }
        if (action === "claim-agent") acceptAndOpen(conversation);
        else openChat(conversation, "agent");
      }
    });

    window.addEventListener("u9:customer-service:conversation-updated", function () {
      invalidateUnreadSummary();
      if (isPageActive()) refreshPage({ silent: true });
    });
  }

  async function initializeCustomerServicePage() {
    if (!isMessageModalOpen()) return false;
    if (!getRoot()) {
      console.warn("U9 Customer Service: #" + ROOT_ID + " is missing.");
      return false;
    }
    if (!state.shellRendered && !renderShell()) return false;
    bindEvents();
    await refreshPage({ silent: false });
    scheduleRefresh();
    return true;
  }

  window.initializeCustomerServicePage = initializeCustomerServicePage;
  window.refreshCustomerServicePage = function () {
    return refreshPage({ silent: false });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (getRoot() && !state.shellRendered) renderShell();
    }, { once: true });
  } else if (getRoot() && !state.shellRendered) {
    renderShell();
  }

  console.log("U9 Customer Service page module ready.");
})();
