import type { NextApiRequest, NextApiResponse } from "next";
import { ImageResponse } from "next/og";

// 180×180 PNG for apple-touch-icon / the web manifest — the repo only ships
// a legacy favicon.ico otherwise.
export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const image = new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#141414",
        color: "#f5f2ea",
        fontSize: 104,
        fontWeight: 700,
        fontFamily: "Georgia, serif",
      }}
    >
      AY
    </div>,
    { width: 180, height: 180 }
  );

  res.setHeader("Content-Type", "image/png");
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  res.end(Buffer.from(await image.arrayBuffer()));
}
