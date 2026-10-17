const UPSTREAM_URL = "https://tvtakmswbzawaweytimx.supabase.co/functions/v1/login";

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const headers = {};
    const contentType = req.headers["content-type"];
    if (contentType) headers["Content-Type"] = contentType;


    const body = typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? {});
    const upstream = await fetch(UPSTREAM_URL, {
      method: "POST",
      headers,
      body,
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
    console.error("U9 login proxy failed:", error);
    return res.status(502).json({ error: "Unable to connect to authentication service" });
  }
};
