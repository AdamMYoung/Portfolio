import {
  Bloom,
  BrightnessContrast,
  EffectComposer,
  HueSaturation,
  N8AO,
  SMAA,
  Vignette,
} from "@react-three/postprocessing";

import { useGallery } from "./state";

// The single biggest change to how the gallery reads: contact shadows from
// N8AO, glow on the lamps and skylights from Bloom, a gentle grade and a
// vignette to pull the eye in. Whole stack drops on "lite".
export const PostFx = () => {
  const quality = useGallery((s) => s.quality);
  const timeOfDay = useGallery((s) => s.timeOfDay);
  const evening = timeOfDay === "evening";

  if (quality !== "high") return null;

  return (
    <EffectComposer enableNormalPass multisampling={0}>
      <N8AO
        quality="performance"
        halfRes
        aoRadius={1.4}
        intensity={evening ? 3 : 2}
        distanceFalloff={1}
      />
      <Bloom
        mipmapBlur
        luminanceThreshold={evening ? 0.6 : 0.9}
        luminanceSmoothing={0.25}
        intensity={evening ? 1.0 : 0.4}
      />
      <HueSaturation saturation={evening ? -0.04 : 0.04} hue={0} />
      <BrightnessContrast brightness={evening ? -0.04 : 0} contrast={0.07} />
      <Vignette offset={0.3} darkness={evening ? 0.78 : 0.5} eskil={false} />
      <SMAA />
    </EffectComposer>
  );
};
