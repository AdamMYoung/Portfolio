import sharp from "sharp";

export type Color = { r: number; g: number; b: number; hue: number };

// Average the whole image down to a single pixel — cheap, no extra
// network/IO since the caller already has the buffer in memory for EXIF.
export const getDominantColor = async (buffer: ArrayBuffer): Promise<Color> => {
  const { data } = await sharp(Buffer.from(buffer))
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const [r, g, b] = [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0];

  return { r, g, b, hue: rgbToHue(r, g, b) };
};

const rgbToHue = (r: number, g: number, b: number): number => {
  const [rN, gN, bN] = [r / 255, g / 255, b / 255];
  const max = Math.max(rN, gN, bN);
  const min = Math.min(rN, gN, bN);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue: number;
  if (max === rN) hue = ((gN - bN) / delta) % 6;
  else if (max === gN) hue = (bN - rN) / delta + 2;
  else hue = (rN - gN) / delta + 4;

  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
};
