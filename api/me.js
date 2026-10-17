const UPSTREAM_URL = "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/me";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const headers = {};
    const contentType = req.headers["content-type"];
    if (contentType) headers["Content-Type"] = contentType;

    if (req.headers.authorization) headers["Authorization"] = req.headers.authorization;
    if (req.headers.cookie) headers["Cookie"] = req.headers.cookie;

    const upstream = await fetch(UPSTREAM_URL, {
      method: "GET",
      headers,

      redirect: "manual"
    });

    const contentTypeOut = upstream.headers.get("content-type");
    if (contentTypeOut) res.setHeader("Content-Type", contentTypeOut);

    // Preserve the U9 session cookie on the user's own Vercel domain.
    let cookies = [];
    if (typeof upstream.headers.getSetCookie === "function") {
      cookies = upstream.headers.getSetCookie();
    } else {
      const cookie = upstream.headers.get("set-cookie");
      if (cookie) cookies = [cookie];
    }
    if (cookies.length) res.setHeader("Set-Cookie", cookies);

    const responseBody = await upstream.text();
    return res.status(upstream.status).send(responseBody);
  } catch (error) {
    console.error("U9 me proxy failed:", error);
    return res.status(502).json({ error: "Unable to connect to authentication service" });
  }
};
