import type { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

// Generated social card. `?title=` sets the line under the wordmark; falls
// back to a plain portfolio card. Cream-on-charcoal to match the site.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = Array.isArray(req.query.title) ? req.query.title[0] : req.query.title;
  const title = (raw ?? "").slice(0, 90);

  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "90px",
        background: "#f5f2ea",
        color: "#141414",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 14, color: "#8a8175" }}>PHOTOGRAPHY</div>
      <div style={{ fontSize: 118, fontWeight: 700, marginTop: 6 }}>Adam Young</div>
      {title ? <div style={{ fontSize: 40, marginTop: 18, color: "#4a4640" }}>{title}</div> : null}
      <div style={{ display: "flex", marginTop: "auto", fontSize: 26, color: "#8a8175" }}>
        photography.adammyoung.com
      </div>
    </div>,
    { width: 1200, height: 630 }
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=86400, s-maxage=604800, immutable");
  res.end(Buffer.from(await image.arrayBuffer()));
}
