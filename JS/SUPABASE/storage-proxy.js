/* U9 public Storage URL rewrite.
 * Convert public image URLs from the known Supabase projects to this Vercel origin.
 * This affects image URLs only; API calls and authentication are handled separately.
 */
(function () {
  "use strict";
  if (window.__U9StorageProxyInstalled) return;
  window.__U9StorageProxyInstalled = true;

  const HOST_PROJECT = {
    "tvtakmswbzawaweytimx.supabase.co": "u9",
    "uiwttxqdoplttyrfqcbb.supabase.co": "products"
  };
  const ORIGINAL = HTMLImageElement.prototype;
  const srcDescriptor = Object.getOwnPropertyDescriptor(ORIGINAL, "src");

  function rewrite(value) {
    if (typeof value !== "string" || !value) return value;
    try {
      const url = new URL(value, window.location.href);
      const project = HOST_PROJECT[url.hostname.toLowerCase()];
      if (!project || url.pathname.indexOf("/storage/v1/object/public/") !== 0) return value;
      const objectPath = url.pathname.slice("/storage/v1/object/public/".length);
      if (!objectPath) return value;
      const prefix = "/api/storage/" + project + "/";
      return prefix + objectPath.split("/").map((part) => encodeURIComponent(decodeURIComponent(part))).join("/") + url.search + url.hash;
    } catch (_) {
      return value;
    }
  }

  if (srcDescriptor && srcDescriptor.get && srcDescriptor.set && srcDescriptor.configurable) {
    Object.defineProperty(ORIGINAL, "src", {
      configurable: srcDescriptor.configurable,
      enumerable: srcDescriptor.enumerable,
      get: function () { return srcDescriptor.get.call(this); },
      set: function (value) { srcDescriptor.set.call(this, rewrite(value)); }
    });
  }

  const originalSetAttribute = ORIGINAL.setAttribute;
  ORIGINAL.setAttribute = function (name, value) {
    if (String(name).toLowerCase() === "src") value = rewrite(String(value));
    return originalSetAttribute.call(this, name, value);
  };

  function rewriteImage(img) {
    if (!(img instanceof HTMLImageElement)) return;
    const raw = img.getAttribute("src");
    if (!raw) return;
    const next = rewrite(raw);
    if (next !== raw) originalSetAttribute.call(img, "src", next);
  }

  function scan(node) {
    if (!node || node.nodeType !== 1) return;
    if (node instanceof HTMLImageElement) rewriteImage(node);
    if (node.querySelectorAll) node.querySelectorAll("img[src]").forEach(rewriteImage);
  }

  // Catch images created by HTML parsing and attributes changed by other modules.
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === "attributes") scan(record.target);
      for (const node of record.addedNodes || []) scan(node);
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  document.addEventListener("DOMContentLoaded", () => scan(document.documentElement));
})();
