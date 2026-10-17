const STORAGE_PROJECTS = {
  // U9 avatars, frames and other public assets.
  u9: "https://tvtakmswbzawaweytimx.supabase.co",
  // Existing product-photo assets belong to a separate Supabase project.
  products: "https://uiwttxqdoplttyrfqcbb.supabase.co"
};

module.exports = async function handler(req, res) {
  const method = String(req.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("Allow", "GET, HEAD");
    return res.status(405).end("Method not allowed");
  }

  const projectValue = req.query && req.query.project;
  const project = Array.isArray(projectValue) ? projectValue[0] : projectValue;
  const upstreamBase = STORAGE_PROJECTS[project];
  if (!upstreamBase) return res.status(404).end("Unknown storage project");

  let parts = req.query && req.query.path;
  if (!Array.isArray(parts)) parts = parts ? [parts] : [];
  if (!parts.length || parts.some((part) => !part || part === "." || part === ".." || part.includes("\\"))) {
    return res.status(400).end("Invalid storage path");
  }

  // Only public objects are proxied; no signed/private storage paths are accepted.
  const objectPath = parts.map((part) => encodeURIComponent(String(part))).join("/");
  const incomingUrl = new URL(req.url, "https://u9-local.invalid");
  const upstreamUrl = `${upstreamBase}/storage/v1/object/public/${objectPath}`;
  const queryIndex = incomingUrl.search.indexOf("?");
  if (queryIndex >= 0) {
    const query = new URLSearchParams(incomingUrl.search.slice(queryIndex + 1));
    query.delete("project");
    query.delete("path");
    const queryString = query.toString();
    if (queryString) {
      // Rebuild from URLSearchParams to preserve image transformation/query options.
      try {
        const url = new URL(upstreamUrl);
        url.search = queryString;
        return await proxyFetch(url, req, res, method);
      } catch (error) {
        console.error("Storage proxy URL error:", error);
        return res.status(400).end("Invalid storage URL");
      }
    }
  }
  return await proxyFetch(new URL(upstreamUrl), req, res, method);
};

async function proxyFetch(upstreamUrl, req, res, method) {
  const headers = {};
  for (const name of ["range", "if-none-match", "if-modified-since", "accept"]) {
    if (req.headers[name]) headers[name] = req.headers[name];
  }

  try {
    const upstream = await fetch(upstreamUrl.toString(), { method, headers, redirect: "follow" });
    for (const name of ["content-type", "content-length", "content-range", "accept-ranges", "etag", "last-modified"]) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    // Public image assets can be cached; errors are not cached.
    if (upstream.ok) {
      res.setHeader("Cache-Control", upstream.headers.get("cache-control") || "public, max-age=3600, s-maxage=86400");
    } else {
      res.setHeader("Cache-Control", "no-store");
    }
    if (method === "HEAD" || upstream.status === 204 || upstream.status === 304) {
      return res.status(upstream.status).end();
    }
    const bytes = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(bytes);
  } catch (error) {
    console.error("U9 public storage proxy failed:", error);
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: "Unable to connect to public asset storage" });
  }
}

module.exports.config = { api: { bodyParser: false } };
