import { Html } from "@react-three/drei";

import { useGallery } from "./state";

// The wall label. Floats beside whichever frame the visitor is closest to,
// carrying the shot's own EXIF and a running ❤️ tally. One DOM node, mounted
// only while a piece is in focus.
export const Placard = () => {
  const target = useGallery((s) => s.target);
  const hearts = useGallery((s) => (target ? (s.hearts[target.image.path] ?? 0) : 0));
  if (!target) return null;

  const { image, position, width } = target;
  const sign = Math.sign(position[0]) || 1;
  const e = image.exif;
  const specs = [e.focalLength, e.aperture, e.exposure, e.iso && `ISO ${e.iso}`].filter(Boolean);

  return (
    <Html
      position={[
        position[0] - sign * 0.12,
        position[1] - target.height / 2 - 0.5,
        position[2] + width / 2 + 0.35,
      ]}
      transform
      distanceFactor={5}
      occlude
      pointerEvents="none"
      className="pointer-events-none select-none"
      style={{ width: "260px" }}
    >
      <div
        style={{
          fontFamily: "var(--font-baskerville), Georgia, serif",
          background: "rgba(20,18,16,0.82)",
          color: "#f3efe6",
          padding: "10px 14px",
          borderRadius: "3px",
          lineHeight: 1.35,
          boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          backdropFilter: "blur(2px)",
        }}
      >
        <div style={{ fontSize: "15px", letterSpacing: "0.02em" }}>
          {[e.make, e.model].filter(Boolean).join(" ") || "Untitled"}
        </div>
        {specs.length > 0 && (
          <div style={{ fontSize: "11px", opacity: 0.7, marginTop: "3px" }}>
            {specs.join("  ·  ")}
          </div>
        )}
        <div style={{ fontSize: "11px", opacity: 0.85, marginTop: "6px" }}>
          Press <b>E</b> to inspect · <b>F</b> to react{hearts > 0 && `  ·  ❤️ ${hearts}`}
        </div>
      </div>
    </Html>
  );
};
