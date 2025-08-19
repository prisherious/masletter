import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";

type Recipe = {
  id: number;
  tag_id: string;
  name: string;
  ingredients_json: string[] | null;
  ingredients?: string | null; // Fallback (Altbestand)
  preparation: string;
  created_at: string;
};

export default function RecipeDetail() {
  const { tagId, id } = useParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  const ingredientsList = useMemo(() => {
    if (!recipe) return [];
    if (recipe.ingredients_json && recipe.ingredients_json.length > 0) {
      return recipe.ingredients_json;
    }
    return (recipe.ingredients || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [recipe]);

  const shoppingListText = useMemo(
    () => ingredientsList.join("\n"),
    [ingredientsList]
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

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("recipes")
        .select("*")
        .eq("id", Number(id))
        .maybeSingle();

      if (error) {
        console.error("Fehler beim Laden:", error.message);
      } else {
        setRecipe((data as Recipe) || null);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-pink-600">🍽️ {recipe?.name || "Rezept"}</h1>
          <Link
            to={`/${tagId}`}
            className="text-sm text-pink-600 hover:text-pink-700 underline"
          >
            ← Zurück
          </Link>
        </div>

        {loading && <p className="text-gray-400 text-sm">Lade…</p>}
        {!loading && !recipe && <p className="text-gray-400 text-sm">Rezept nicht gefunden.</p>}

        {recipe && (
          <div className="space-y-6">
            <div className="text-xs text-gray-400">
              Erstellt am {new Date(recipe.created_at).toLocaleDateString()}
            </div>

            <section>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700 mb-2">Zutaten</h2>
                <button
                  type="button"
                  onClick={copyShoppingList}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-md px-3 py-1 text-xs"
                >
                  Einkaufsliste kopieren
                </button>
              </div>
              <ul className="list-disc pl-5 text-sm text-gray-800">
                {ingredientsList.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-2">Zubereitung</h2>
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {recipe.preparation}
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
