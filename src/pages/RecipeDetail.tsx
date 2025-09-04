import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
type RecipeRow = { id:string; title:string; ingredients:string[]; steps:string|null; image_url?:string|null; image_placeholder?:string|null; };

export default function RecipeDetail({ id }: { id: string }) {
  const [data, setData] = useState<RecipeRow|null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string|null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!supabase) throw new Error("Supabase nicht konfiguriert (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).");
        const { data, error } = await supabase.from("recipes").select("*").eq("id", id).single();
        if (error) throw error;
        if (mounted) setData(data as any);
      } catch (e:any) {
        if (mounted) setErr(e?.message ?? String(e));
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="p-6 text-gray-600">Lädt…</div>;
  if (err) return <div className="p-6 text-red-600">Fehler: {err}</div>;
  if (!data) return <div className="p-6 text-red-600">Rezept nicht gefunden.</div>;

  return (
    <div className="mx-auto max-w-3xl p-4 md:p-6">
      <h1 className="mb-4 text-2xl font-semibold">{data.title}</h1>
      <div className="relative mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="aspect-video w-full bg-neutral-100" />
        {data.image_placeholder && <img src={data.image_placeholder} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover blur-md scale-105" />}
        {data.image_url && <img src={data.image_url} alt={`Foto von ${data.title}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />}
      </div>
      <h2 className="mb-2 text-lg font-medium">Zutaten</h2>
      <ul className="list-disc pl-6">{(data.ingredients ?? []).map((z,i)=><li key={i}>{z}</li>)}</ul>
      {data.steps && (<><h2 className="mt-6 mb-2 text-lg font-medium">Zubereitung</h2><p className="whitespace-pre-line">{data.steps}</p></>)}
    </div>
  );
}
