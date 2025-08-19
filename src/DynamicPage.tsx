import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

type RecipeRow = {
  id: number;
  tag_id: string;
  name: string;
  ingredients_json: string[] | null; // neue Spalte
  ingredients?: string | null;       // Fallback, falls es alte Datensätze mit Text gibt
  preparation: string;
  created_at: string;
};

export default function DynamicPage() {
  const { tagId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Formular-State
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]); // dynamische Felder
  const [preparation, setPreparation] = useState("");

  // Zutaten-Handler
  const handleIngredientChange = (i: number, value: string) => {
    const copy = [...ingredients];
    copy[i] = value;
    setIngredients(copy);

    // letztes Feld? -> bei Eingabe neues leeres Feld anhängen
    if (i === ingredients.length - 1 && value.trim() !== "") {
      setIngredients([...copy, ""]);
    }
  };

  const removeIngredient = (i: number) => {
    const filtered = ingredients.filter((_, idx) => idx !== i);
    // Immer dafür sorgen, dass am Ende ein leeres Feld bleibt
    const cleaned = filtered.length === 0 ? [""] : filtered;
    setIngredients(cleaned);
  };

  // Einkaufsliste aus aktuellem Formular
  const shoppingListText = useMemo(
    () => ingredients.filter((x) => x.trim() !== "").join("\n"),
    [ingredients]
  );

  const copyShoppingList = async () => {
    if (!shoppingListText) return;
    try {
      await navigator.clipboard.writeText(shoppingListText);
      alert("Einkaufsliste kopiert – jetzt in Notizen einfügen.");
    } catch {
      // Fallback: Text als prompt anzeigen
      prompt("Kopiere die Einkaufsliste:", shoppingListText);
    }
  };

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
        setRecipes((data as RecipeRow[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [tagId]);

  // Speichern
  const saveRecipe = async () => {
    if (!tagId) return;
    const ing = ingredients.map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || ing.length === 0 || !preparation.trim()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        tag_id: tagId,
        name: name.trim(),
        ingredients_json: ing, // JSON-Array speichern
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
      setRecipes((prev) => [data as RecipeRow, ...prev]);
      setName("");
      setIngredients([""]);
      setPreparation("");
    }
  };

  // Kompakter Zutaten-Vorschau-String für Karten
  const previewIngredients = (r: RecipeRow) => {
    const list =
      (r.ingredients_json && r.ingredients_json.length > 0
        ? r.ingredients_json
        : (r.ingredients || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
      ).slice(0, 3);
    return list.join(", ") + (list.length >= 3 ? " …" : "");
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-600">📖 Mein Rezeptebuch</h1>
          <span className="text-xs text-gray-400">
            Tag: <code>{tagId}</code>
          </span>
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
                  {previewIngredients(r)}
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

            {/* Dynamische Zutatenfelder */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Zutaten</label>
              {ingredients.map((ing, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="text"
                    className="border rounded-md p-2 text-sm flex-1"
                    placeholder={`Zutat ${i + 1}`}
                    value={ing}
                    onChange={(e) => handleIngredientChange(i, e.target.value)}
                  />
                  {i < ingredients.length - 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="text-xs px-2 border rounded-md text-red-600 border-red-200 hover:bg-red-50"
                    >
                      Entfernen
                    </button>
                  )}
                </div>
              ))}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={copyShoppingList}
                  disabled={!shoppingListText}
                  className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-md px-3 py-2 text-xs"
                >
                  Einkaufsliste kopieren
                </button>
              </div>
            </div>

            <textarea
              className="border rounded-md p-2 text-sm min-h-[140px]"
              placeholder={"Zubereitung (Freitext)\n1) Nudeln kochen…\n2) Pancetta anbraten…\n3) Eier-Käse-Mix…"}
              value={preparation}
              onChange={(e) => setPreparation(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={saveRecipe}
                disabled={saving || !name.trim() || ingredients.filter((x) => x.trim()).length === 0 || !preparation.trim()}
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
