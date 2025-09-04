export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  placeholderDataUrl: string; // sehr kleines Base64-LQIP
  ext: "webp" | "jpg";
};

export async function readFileAsImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    return img;
  } finally {
    // URL nicht sofort revoken, wir brauchen sie evtl. noch für Preview
  }
}

export async function processImage(
  file: File,
  opts: { maxW?: number; maxH?: number; quality?: number } = {}
): Promise<ProcessedImage> {
  const { maxW = 1600, maxH = 1600, quality = 0.86 } = opts;
  const img = await readFileAsImage(file);

  const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
  const targetW = Math.round(img.width * ratio);
  const targetH = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, targetW, targetH);

  // großes Bild als WebP (Fallback: JPEG)
  let blob: Blob;
  try {
    blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/webp", quality)
    );
    if (!blob) throw new Error("webp failed");
  } catch {
    blob = await new Promise<Blob>((resolve) =>
      canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
    );
  }

  // sehr kleines Placeholder (LQIP), z.B. 24px Breite
  const phW = 24;
  const phH = Math.max(1, Math.round((targetH / targetW) * phW));
  const phCanvas = document.createElement("canvas");
  phCanvas.width = phW;
  phCanvas.height = phH;
  const phCtx = phCanvas.getContext("2d")!;
  phCtx.drawImage(canvas, 0, 0, phW, phH);
  const placeholderDataUrl = phCanvas.toDataURL("image/jpeg", 0.6);

  return {
    blob,
    width: targetW,
    height: targetH,
    placeholderDataUrl,
    ext: blob.type.includes("webp") ? "webp" : "jpg",
  };
}
