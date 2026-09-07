import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

// "AY" monogram on the site's dark ground — a real PNG favicon alongside the
// legacy /favicon.ico.
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#05010f",
        color: "#9d8bff",
        fontSize: 30,
        fontWeight: 700,
        fontFamily: "monospace",
      }}
    >
      AY
    </div>,
    size
  );
}
