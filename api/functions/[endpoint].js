const SUPABASE_FUNCTIONS_BASE = "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/";

// Explicit allowlist: this endpoint is not an unrestricted URL proxy.
const ALLOWED_FUNCTIONS = new Set([
  "logout",
  "message-api",
  "group-api",
  "avatar-free",
  "avatar-set",
  "avatar-frame-default",
  "avatar-frame-free",
  "avatar-frame-paid",
  "avatar-frame-equip",
  "avatar-frame-paid-purchase",
  "avatar-upload",
  "u9-exchange"
]);

async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  const endpointValue = req.query && req.query.endpoint;
  const endpoint = Array.isArray(endpointValue) ? endpointValue[0] : endpointValue;

  if (!endpoint || !ALLOWED_FUNCTIONS.has(endpoint)) {
    return res.status(404).json({ error: "Unknown API endpoint" });
  }

  const method = String(req.method || "GET").toUpperCase();
  if (!["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"].includes(method)) {
    res.setHeader("Allow", "GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const incomingUrl = new URL(req.url, "https://u9-local.invalid");
    const upstreamUrl = new URL(encodeURIComponent(endpoint), SUPABASE_FUNCTIONS_BASE);
    incomingUrl.searchParams.forEach((value, key) => upstreamUrl.searchParams.append(key, value));

    const headers = {};
    const passHeaders = [
      "authorization",
      "apikey",
      "content-type",
      "accept",
      "cookie",
      "x-client-info",
      "x-supabase-api-version",
      "prefer",
      "range",
      "x-upsert"
    ];
    for (const name of passHeaders) {
      const value = req.headers[name];
      if (value !== undefined) headers[name] = value;
    }

    let body;
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      if (chunks.length) body = Buffer.concat(chunks);
    }

    const upstream = await fetch(upstreamUrl.toString(), {
      method,
      headers,
      body: body && body.length ? body : undefined,
      redirect: "manual"
    });

    const contentType = upstream.headers.get("content-type");
    if (contentType) res.setHeader("Content-Type", contentType);
    const cacheControl = upstream.headers.get("cache-control");
    if (cacheControl) res.setHeader("Cache-Control", cacheControl);
    const disposition = upstream.headers.get("content-disposition");
    if (disposition) res.setHeader("Content-Disposition", disposition);

    let cookies = [];
    if (typeof upstream.headers.getSetCookie === "function") {
      cookies = upstream.headers.getSetCookie();
    } else {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) cookies = [cookie];
    }
    if (cookies.length) res.setHeader("Set-Cookie", cookies);

    if (method === "HEAD" || upstream.status === 204 || upstream.status === 304) {
      return res.status(upstream.status).end();
    }
    const responseBytes = Buffer.from(await upstream.arrayBuffer());
    return res.status(upstream.status).send(responseBytes);
  } catch (error) {
    console.error(`U9 ${endpoint} proxy failed:`, error);
    return res.status(502).json({ error: "Unable to connect to U9 service" });
  }
}

module.exports = handler;
module.exports.config = { api: { bodyParser: false } };

