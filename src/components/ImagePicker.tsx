import { useRef, useState } from "react";

type Props = {
  label?: string;
  initialPreviewUrl?: string;
  onChange: (file: File | null) => void;
};

export function ImagePicker({ label = "Gerichtsfoto", initialPreviewUrl, onChange }: Props) {
  const [preview, setPreview] = useState<string | undefined>(initialPreviewUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
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
    setPreview(URL.createObjectURL(f));
    onChange(f);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div
        className="rounded-2xl border border-gray-200 bg-neutral-50 p-4 text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
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
          <div className="py-10 text-sm text-gray-500">
            <div className="mb-1 font-medium text-gray-700">Bild hierher ziehen</div>
            <div>oder klicken, um auszuwählen (JPG/PNG/HEIC/WebP)</div>
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
        <div className="mt-2 text-xs text-gray-500">
          Tipp: Ziehe ein neues Bild hinein oder wähle erneut, um zu ersetzen.
        </div>
      )}
    </div>
  );
}
