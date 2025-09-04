import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { RecipeRow } from "../types/recipe";

export default function RecipeDetail({ id }: { id: string }) {
  const [data, setData] = useState<RecipeRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
      if (!mounted) return;
      if (error) {
        console.error(error);
      } else {
        setData(data as RecipeRow);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-600">Lädt…</div>;
  if (!data) return <div className="p-6 text-red-600">Rezept nicht gefunden.</div>;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900">{data.title}</h1>

      <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="aspect-video w-full bg-neutral-100" />
        {data.image_placeholder && (
          <img
            src={data.image_placeholder}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 blur-md object-cover"
          />
        )}
        {data.image_url && (
          <img
            src={data.image_url}
            alt={`Foto von ${data.title}`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <section className="mb-6">
        <h2 className="mb-2 text-lg font-medium text-gray-900">Zutaten</h2>
        <ul className="list-disc pl-6 text-gray-700">
          {(data.ingredients ?? []).map((z, i) => (
            <li key={i}>{z}</li>
          ))}
        </ul>
      </section>

      {data.steps && (
        <section>
          <h2 className="mb-2 text-lg font-medium text-gray-900">Zubereitung</h2>
          <p className="whitespace-pre-line text-gray-700">{data.steps}</p>
        </section>
      )}
    </div>
  );
}
