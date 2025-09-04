export type ProcessedImage = {
  blob: Blob;
  width: number;
  height: number;
  placeholderDataUrl: string; // sehr kleines Base64 (LQIP)
  ext: "webp" | "jpg";
};

/**
 * Bild auf maximal 1600px Kantenlänge skalieren,
 * als WebP (Fallback JPEG) exportieren und ein kleines LQIP erzeugen.
 */
export async function processImage(file: File, maxEdge = 1600): Promise<ProcessedImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });

    const scale = Math.min(maxEdge / img.width, maxEdge / img.height, 1);
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);

    // großes Bild -> bevorzugt WebP
    let blob: Blob | null = await new Promise((ok) => canvas.toBlob((b) => ok(b), "image/webp", 0.86));
    if (!blob) {
      blob = await new Promise((ok) => canvas.toBlob((b) => ok(b), "image/jpeg", 0.9));
    }

    // kleines Placeholder (LQIP) – ~24px Breite
    const phW = 24;
    const phH = Math.max(1, Math.round((h / w) * phW));
    const ph = document.createElement("canvas");
    ph.width = phW; ph.height = phH;
    ph.getContext("2d")!.drawImage(canvas, 0, 0, phW, phH);
    const placeholderDataUrl = ph.toDataURL("image/jpeg", 0.6);

    return {
      blob: blob!,
      width: w,
      height: h,
      placeholderDataUrl,
      ext: blob!.type.includes("webp") ? "webp" : "jpg",
    };
  } finally {
    // URL bewusst nicht sofort revoke'n, damit Preview weiter funktioniert
  }
}
