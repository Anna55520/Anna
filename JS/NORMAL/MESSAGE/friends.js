
/* =================================================
   U9 MESSAGE - FRIENDS PAGE
   File: JS/NORMAL/MESSAGE/friends.js
================================================= */

(function () {
  "use strict";

  const FRIENDS_ROOT_ID = "Message-model-friends-root";
  const FRIENDS_TABLE = "message-friends";
  const USER_TABLE = "user";

  let friendsInitialized = false;
  let isLoading = false;

  function getSupabase() {
    return window.supabaseClient || window.supabase || null;
  }

  function getCurrentUserId() {
    const possibleIds = [
      window.currentUserUUID,
      window.currentUserId,
      window.currentUser && window.currentUser.id
    ];

    for (const id of possibleIds) {
      if (typeof id === "string" && id.trim()) {
        return id.trim();
      }
    }

    try {
      const storedIds = [
        localStorage.getItem("currentUserUUID"),
        localStorage.getItem("currentUserId")
      ];

      for (const id of storedIds) {
        if (id && id.trim()) {
          return id.trim();
        }
      }

      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);

        if (parsed && typeof parsed.id === "string") {
          return parsed.id;
        }
      }
    } catch (error) {
      console.warn("U9 Friends: Could not read saved user ID.", error);
    }

    return null;
  }

  function getRoot() {
    return document.getElementById(FRIENDS_ROOT_ID);
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (character) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return entities[character];
    });
  }

  function getInitials(name) {
    const cleaned = String(name || "Friend").trim();

    if (!cleaned) return "F";

    return cleaned
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join("")
      .toUpperCase();
  }

  function renderMessage(message, type) {
    const root = getRoot();
    if (!root) return;

    root.innerHTML = `
      <div class="U9-friends-state U9-friends-state-${escapeHTML(type || "info")}">
        ${escapeHTML(message)}
      </div>
    `;
  }

  function getAvatarURL(friend) {
    return (
      friend.avatar_url ||
      friend.avatar ||
      friend.profile_image ||
      friend.photo_url ||
      ""
    );
  }

  function renderFriends(friends) {
    const root = getRoot();
    if (!root) return;

    if (!friends.length) {
      root.innerHTML = `
        <div class="U9-friends-empty">
          <div class="U9-friends-empty-icon">♧</div>
          <div class="U9-friends-empty-title">No friends yet</div>
          <div class="U9-friends-empty-description">
            Your accepted friends will appear here.
          </div>
        </div>
      `;
      return;
    }

    root.innerHTML = `
      <div class="U9-friends-page">
        <div class="U9-friends-heading">
          <div class="U9-friends-title">Friends</div>
          <div class="U9-friends-count">
            ${friends.length} ${friends.length === 1 ? "friend" : "friends"}
          </div>
        </div>

        <div class="U9-friends-list">
          ${friends.map(friend => {
            const username = friend.username || "User";
            const account = friend.account || "";
            const avatarURL = getAvatarURL(friend);

            const avatarHTML = avatarURL
              ? `<img class="U9-friend-avatar-image"
                      src="${escapeHTML(avatarURL)}"
                      alt=""
                      loading="lazy">`
              : `<div class="U9-friend-avatar-fallback">
                   ${escapeHTML(getInitials(username))}
                 </div>`;

            return `
              <article class="U9-friend-card"
                       data-friend-id="${escapeHTML(friend.id)}">

                <div class="U9-friend-avatar">
                  ${avatarHTML}
                </div>

                <div class="U9-friend-info">
                  <div class="U9-friend-name">
                    ${escapeHTML(username)}
                  </div>
                  <div class="U9-friend-account">
                    ${account ? `@${escapeHTML(account)}` : "Friend"}
                  </div>
                </div>

                <button
                  class="U9-friend-chat-button"
                  type="button"
                  data-chat-friend-id="${escapeHTML(friend.id)}"
                >
                  Chat
                </button>
              </article>
            `;
          }).join("")}
        </div>
      </div>
    `;

    bindChatButtons(friends);
  }

  function bindChatButtons(friends) {
    const root = getRoot();
    if (!root) return;

    root.querySelectorAll("[data-chat-friend-id]").forEach(button => {
      button.addEventListener("click", function () {
        const friendId = button.dataset.chatFriendId;
        const friend = friends.find(item => item.id === friendId);

        if (!friend) return;

        if (typeof window.openMessageChat !== "function") {
          console.error(
            "U9 Friends: window.openMessageChat() is unavailable. " +
            "Check that normal-message.js is loaded."
          );

          return;
        }

        // The Chat page's own back button returns to the Friends page.
        window.messageChatReturnPage = "friends";

        window.openMessageChat({
          id: friend.id,
          name: friend.username || "User",
          avatar: getAvatarURL(friend),
          status: "Friend",
          type: "friend"
        });
      });
    });

    // If an avatar fails to load, replace it with initials.
    root.querySelectorAll(".U9-friend-avatar-image").forEach(image => {
      image.addEventListener("error", function () {
        const friendCard = image.closest(".U9-friend-card");
        const nameElement = friendCard
          ? friendCard.querySelector(".U9-friend-name")
          : null;

        const name = nameElement
          ? nameElement.textContent
          : "Friend";

        const fallback = document.createElement("div");
        fallback.className = "U9-friend-avatar-fallback";
        fallback.textContent = getInitials(name);

        image.replaceWith(fallback);
      }, { once: true });
    });
  }

  async function loadFriends() {
    const root = getRoot();
    if (!root || isLoading) return;

    const supabase = getSupabase();
    if (!supabase || typeof supabase.from !== "function") {
      renderMessage(
        "Supabase is not ready. Please try again.",
        "error"
      );
      console.error("U9 Friends: Supabase client not found.");
      return;
    }

    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      renderMessage(
        "Please sign in to view your friends.",
        "error"
      );
      return;
    }

    isLoading = true;
    renderMessage("Loading friends...", "loading");

    try {
      // The table stores one row per friendship, with the smaller UUID
      // in user_id and the larger UUID in friend_id.
      const { data: relations, error: relationError } = await supabase
        .from(FRIENDS_TABLE)
        .select("user_id, friend_id, created_at")
        .or(
          `user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`
        )
        .order("created_at", { ascending: false });

      if (relationError) throw relationError;

      if (!relations || relations.length === 0) {
        renderFriends([]);
        return;
      }

      const friendIds = [
        ...new Set(
          relations
            .map(relation =>
              relation.user_id === currentUserId
                ? relation.friend_id
                : relation.user_id
            )
            .filter(Boolean)
        )
      ];

      if (friendIds.length === 0) {
        renderFriends([]);
        return;
      }

      const { data: users, error: usersError } = await supabase
        .from(USER_TABLE)
        .select("id, username, account, avatar_url, avatar, profile_image, photo_url")
        .in("id", friendIds);

      if (usersError) throw usersError;

      const userMap = new Map(
        (users || []).map(user => [user.id, user])
      );

      // Keep only users whose profiles were returned by Supabase.
      const friends = friendIds
        .map(id => userMap.get(id))
        .filter(Boolean);

      renderFriends(friends);

    } catch (error) {
      console.error("U9 Friends: Failed to load friends.", error);

      renderMessage(
        "Could not load friends. Check your database permissions and try again.",
        "error"
      );
    } finally {
      isLoading = false;
    }
  }

  function initializeFriendsPage() {
    if (!getRoot()) {
      console.warn(
        "U9 Friends: #Message-model-friends-root was not found."
      );
      return;
    }

    friendsInitialized = true;
    loadFriends();
  }

  // Called by the Message navigation code when the Friend page opens.
  window.initializeFriendsPage = initializeFriendsPage;

  // Allows the page to be refreshed after a friendship is added.
  window.refreshFriendsPage = function () {
    if (friendsInitialized) {
      return loadFriends();
    }

    initializeFriendsPage();
  };

})();
