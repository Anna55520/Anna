/* =========================================================
   U9 MESSAGE — GROUP PAGE
   File: JS/NORMAL/MESSAGE/group.js

   New Edge Function: group-api
   Does not modify message-api or existing 1:1 chat modules.

   Actions used:
   - search_group
   - list_my_groups
   - request_join_group
   - cancel_join_request

   Optional group owner/admin actions are supported by the API:
   - list_group_join_requests
   - respond_group_join_request
   ========================================================= */

(() => {
  "use strict";

  if (window.U9GroupModuleLoaded) return;
  window.U9GroupModuleLoaded = true;

  const GROUP_API_URL =
    "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/group-api";
  const ROOT_ID = "Message-model-group-root";

  let initialized = false;
  let busy = false;
  let searchSequence = 0;
  let refreshSequence = 0;
  let lastSearchGroup = null;
  let myGroups = [];
  let myRequests = [];
  let managedRequests = [];

  const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

  function getRoot() {
    return document.getElementById(ROOT_ID);
  }

  function getSessionToken() {
    for (const key of ["u9_token", "u9_session", "session_token", "access_token"]) {
      try {
        const token = localStorage.getItem(key);
        if (token && token.trim()) return token.trim();
      } catch (_) {
        // Try the cookie next.
      }
    }

    try {
      const match = document.cookie.match(/(?:^|;\s*)u9_session=([^;]+)/);
      if (match?.[1]) return decodeURIComponent(match[1]);
    } catch (_) {
      // The API will return 401 if no valid session is available.
    }

    return "";
  }

  async function callGroupAPI(action, payload = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = getSessionToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetch(GROUP_API_URL, {
        method: "POST",
        headers,
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ action, ...payload })
      });
    } catch (error) {
      console.error("U9 Group network error:", error);
      throw new Error("Network error. Check your connection and try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch (_) {
      throw new Error(`The server returned an invalid response (${response.status}).`);
    }

    if (!response.ok || result?.success === false) {
      throw new Error(result?.error || `Request failed (${response.status}).`);
    }

    return result;
  }

  function setNotice(message = "", type = "") {
    const notice = getRoot()?.querySelector("#u9-group-notice");
    if (!notice) return;
    notice.textContent = message;
    notice.className = "u9-group-notice";
    if (type === "success") notice.classList.add("is-success");
    if (type === "error") notice.classList.add("is-error");
  }

  function setBusy(button, state, busyLabel = "Please wait…") {
    if (!button) return;
    if (state) {
      if (!button.hasAttribute("data-original-text")) {
        button.dataset.originalText = button.textContent;
      }
      button.disabled = true;
      button.textContent = busyLabel;
    } else {
      if (button.dataset.originalText !== undefined) {
        button.textContent = button.dataset.originalText;
        delete button.dataset.originalText;
      }
      button.disabled = false;
    }
  }

  function groupTitle(group) {
    return String(group?.name || "Unnamed group");
  }

  function shortGroupId(value) {
    const id = String(value || "");
    return id.length > 15 ? `${id.slice(0, 8)}…${id.slice(-5)}` : id;
  }

  function formatDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function stateLabel(status) {
    const value = String(status || "").toLowerCase();
    const labels = {
      pending: "Pending review",
      approved: "Approved",
      rejected: "Rejected",
      cancelled: "Cancelled",
      active: "Joined",
      invited: "Invitation pending",
      left: "Left group",
      removed: "Removed"
    };
    return labels[value] || (value ? value.replace(/_/g, " ") : "No request");
  }

  function stateClass(status) {
    const value = String(status || "unknown").toLowerCase().replace(/[^a-z0-9_-]/g, "");
    return `u9-group-state-${value}`;
  }

  function groupIconMarkup(group) {
    const image = typeof group?.avatar_url === "string" ? group.avatar_url.trim() : "";
    if (image) {
      return `<img class="u9-group-avatar" src="${escapeHTML(image)}" alt="" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="u9-group-avatar-fallback" hidden aria-hidden="true">G</span>`;
    }
    return `<span class="u9-group-avatar-fallback" aria-hidden="true">G</span>`;
  }

  function renderShell() {
    const root = getRoot();
    if (!root) return false;

    root.innerHTML = `
      <div class="u9-group-page">
        <header class="u9-group-header">
          <div class="u9-group-heading-mark" aria-hidden="true">G</div>
          <div class="u9-group-heading-copy">
            <h2 class="u9-group-heading">Groups</h2>
            <p class="u9-group-subtitle">Find a group by its ID, request to join, and track your applications.</p>
          </div>
        </header>

        <div id="u9-group-notice" class="u9-group-notice" role="status" aria-live="polite"></div>

        <section class="u9-group-panel" aria-labelledby="u9-group-search-title">
          <div class="u9-group-panel-heading">
            <div>
              <h3 class="u9-group-panel-title" id="u9-group-search-title">Find a Group</h3>
              <p class="u9-group-panel-description">Enter the full Group ID supplied by the group owner.</p>
            </div>
          </div>

          <form id="u9-group-search-form" class="u9-group-search-form">
            <label class="u9-group-label" for="u9-group-id-input">Group ID</label>
            <div class="u9-group-search-row">
              <input
                id="u9-group-id-input"
                class="u9-group-input"
                name="group_id"
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                autocomplete="off"
                autocapitalize="off"
                spellcheck="false"
                maxlength="36"
                required
              >
              <button id="u9-group-search-button" class="u9-group-primary-button" type="submit">Search</button>
            </div>
          </form>

          <div id="u9-group-search-result" class="u9-group-result-slot" aria-live="polite">
            <div class="u9-group-empty">Search by Group ID to see group details and application status.</div>
          </div>
        </section>

        <section class="u9-group-panel" aria-labelledby="u9-group-joined-title">
          <div class="u9-group-panel-heading">
            <div>
              <h3 class="u9-group-panel-title" id="u9-group-joined-title">My Groups</h3>
              <p class="u9-group-panel-description">Groups you have successfully joined.</p>
            </div>
            <span class="u9-group-count" id="u9-group-joined-count">0</span>
          </div>
          <div id="u9-group-joined-list" class="u9-group-list">
            <div class="u9-group-empty">Loading your groups…</div>
          </div>
        </section>

        <section class="u9-group-panel" aria-labelledby="u9-group-review-title">
          <div class="u9-group-panel-heading">
            <div>
              <h3 class="u9-group-panel-title" id="u9-group-review-title">Requests to Review</h3>
              <p class="u9-group-panel-description">Pending join requests for groups you own or administer.</p>
            </div>
            <span class="u9-group-count" id="u9-group-review-count">0</span>
          </div>
          <div id="u9-group-review-list" class="u9-group-list">
            <div class="u9-group-empty">Checking for requests to review…</div>
          </div>
        </section>

        <section class="u9-group-panel" aria-labelledby="u9-group-applications-title">
          <div class="u9-group-panel-heading">
            <div>
              <h3 class="u9-group-panel-title" id="u9-group-applications-title">My Applications</h3>
              <p class="u9-group-panel-description">Check pending, approved, rejected, or cancelled join requests.</p>
            </div>
            <span class="u9-group-count" id="u9-group-applications-count">0</span>
          </div>
          <div id="u9-group-applications-list" class="u9-group-list">
            <div class="u9-group-empty">Loading applications…</div>
          </div>
        </section>
      </div>
    `;

    return true;
  }

  function getGroupStatusFromSearch() {
    const membership = lastSearchGroup?.membership;
    const request = lastSearchGroup?.request;
    if (membership?.status === "active") return "active";
    if (request?.status) return request.status;
    if (membership?.status) return membership.status;
    return "none";
  }

  function renderSearchResult() {
    const slot = getRoot()?.querySelector("#u9-group-search-result");
    if (!slot) return;

    if (!lastSearchGroup) {
      slot.innerHTML = `<div class="u9-group-empty">Search by Group ID to see group details and application status.</div>`;
      return;
    }

    const group = lastSearchGroup.group;
    const status = getGroupStatusFromSearch();
    const groupId = escapeHTML(group.id);
    const title = escapeHTML(groupTitle(group));
    const description = escapeHTML(group.description || "No group description has been added.");
    let actionMarkup = "";

    if (status === "active") {
      actionMarkup = `<button type="button" class="u9-group-button u9-group-button-joined" disabled>Joined</button>`;
    } else if (status === "pending") {
      actionMarkup = `<button type="button" class="u9-group-button u9-group-button-muted" disabled>Request Pending</button><button type="button" class="u9-group-button u9-group-button-outline" data-action="cancel-request" data-group-id="${groupId}">Cancel Request</button>`;
    } else if (status === "invited") {
      actionMarkup = `<span class="u9-group-status ${stateClass(status)}">Invitation pending</span>`;
    } else {
      actionMarkup = `<button type="button" class="u9-group-button u9-group-button-primary" data-action="request-join" data-group-id="${groupId}">${status === "rejected" || status === "cancelled" ? "Apply Again" : "Request to Join"}</button>`;
    }

    const statusMarkup = status === "none"
      ? `<span class="u9-group-status u9-group-state-none">Not a member</span>`
      : `<span class="u9-group-status ${stateClass(status)}">${escapeHTML(stateLabel(status))}</span>`;

    slot.innerHTML = `
      <article class="u9-group-card u9-group-search-card">
        ${groupIconMarkup(group)}
        <div class="u9-group-card-main">
          <div class="u9-group-card-topline">
            <h4 class="u9-group-card-title">${title}</h4>
            ${statusMarkup}
          </div>
          <p class="u9-group-card-description">${description}</p>
          <p class="u9-group-id-line"><span>Group ID</span><code>${groupId}</code></p>
          <div class="u9-group-card-actions">${actionMarkup}</div>
        </div>
      </article>
    `;
  }

  function renderJoinedGroups() {
    const root = getRoot();
    const list = root?.querySelector("#u9-group-joined-list");
    const count = root?.querySelector("#u9-group-joined-count");
    if (!list || !count) return;

    count.textContent = String(myGroups.length);

    if (!myGroups.length) {
      list.innerHTML = `<div class="u9-group-empty">You haven't joined any groups yet.</div>`;
      return;
    }

    list.innerHTML = myGroups.map((item) => {
      const group = item.group || item;
      const membership = item.membership || {};
      return `
        <article class="u9-group-card">
          ${groupIconMarkup(group)}
          <div class="u9-group-card-main">
            <div class="u9-group-card-topline">
              <h4 class="u9-group-card-title">${escapeHTML(groupTitle(group))}</h4>
              <span class="u9-group-status u9-group-state-active">${escapeHTML(membership.role === "owner" ? "Owner" : membership.role === "admin" ? "Admin" : "Joined")}</span>
            </div>
            <p class="u9-group-card-description">${escapeHTML(group.description || "No group description has been added.")}</p>
            <p class="u9-group-id-line"><span>Group ID</span><code>${escapeHTML(group.id)}</code></p>
            <div class="u9-group-card-actions">
              <button type="button" class="u9-group-button u9-group-button-primary" data-action="open-group" data-group-id="${escapeHTML(group.id)}">Open Group Chat</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderManagedRequests() {
    const root = getRoot();
    const list = root?.querySelector("#u9-group-review-list");
    const count = root?.querySelector("#u9-group-review-count");
    if (!list || !count) return;

    count.textContent = String(managedRequests.length);

    if (!managedRequests.length) {
      list.innerHTML = `<div class="u9-group-empty">There are no pending group requests to review.</div>`;
      return;
    }

    list.innerHTML = managedRequests.map((request) => {
      const applicant = request.user || {};
      const group = request.group || {};
      const name = String(applicant.username || "User");
      const initial = escapeHTML(name.trim().slice(0, 1).toUpperCase() || "U");
      return `
        <article class="u9-group-card u9-group-review-card">
          <span class="u9-group-applicant-avatar" aria-hidden="true">${initial}</span>
          <div class="u9-group-card-main">
            <div class="u9-group-card-topline">
              <h4 class="u9-group-card-title">${escapeHTML(name)}</h4>
              <span class="u9-group-status u9-group-state-pending">Pending review</span>
            </div>
            <p class="u9-group-card-description">Account: ${escapeHTML(applicant.account || "—")} · Group: ${escapeHTML(group.name || request.group_id)}</p>
            <p class="u9-group-id-line"><span>Group ID</span><code>${escapeHTML(request.group_id)}</code></p>
            <p class="u9-group-card-meta">Requested ${escapeHTML(formatDate(request.created_at) || "date unavailable")}</p>
            <div class="u9-group-card-actions">
              <button type="button" class="u9-group-button u9-group-button-primary" data-action="review-join-request" data-decision="accept" data-request-id="${escapeHTML(request.id)}">Approve</button>
              <button type="button" class="u9-group-button u9-group-button-danger" data-action="review-join-request" data-decision="reject" data-request-id="${escapeHTML(request.id)}">Reject</button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderApplications() {
    const root = getRoot();
    const list = root?.querySelector("#u9-group-applications-list");
    const count = root?.querySelector("#u9-group-applications-count");
    if (!list || !count) return;

    const applications = [...myRequests].sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

    count.textContent = String(applications.filter((item) => item.status === "pending").length);

    if (!applications.length) {
      list.innerHTML = `<div class="u9-group-empty">You have no group join applications.</div>`;
      return;
    }

    list.innerHTML = applications.map((request) => {
      const group = request.group || {};
      const status = String(request.status || "pending").toLowerCase();
      const cancelButton = status === "pending"
        ? `<button type="button" class="u9-group-button u9-group-button-outline" data-action="cancel-request-by-id" data-request-id="${escapeHTML(request.id)}" data-group-id="${escapeHTML(request.group_id)}">Cancel</button>`
        : "";

      return `
        <article class="u9-group-card">
          ${groupIconMarkup(group)}
          <div class="u9-group-card-main">
            <div class="u9-group-card-topline">
              <h4 class="u9-group-card-title">${escapeHTML(groupTitle(group))}</h4>
              <span class="u9-group-status ${stateClass(status)}">${escapeHTML(stateLabel(status))}</span>
            </div>
            <p class="u9-group-id-line"><span>Group ID</span><code>${escapeHTML(request.group_id)}</code></p>
            <p class="u9-group-card-meta">Applied ${escapeHTML(formatDate(request.created_at) || "date unavailable")}</p>
            <div class="u9-group-card-actions">${cancelButton}</div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function searchGroup(groupId) {
    const normalized = String(groupId || "").trim().toLowerCase();
    if (!UUID_PATTERN.test(normalized)) {
      throw new Error("Enter a valid Group ID (UUID format). ");
    }

    const sequence = ++searchSequence;
    const button = getRoot()?.querySelector("#u9-group-search-button");
    const slot = getRoot()?.querySelector("#u9-group-search-result");
    lastSearchGroup = null;
    if (slot) slot.innerHTML = `<div class="u9-group-empty">Searching for group…</div>`;
    setBusy(button, true, "Searching…");

    try {
      const result = await callGroupAPI("search_group", { group_id: normalized });
      if (sequence !== searchSequence) return;
      lastSearchGroup = result;
      renderSearchResult();
      setNotice(`Found group: ${groupTitle(result.group)}.`, "success");
    } finally {
      if (sequence === searchSequence) setBusy(button, false);
    }
  }

  async function loadMyGroups(options = {}) {
    const sequence = ++refreshSequence;
    const groupsSlot = getRoot()?.querySelector("#u9-group-joined-list");
    const requestsSlot = getRoot()?.querySelector("#u9-group-applications-list");

    if (!options.silent) {
      if (groupsSlot && !myGroups.length) groupsSlot.innerHTML = `<div class="u9-group-empty">Loading your groups…</div>`;
      if (requestsSlot && !myRequests.length) requestsSlot.innerHTML = `<div class="u9-group-empty">Loading applications…</div>`;
    }

    try {
      const result = await callGroupAPI("list_my_groups");
      if (sequence !== refreshSequence) return result;
      myGroups = Array.isArray(result.groups) ? result.groups : [];
      myRequests = Array.isArray(result.requests) ? result.requests : [];

      // Fetch review queues only for groups this user actively moderates.
      const moderatorGroups = myGroups.filter((item) => {
        const membership = item.membership || {};
        return membership.status === "active" && ["owner", "admin"].includes(membership.role);
      });
      const reviewResults = await Promise.allSettled(
        moderatorGroups.map(async (item) => {
          const group = item.group || item;
          const response = await callGroupAPI("list_group_join_requests", { group_id: group.id });
          return Array.isArray(response.requests) ? response.requests : [];
        })
      );
      managedRequests = reviewResults
        .filter((item) => item.status === "fulfilled")
        .flatMap((item) => item.value);
      const reviewErrors = reviewResults.filter((item) => item.status === "rejected");
      if (reviewErrors.length) {
        console.warn("U9 Group: some moderator request queues could not be loaded.", reviewErrors);
      }

      renderJoinedGroups();
      renderManagedRequests();
      renderApplications();
      renderSearchResult();
      return result;
    } catch (error) {
      if (sequence !== refreshSequence) return;
      console.error("U9 Group: could not load groups:", error);
      if (groupsSlot) groupsSlot.innerHTML = `<div class="u9-group-empty u9-group-empty-error">Could not load groups: ${escapeHTML(error.message)}</div>`;
      if (requestsSlot) requestsSlot.innerHTML = `<div class="u9-group-empty u9-group-empty-error">Could not load applications: ${escapeHTML(error.message)}</div>`;
      setNotice(error.message, "error");
    }
  }

  async function requestToJoin(groupId, button) {
    if (busy) return;
    busy = true;
    setBusy(button, true, "Submitting…");

    try {
      await callGroupAPI("request_join_group", { group_id: groupId });
      setNotice("Your request to join this group has been submitted.", "success");
      await loadMyGroups({ silent: true });
      await searchGroup(groupId);
      emitMembershipChanged();
    } finally {
      busy = false;
      if (button?.isConnected) setBusy(button, false);
    }
  }

  async function cancelJoinRequest({ requestId, groupId }, button) {
    if (busy) return;
    busy = true;
    setBusy(button, true, "Cancelling…");

    try {
      if (requestId) {
        await callGroupAPI("cancel_join_request", { request_id: requestId });
      } else if (groupId) {
        await callGroupAPI("cancel_join_request", { group_id: groupId });
      } else {
        throw new Error("Missing group request identifier.");
      }

      setNotice("Group join request cancelled.", "success");
      await loadMyGroups({ silent: true });
      if (groupId) await searchGroup(groupId);
      emitMembershipChanged();
    } finally {
      busy = false;
      if (button?.isConnected) setBusy(button, false);
    }
  }

  async function reviewJoinRequest(requestId, decision, button) {
    if (busy) return;
    busy = true;
    setBusy(button, true, decision === "accept" ? "Approving…" : "Rejecting…");
    try {
      await callGroupAPI("respond_group_join_request", {
        request_id: requestId,
        decision
      });
      setNotice(
        decision === "accept" ? "Join request approved. The user is now a group member." : "Join request rejected.",
        "success"
      );
      await loadMyGroups({ silent: true });
      emitMembershipChanged();
    } finally {
      busy = false;
      if (button?.isConnected) setBusy(button, false);
    }
  }

  function emitMembershipChanged() {
    window.dispatchEvent(new CustomEvent("u9:group-membership-changed", {
      detail: {
        groups: myGroups.map((item) => item.group || item)
      }
    }));
  }

  function openGroupChat(groupId) {
    const group = myGroups.find((item) => String((item.group || item).id) === String(groupId));
    const detail = {
      groupId,
      group: group?.group || group || null
    };

    // Integration hook for chat.js when group-chat support is added.
    window.dispatchEvent(new CustomEvent("u9:open-group-chat", { detail }));

    // Current chat.js is 1:1 only. Do not silently pass a group to it.
    setNotice("You are a member of this group. Group chat will open after group support is added to chat.js.");
  }

  function bindEvents() {
    const root = getRoot();
    if (!root || root.dataset.u9GroupBound === "true") return;
    root.dataset.u9GroupBound = "true";

    root.addEventListener("submit", async (event) => {
      if (event.target?.id !== "u9-group-search-form") return;
      event.preventDefault();
      setNotice();
      const value = root.querySelector("#u9-group-id-input")?.value || "";
      try {
        await searchGroup(value);
      } catch (error) {
        console.error("U9 Group search failed:", error);
        lastSearchGroup = null;
        renderSearchResult();
        setNotice(error.message, "error");
      }
    });

    root.addEventListener("input", (event) => {
      if (event.target?.id === "u9-group-id-input") {
        const input = event.target;
        const position = input.selectionStart;
        input.value = input.value.replace(/[^0-9a-f-]/gi, "").slice(0, 36);
        try { input.setSelectionRange(position, position); } catch (_) {}
      }
    });

    root.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action]");
      if (!button || !root.contains(button)) return;

      const action = button.dataset.action;
      const groupId = button.dataset.groupId;

      try {
        if (action === "request-join") {
          await requestToJoin(groupId, button);
        } else if (action === "cancel-request") {
          await cancelJoinRequest({ groupId }, button);
        } else if (action === "cancel-request-by-id") {
          await cancelJoinRequest({ requestId: button.dataset.requestId, groupId }, button);
        } else if (action === "open-group") {
          openGroupChat(groupId);
        } else if (action === "review-join-request") {
          await reviewJoinRequest(
            button.dataset.requestId,
            button.dataset.decision,
            button
          );
        }
      } catch (error) {
        console.error("U9 Group action failed:", error);
        setNotice(error.message, "error");
      }
    });
  }

  function initializeGroupPage() {
    const root = getRoot();
    if (!root) {
      console.warn("U9 Group: root element not found:", ROOT_ID);
      return false;
    }

    renderShell();
    bindEvents();
    initialized = true;
    loadMyGroups();
    console.info("U9 Group page initialized.");
    return true;
  }

  window.initializeGroupPage = initializeGroupPage;
  window.refreshGroupPage = () => initialized ? loadMyGroups() : initializeGroupPage();

  // Bridge future Friend/Chat page integration without modifying those files now.
  window.U9GroupModule = {
    initialize: initializeGroupPage,
    refresh: () => loadMyGroups({ silent: true }),
    listMyGroups: () => myGroups.map((item) => item.group || item),
    listMyApplications: () => [...myRequests]
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (getRoot()?.closest(".active")) initializeGroupPage();
    }, { once: true });
  } else if (getRoot()?.closest(".active")) {
    initializeGroupPage();
  }

  console.info("U9 Group module ready.");
})();
