import { Html } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";

type Burst = { id: number; position: [number, number, number] };

// Transient ❤️ that rise off a piece when the visitor reacts. Driven by
// window events (see `emitReaction`) so anything — a key, a HUD button, an
// NPC — can throw one without wiring a prop through the tree.
export const Reactions = () => {
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    const onReact = (evt: Event) => {
      const detail = (evt as CustomEvent<{ position: [number, number, number] }>).detail;
      if (!detail) return;
      const id = nextId.current++;
      setBursts((b) => [...b, { id, position: detail.position }]);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1600);
    };
    window.addEventListener("pg:react", onReact);
    return () => window.removeEventListener("pg:react", onReact);
  }, []);

  return (
    <>
      {bursts.map((burst) => (
        <Html
          key={burst.id}
          position={burst.position}
          center
          pointerEvents="none"
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              fontSize: `${22 + Math.random() * 10}px`,
              animation: "pg-heart 1.6s ease-out forwards",
              filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.4))",
            }}
          >
            ❤️
          </div>
        </Html>
      ))}
    </>
  );
};
