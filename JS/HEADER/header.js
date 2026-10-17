/* =========================================================
 * U9 HEADER SYSTEM
 * File: JS/HEADER/header.js
 *
 * 功能：
 * 1. 初始化 Header 登录状态
 * 2. 通过同域 /api/me 获取当前用户
 * 3. 显示登录、注册、用户名按钮
 * 4. 刷新页面后恢复登录状态
 * 5. 提供 window.U9User 公共接口
 * 6. 监听登录、注册、退出事件并刷新 Header
 * 7. 点击用户按钮打开个人资料弹窗
 * ========================================================= */

(function () {
  "use strict";

  // 防止重复初始化
  if (window.__U9_HEADER_INITIALIZED__) {
    return;
  }
  window.__U9_HEADER_INITIALIZED__ = true;

  /* =========================
   * API 配置
   * ========================= */

  const API = {
    me: "/api/me",
    logout: "/api/logout"
  };

  /* =========================
   * HTML 元素
   * ========================= */

  const ELEMENTS = {
    loading: "U9-page-header-loading",
    register: "U9-page-header-register",
    login: "U9-page-header-login",
    user: "U9-page-header-user",
    username: "U9-page-header-username"
  };

  let currentUser = null;
  let requestController = null;
  let refreshSequence = 0;

  /* =========================
   * 基础工具
   * ========================= */

  function getElement(id) {
    return document.getElementById(id);
  }

  function getToken() {
    try {
      return localStorage.getItem("u9_token") || "";
    } catch (error) {
      console.warn("[U9 Header] 无法读取登录 Token：", error);
      return "";
    }
  }

  function getHeaders() {
    const headers = {
      Accept: "application/json"
    };

    const token = getToken();

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    return headers;
  }

  function setVisible(element, visible) {
    if (!element) return;

    element.hidden = !visible;
    element.style.display = visible ? "" : "none";
    element.setAttribute("aria-hidden", visible ? "false" : "true");
  }

  function showLoading() {
    setVisible(getElement(ELEMENTS.loading), true);
    setVisible(getElement(ELEMENTS.register), false);
    setVisible(getElement(ELEMENTS.login), false);
    setVisible(getElement(ELEMENTS.user), false);
  }

  function showGuest() {
    setVisible(getElement(ELEMENTS.loading), false);
    setVisible(getElement(ELEMENTS.register), true);
    setVisible(getElement(ELEMENTS.login), true);
    setVisible(getElement(ELEMENTS.user), false);
  }

  function showLoggedIn(user) {
    setVisible(getElement(ELEMENTS.loading), false);
    setVisible(getElement(ELEMENTS.register), false);
    setVisible(getElement(ELEMENTS.login), false);
    setVisible(getElement(ELEMENTS.user), true);

    const usernameElement = getElement(ELEMENTS.username);

    if (usernameElement) {
      usernameElement.textContent = getDisplayName(user);
    }

    const userButton = getElement(ELEMENTS.user);

    if (userButton) {
      userButton.setAttribute("aria-label", "个人资料");
      userButton.setAttribute("title", "个人资料");
    }
  }

  /* =========================
   * 用户数据处理
   * ========================= */

  function normalizeUser(response) {
    if (!response || typeof response !== "object") {
      return null;
    }

    // 常见返回结构：
    // { user: {...} }
    // { data: { user: {...} } }
    // { data: {...} }
    // { profile: {...} }
    // {...用户字段...}

    let user =
      response.user ||
      response.profile ||
      (response.data &&
        (response.data.user || response.data.profile)) ||
      response.data ||
      response;

    if (!user || typeof user !== "object") {
      return null;
    }

    // 明确的未登录响应
    if (
      response.authenticated === false ||
      response.loggedIn === false ||
      user.authenticated === false
    ) {
      return null;
    }

    // 避免把状态消息或空对象当成用户
    const hasIdentity = Boolean(
      user.id ||
      user.user_id ||
      user.uid ||
      user.email ||
      user.username ||
      user.user_name ||
      user.name
    );

    if (!hasIdentity) {
      return null;
    }

    return user;
  }

  function getDisplayName(user) {
    if (!user) return "个人中心";

    const name =
      user.username ||
      user.user_name ||
      user.display_name ||
      user.full_name ||
      user.nickname ||
      user.name ||
      user.email;

    return name ? String(name) : "个人中心";
  }

  /* =========================
   * 用户状态事件
   * ========================= */

  function emitUserChanged(user) {
    window.dispatchEvent(
      new CustomEvent("u9:user-changed", {
        detail: {
          user: user || null,
          loggedIn: Boolean(user)
        }
      })
    );
  }

  function setUser(user) {
    currentUser = user || null;

    if (currentUser) {
      showLoggedIn(currentUser);
    } else {
      showGuest();
    }

    emitUserChanged(currentUser);

    return currentUser;
  }

  function clearUser() {
    currentUser = null;

    showGuest();
    emitUserChanged(null);

    return null;
  }

  /* =========================
   * 获取当前用户
   * ========================= */

  async function fetchCurrentUser() {
    const sequence = ++refreshSequence;

    // 取消上一次未完成的请求
    if (requestController) {
      requestController.abort();
    }

    requestController = new AbortController();

    const response = await fetch(API.me, {
      method: "GET",
      credentials: "include",
      headers: getHeaders(),
      cache: "no-store",
      signal: requestController.signal
    });

    if (response.status === 401 || response.status === 403) {
      return {
        ok: true,
        user: null
      };
    }

    if (!response.ok) {
      throw new Error(
        "获取用户信息失败，HTTP " + response.status
      );
    }

    const result = await response.json();

    // 忽略旧请求的结果
    if (sequence !== refreshSequence) {
      return {
        ok: false,
        stale: true,
        user: currentUser
      };
    }

    // 如果后端使用 success:false 表示未登录
    if (
      result &&
      (
        result.authenticated === false ||
        result.loggedIn === false
      )
    ) {
      return {
        ok: true,
        user: null
      };
    }

    return {
      ok: true,
      user: normalizeUser(result)
    };
  }

  async function refreshUser(options) {
    options = options || {};

    if (!options.silent) {
      showLoading();
    }

    try {
      const result = await fetchCurrentUser();

      if (result.stale) {
        return currentUser;
      }

      return setUser(result.user);
    } catch (error) {
      if (error && error.name === "AbortError") {
        return currentUser;
      }

      console.error("[U9 Header] 获取用户信息失败：", error);

      // 网络故障时不直接清除已有用户状态，
      // 防止临时网络错误造成 Header 闪退。
      if (currentUser) {
        showLoggedIn(currentUser);
      } else {
        showGuest();
      }

      return currentUser;
    }
  }

  /* =========================
   * 个人资料弹窗
   * ========================= */

  function openProfileModal() {
    // 优先使用项目的窗口管理器
    if (
      window.U9WindowManager &&
      typeof window.U9WindowManager.open === "function"
    ) {
      try {
        const result = window.U9WindowManager.open("profile-modal");

        // 同时兼容 Promise 和普通返回值
        Promise.resolve(result).catch(function (error) {
          console.warn(
            "[U9 Header] WindowManager 打开资料弹窗失败：",
            error
          );

          openProfileModalFallback();
        });

        return;
      } catch (error) {
        console.warn(
          "[U9 Header] WindowManager 调用失败：",
          error
        );
      }
    }

    openProfileModalFallback();
  }

  function openProfileModalFallback() {
    const modal = getElement("U9-profile-modal");

    if (!modal) {
      console.warn(
        "[U9 Header] 找不到 U9-profile-modal，请检查 HTML 中的弹窗 ID。"
      );

      // 让其他模块也有机会响应
      window.dispatchEvent(
        new CustomEvent("u9:open-profile", {
          detail: {
            user: currentUser
          }
        })
      );

      return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    modal.removeAttribute("hidden");

    // 兼容常见弹窗样式
    if (getComputedStyle(modal).display === "none") {
      modal.style.display = "flex";
    }

    document.body.classList.add("u9-modal-open");
  }

  /* =========================
   * Header 按钮绑定
   * ========================= */

  function bindHeaderButtons() {
    const userButton = getElement(ELEMENTS.user);

    if (userButton && !userButton.dataset.u9HeaderBound) {
      userButton.dataset.u9HeaderBound = "true";

      userButton.addEventListener("click", function (event) {
        event.preventDefault();
        openProfileModal();
      });
    }

    // 登录和注册按钮由各自的 Modal JS 负责。
    // 这里不重复绑定，避免与现有脚本冲突。
  }

  /* =========================
   * 公共接口
   * ========================= */

  window.U9User = {
    get: function () {
      return currentUser;
    },

    refresh: function (options) {
      return refreshUser(options);
    },

    set: function (user) {
      return setUser(user);
    },

    clear: function () {
      return clearUser();
    },

    isLoggedIn: function () {
      return Boolean(currentUser);
    }
  };

  /* =========================
   * 监听其他模块的登录状态变化
   * ========================= */

  window.addEventListener("u9:auth-changed", function (event) {
    const detail = event.detail || {};

    if (
      detail.loggedIn === false ||
      detail.action === "logout" ||
      detail.type === "logout"
    ) {
      clearUser();
      return;
    }

    if (detail.user) {
      setUser(normalizeUser(detail.user) || detail.user);
      return;
    }

    // 登录或注册完成，但没有传入用户对象时，
    // 重新从后端获取最新状态。
    refreshUser({ silent: true });
  });

  // 如果其他模块使用以下事件，也同步更新 Header。
  window.addEventListener("u9:login-success", function (event) {
    const detail = event.detail || {};

    if (detail.user) {
      setUser(normalizeUser(detail.user) || detail.user);
    } else {
      refreshUser({ silent: true });
    }
  });

  window.addEventListener("u9:register-success", function (event) {
    const detail = event.detail || {};

    if (detail.user) {
      setUser(normalizeUser(detail.user) || detail.user);
    } else {
      refreshUser({ silent: true });
    }
  });

  window.addEventListener("u9:logout-success", function () {
    clearUser();
  });

  /* =========================
   * 初始化
   * ========================= */

  function init() {
    bindHeaderButtons();
    showLoading();
    refreshUser();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, {
      once: true
    });
  } else {
    init();
  }

})();
