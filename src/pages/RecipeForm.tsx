import { useState } from "react";
import { supabase } from "../lib/supabase";
import { processImage } from "../utils/image";
import { ImagePicker } from "../components/ImagePicker";

type RecipeInput = {
  id?: string;
  title: string;
  ingredients: string[];  // so wie bei dir
  steps?: string;
  // neue Felder
  image_url?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  image_placeholder?: string | null;
};

export default function RecipeForm({ initial }: { initial?: RecipeInput }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? [""]);
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveRecipe() {
    if (!title.trim()) { alert("Titel fehlt."); return; }
    if (ingredients.filter(Boolean).length === 0) { alert("Mindestens eine Zutat."); return; }

    setSaving(true);
    try {
      let imageMeta: Partial<RecipeInput> = {};

      if (file) {
        // 1) Bild komprimieren + LQIP
        const processed = await processImage(file);

        // 2) Pfad bauen
        const idPart = crypto.randomUUID();
        const path = `${idPart}.${processed.ext}`; // z.B. 8e...d4.webp

        // 3) Upload zu Supabase Storage
        const { error: upErr } = await supabase
          .storage
          .from("recipe-images")
          .upload(path, processed.blob, {
            contentType: processed.blob.type,
            upsert: false,
          });
        if (upErr) throw upErr;

        // 4) Public URL
        const { data } = supabase
          .storage
          .from("recipe-images")
          .getPublicUrl(path);

        imageMeta = {
          image_url: data.publicUrl,
          image_width: processed.width,
          image_height: processed.height,
          image_placeholder: processed.placeholderDataUrl,
        };
      }

      // 5) Insert/Update in DB
      const payload: RecipeInput = {
        title,
        ingredients, // achte darauf: nicht null (dein früherer Fehler)
        steps,
        ...imageMeta,
      };

      if (initial?.id) {
        const { error } = await supabase.from("recipes").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("recipes").insert(payload);
        if (error) throw error;
      }

      alert("Rezept gespeichert.");
      // navigate zur Liste …
    } catch (e: any) {
      console.error(e);
      alert("Speichern fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* …deine anderen Felder… */}
      <ImagePicker value={file} onChange={setFile} initialPreviewUrl={initial?.image_url ?? undefined} />

      <div className="flex gap-2">
        <button
          onClick={saveRecipe}
          disabled={saving}
          className="rounded-xl bg-brand px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
        <a href="/" className="rounded-xl border border-border px-4 py-2">Abbrechen</a>
      </div>
    </div>
  );
}
