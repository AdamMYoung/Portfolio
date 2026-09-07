import { ImageResponse } from "next/og";
import { JOB_TITLE, PERSON_NAME, SITE_URL } from "./site";

export const alt = "Adam Young — Senior Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Generated at build/request time — no binary asset to keep in sync. A dark
// CRT-tinted card that matches the site's theme-color.
export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#05010f",
        backgroundImage:
          "radial-gradient(1200px 600px at 80% -10%, rgba(122,92,255,0.35), transparent), radial-gradient(900px 500px at -10% 110%, rgba(255,64,160,0.25), transparent)",
        color: "#f5f2ff",
        fontFamily: "monospace",
      }}
    >
      <div style={{ fontSize: 30, letterSpacing: 8, color: "#9d8bff" }}>PORTFOLIO</div>
      <div style={{ fontSize: 104, fontWeight: 700, marginTop: 8, lineHeight: 1.05 }}>
        {PERSON_NAME}
      </div>
      <div style={{ fontSize: 44, marginTop: 12, color: "#c9c2ee" }}>{JOB_TITLE}</div>
      <div style={{ display: "flex", marginTop: "auto", fontSize: 26, color: "#6f67a6" }}>
        {SITE_URL.replace("https://", "")}
      </div>
    </div>,
    size
  );
}
