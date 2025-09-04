import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import { processImage } from "../utils/image";
import { ImagePicker } from "../components/ImagePicker";
import type { RecipeRow } from "../types/recipe";

// Lokaler Helper: erzwingt einen Supabase-Client (ohne null-Union im weiteren Code)
function requireSupabase(): SupabaseClient {
  if (!supabase) {
    throw new Error(
      "Supabase ist nicht konfiguriert. Bitte VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY setzen und neu deployen."
    );
  }
  return supabase;
}

type Props = { initial?: RecipeRow };

export default function RecipeForm({ initial }: Props) {
  // ======= Supabase erzwingen & bei Fehler freundlich abbrechen =======
  let sb: SupabaseClient;
  try {
    sb = requireSupabase();
  } catch (e: any) {
    return (
      <div className="p-6 text-red-600">
        {e?.message ?? "Supabase-Konfiguration fehlt."}
      </div>
    );
  }

  // ======= Form-State =======
  const [title, setTitle] = useState(initial?.title ?? "");
  const [ingredientsText, setIngredientsText] = useState(
    (initial?.ingredients ?? []).join("\n")
  );
  const [steps, setSteps] = useState(initial?.steps ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ======= Helpers =======
  function parseIngredients(text: string): string[] {
    return text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  async function uploadImageIfAny(selected: File | null) {
    if (!selected) return null as
      | null
      | {
          image_url: string;
          image_width: number;
          image_height: number;
          image_placeholder: string;
        };

    const processed = await processImage(selected, 1600);
    const path = `${crypto.randomUUID()}.${processed.ext}`;

    const { error: upErr } = await sb
      .storage
      .from("recipe-images") // Bucket-Name
      .upload(path, processed.blob, { contentType: processed.blob.type });
    if (upErr) throw upErr;

    const { data } = sb.storage.from("recipe-images").getPublicUrl(path);

    return {
      image_url: data.publicUrl,
      image_width: processed.width,
      image_height: processed.height,
      image_placeholder: processed.placeholderDataUrl,
    };
  }

  // ======= Save =======
  async function saveRecipe() {
    try {
      setSaving(true);
      setError(null);

      const ing = parseIngredients(ingredientsText);
      if (!title.trim()) throw new Error("Titel fehlt.");
      if (ing.length === 0) throw new Error("Mindestens eine Zutat angeben.");

      const imageMeta = await uploadImageIfAny(file);

      const payload: Partial<RecipeRow> = {
        title: title.trim(),
        ingredients: ing, // WICHTIG: nie null speichern
        steps: steps.trim() ? steps.trim() : null,
        ...(imageMeta ?? {}),
      };

      if (initial?.id) {
        const { error } = await sb.from("recipes").update(payload).eq("id", initial.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from("recipes").insert(payload);
        if (error) throw error;
      }

      alert("Rezept gespeichert.");
      // TODO: nach Wunsch navigieren, z. B. window.location.href = `/recipes/${neueId}`
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  }

  // ======= UI =======
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {initial?.id ? "Rezept bearbeiten" : "Neues Rezept"}
      </h1>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Titel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
          placeholder="z. B. Cremige Pilz-Pasta"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Zutaten (eine pro Zeile)
        </label>
        <textarea
          value={ingredientsText}
          onChange={(e) => setIngredientsText(e.target.value)}
          rows={6}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
          placeholder={"200 g Nudeln\n1 Zwiebel\n200 g Champignons\n200 ml Sahne\nSalz, Pfeffer"}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Zubereitung</label>
        <textarea
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          rows={8}
          className="w-full resize-y rounded-xl border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-gray-400"
          placeholder={"1) Zwiebel würfeln und anbraten…\n2) Pilze zugeben…\n3) Sahne unterrühren…"}
        />
      </div>

      <ImagePicker
        initialPreviewUrl={initial?.image_url ?? undefined}
        onChange={setFile}
      />

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
