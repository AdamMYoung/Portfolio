import { Html } from "@react-three/drei";

import { useGallery } from "./state";

// The wall label. Sits just under whichever frame the visitor is closest to,
// facing the same way as the artwork, carrying the shot's own EXIF and a
// running ❤️ tally. One DOM node, mounted only while a piece is in focus.
export const Placard = () => {
  const target = useGallery((s) => s.target);
  const hearts = useGallery((s) => (target ? (s.hearts[target.image.path] ?? 0) : 0));
  if (!target) return null;

  const { image, position, rotationY } = target;
  const sign = Math.sign(position[0]) || 1;
  const e = image.exif;
  const ok = (v: string | null | undefined): v is string => !!v && v !== "N/A";
  // Scanned film reports the scanner, not a camera — don't pretend otherwise.
  const isScan = /noritsu|scanner|controller/i.test(`${e.make} ${e.model}`);
  const title = isScan ? "Untitled" : [e.make, e.model].filter(ok).join(" ") || "Untitled";
  const specs = isScan
    ? []
    : [e.focalLength, e.aperture, e.exposure, ok(e.iso) ? `ISO ${e.iso}` : null].filter(ok);

  return (
    <Html
      position={[position[0] - sign * 0.08, position[1] - target.height / 2 - 0.42, position[2]]}
      rotation={[0, rotationY, 0]}
      transform
      distanceFactor={2.4}
      occlude
      pointerEvents="none"
      className="pointer-events-none select-none"
      style={{ width: "170px" }}
    >
      <div
        style={{
          fontFamily: "var(--font-baskerville), Georgia, serif",
          background: "rgba(20,18,16,0.82)",
          color: "#f3efe6",
          padding: "6px 9px",
          borderRadius: "2px",
          lineHeight: 1.3,
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div style={{ fontSize: "11px", letterSpacing: "0.02em" }}>{title}</div>
        {specs.length > 0 && (
          <div style={{ fontSize: "9px", opacity: 0.7, marginTop: "2px" }}>
            {specs.join("  ·  ")}
          </div>
        )}
        <div style={{ fontSize: "9px", opacity: 0.85, marginTop: "3px" }}>
          <b>E</b> inspect · <b>F</b> react{hearts > 0 && `  ·  ❤️ ${hearts}`}
        </div>
      </div>
    </Html>
  );
};
