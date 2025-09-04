import { useCallback, useRef, useState } from "react";

type Props = {
  label?: string;
  value?: File | null;
  onChange: (file: File | null) => void;
  initialPreviewUrl?: string; // bereits gespeichertes Bild
};

export function ImagePicker({ label = "Gerichtsfoto", value, onChange, initialPreviewUrl }: Props) {
  const [preview, setPreview] = useState<string | null>(initialPreviewUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      alert("Bitte ein Bild auswählen.");
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      alert("Bitte ein Bild unter 12 MB.");
      return;
    }
    onChange(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, [onChange]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div
        className="relative rounded-2xl border border-border bg-muted/40 p-4 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e)=>{ e.preventDefault(); }}
        onDrop={onDrop}
      >
        {preview ? (
          <img
            src={preview}
            alt="Vorschau"
            className="mx-auto aspect-video w-full max-w-xl rounded-xl object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="py-10 text-sm text-muted-foreground">
            <div className="mb-2 font-medium">Bild hierher ziehen</div>
            <div>oder klicken, um ein Bild auszuwählen (JPG/PNG/HEIC/WebP)</div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
      {preview && (
        <div className="mt-2 text-xs text-muted-foreground">
          Tipp: Du kannst ein neues Bild ziehen/auswählen, um es zu ersetzen.
        </div>
      )}
    </div>
  );
}
