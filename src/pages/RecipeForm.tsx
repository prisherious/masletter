import { useState } from "react";
import { supabase } from "../lib/supabase";
import { processImage } from "../utils/image";
import { ImagePicker } from "../components/ImagePicker";
import type { RecipeInsert, RecipeRow } from "../types/recipe";

type Props = { initial?: RecipeRow };

export default function RecipeForm({ initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ingredientsText, setIngredientsText] = useState(
    (initial?.ingredients ?? []).join("\n")
  );
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function saveRecipe() {
    if (!title.trim()) return alert("Titel fehlt.");
    const ingredientsArray = ingredientsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    if (ingredientsArray.length === 0) return alert("Mindestens eine Zutat angeben.");

    setSaving(true);
    try {
      let imageMeta: Partial<RecipeInsert> = {};

      if (file) {
        const processed = await processImage(file, 1600);
        const path = `${crypto.randomUUID()}.${processed.ext}`;

        const { error: upErr } = await supabase
          .storage
          .from("recipe-images")
          .upload(path, processed.blob, { contentType: processed.blob.type });
        if (upErr) throw upErr;

        const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);

        imageMeta = {
          image_url: data.publicUrl,
          image_width: processed.width,
          image_height: processed.height,
          image_placeholder: processed.placeholderDataUrl,
        };
      }

      const payload: RecipeInsert = {
        title: title.trim(),
        ingredients: ingredientsArray,         // WICHTIG: nie null!
        steps: steps.trim() || null,
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
      // TODO: navigate zur Liste/Detail
    } catch (e: any) {
      console.error(e);
      alert("Speichern fehlgeschlagen: " + (e?.message ?? e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Titel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none ring-0 focus:border-gray-400"
          placeholder="z. B. Cremige Pilz-Pasta"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Zutaten (eine pro Zeile)</label>
        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none ring-0 focus:border-gray-400"
          placeholder={"200 g Nudeln\n1 Zwiebel\n200 g Champignons\n200 ml Sahne\nSalz, Pfeffer"}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Zubereitung</label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none ring-0 focus:border-gray-400"
          placeholder={"1) Zwiebel würfeln und anbraten…\n2) Pilze zugeben…\n3) Sahne unterrühren…"}
        />
      </div>

      <ImagePicker initialPreviewUrl={initial?.image_url ?? undefined} onChange={setFile} />

      <div className="flex gap-2">
        <button
          onClick={saveRecipe}
          disabled={saving}
          className="inline-flex items-center rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
        <a href="/" className="inline-flex items-center rounded-xl border border-gray-300 px-4 py-2">
          Abbrechen
        </a>
      </div>
    </div>
  );
}
