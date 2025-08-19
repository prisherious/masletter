import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "./supabaseClient";

type RecipeRow = {
  id: number;
  tag_id: string;
  name: string;
  preparation: string;
  ingredients_json?: string[] | null;
  ingredients?: string | null; // Fallback (Altbestand TEXT)
  created_at: string;
};

export default function DynamicPage() {
  const { tagId } = useParams();
  const navigate = useNavigate();

  const [recipes, setRecipes] = useState<RecipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Formular
  const [name, setName] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [preparation, setPreparation] = useState("");

  // Zutaten-Handler
  const handleIngredientChange = (i: number, value: string) => {
    const copy = [...ingredients];
    copy[i] = value;
    setIngredients(copy);
    if (i === ingredients.length - 1 && value.trim() !== "") {
      setIngredients([...copy, ""]);
    }
  };
  const removeIngredient = (i: number) => {
    const filtered = ingredients.filter((_, idx) => idx !== i);
    setIngredients(filtered.length ? filtered : [""]);
  };

  // Einkaufsliste
  const shoppingListText = useMemo(
    () => ingredients.map((s) => s.trim()).filter(Boolean).join("\n"),
    [ingredients]
  );
  const copyShoppingList = async () => {
    if (!shoppingListText) return;
    try {
      await navigator.clipboard.writeText(shoppingListText);
      alert("Einkaufsliste kopiert – jetzt in Notizen einfügen.");
    } catch {
      prompt("Kopiere die Einkaufsliste:", shoppingListText);
    }
  };

  // Laden
  const refetch = useCallback(async () => {
    if (!tagId) return;
    setLoading(true);
    setErrorMsg(null);
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("tag_id", tagId)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setRecipes((data as RecipeRow[]) || []);
    }
    setLoading(false);
  }, [tagId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  // Speichern mit JSONB -> Fallback TEXT
  const saveRecipe = async () => {
    if (!tagId) return;
    const ingArray = ingredients.map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || ingArray.length === 0 || !preparation.trim()) return;

    setSaving(true);
    setErrorMsg(null);

    // 1) Versuch: JSONB
    const tryJson = await supabase
      .from("recipes")
      .insert({
        tag_id: tagId,
        name: name.trim(),
        ingredients_json: ingArray,    // JSON-Array
        preparation: preparation.trim(),
      })
      .select("*")
      .single();

    if (!tryJson.error) {
      // Erfolg
      setRecipes((prev) => [tryJson.data as RecipeRow, ...prev]);
    } else {
      const msg = tryJson.error.message?.toLowerCase() || "";
      const looksLikeSchemaIssue =
        msg.includes("column") && msg.includes("does not exist");
      const looksLikeJsonIssue =
        msg.includes("invalid input syntax for type json") ||
        msg.includes("jsonb");

      if (looksLikeSchemaIssue || looksLikeJsonIssue) {
        // 2) Fallback: TEXT-Spalte 'ingredients'
        const tryText = await supabase
          .from("recipes")
          .insert({
            tag_id: tagId,
            name: name.trim(),
            ingredients: ingArray.join("\n"), // TEXT fallback
            preparation: preparation.trim(),
          })
          .select("*")
          .single();

        if (!tryText.error) {
          setRecipes((prev) => [tryText.data as RecipeRow, ...prev]);
        } else {
          setErrorMsg(`Speichern (TEXT) fehlgeschlagen: ${tryText.error.message}`);
          setSaving(false);
          return;
        }
      } else {
        setErrorMsg(`Speichern fehlgeschlagen: ${tryJson.error.message}`);
        setSaving(false);
        return;
      }
    }

    // Formular leeren
    setName("");
    setIngredients([""]);
    setPreparation("");
    setSaving(false);
  };

  const previewIngredients = (r: RecipeRow) => {
    const list =
      (r.ingredients_json && r.ingredients_json.length
        ? r.ingredients_json
        : (r.ingredients || "")
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
      ).slice(0, 3);
    return list.join(", ") + (list.length >= 3 ? " …" : "");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="container-box w-full max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Kochbuch</h1>
          <span className="text-xs text-gray-400">Tag: <code>{tagId}</code></span>
        </div>

        {errorMsg && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
            {errorMsg}
          </div>
        )}

        {/* Liste */}
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
                className="w-full text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-3 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900">{r.name}</div>
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

        {/* Formular */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Neues Rezept anlegen</h2>
          <div className="grid grid-cols-1 gap-3">
            <input
              type="text"
              className="border rounded-md p-2 text-sm"
              placeholder="Rezeptname"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

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
              placeholder="Zubereitung"
              value={preparation}
              onChange={(e) => setPreparation(e.target.value)}
            />

            <div className="flex justify-end">
              <button
                onClick={saveRecipe}
                disabled={
                  saving ||
                  !name.trim() ||
                  ingredients.filter((x) => x.trim()).length === 0 ||
                  !preparation.trim()
                }
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
