import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Recipe = {
  id: number;
  tag_id: string;
  name: string;
  ingredients: string;   // newline-separiert
  preparation: string;
  created_at: string;
};

export default function DynamicPage() {
  const { tagId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [preparation, setPreparation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Rezepte laden
  useEffect(() => {
    const load = async () => {
      if (!tagId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("tag_id", tagId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fehler beim Laden:", error.message);
      } else {
        setRecipes((data as Recipe[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [tagId]);

  const saveRecipe = async () => {
    if (!tagId) return;
    if (!name.trim() || !ingredients.trim() || !preparation.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        tag_id: tagId,
        name: name.trim(),
        ingredients: ingredients.trim(),
        preparation: preparation.trim(),
      })
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
      return;
    }

    if (data) {
      // Neues Rezept oben einfügen
      setRecipes((prev) => [data as Recipe, ...prev]);
      // Formular leeren
      setName("");
      setIngredients("");
      setPreparation("");
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-600">📖 Mein Rezeptebuch</h1>
          <span className="text-xs text-gray-400">Tag: <code>{tagId}</code></span>
        </div>

        {/* Liste der Rezepte */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Rezepte</h2>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {loading && <p className="text-gray-400 text-sm">Lade…</p>}
            {!loading && recipes.length === 0 && (
              <p className="text-gray-400 text-sm">Noch keine Rezepte vorhanden.</p>
            )}
            {recipes.map((r) => (
              <button
                key={r.id}
                onClick={() => navigate(`/${tagId}/recipes/${r.id}`)}
                className="w-full text-left bg-pink-50 hover:bg-pink-100 border border-pink-200 rounded-lg p-3 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-pink-900">{r.name}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {r.ingredients.split("\n").slice(0, 3).join(", ")}
                  {r.ingredients.split("\n").length > 3 ? " …" : ""}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Formular: Neues Rezept */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Neues Rezept anlegen</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              className="border rounded-md p-2 text-sm"
              placeholder="Rezeptname (z. B. Spaghetti Carbonara)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="border rounded-md p-2 text-sm min-h-[90px]"
              placeholder={"Zutaten (eine pro Zeile)\n200 g Spaghetti\n100 g Pancetta\n2 Eier\n50 g Pecorino\nSalz, Pfeffer"}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
            <textarea
              className="border rounded-md p-2 text-sm min-h-[140px]"
              placeholder={"Zubereitung (Freitext)\n1) Nudeln kochen…\n2) Pancetta anbraten…\n3) Eier-Käse-Mix…"}
              value={preparation}
              onChange={(e) => setPreparation(e.target.value)}
            />
            <div className="flex justify-end">
              <button
                onClick={saveRecipe}
                disabled={saving || !name.trim() || !ingredients.trim() || !preparation.trim()}
                className="bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white rounded-md px-4 py-2 text-sm"
              >
                {saving ? "Speichere…" : "Rezept speichern"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
