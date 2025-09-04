export function EnvGate({ children }: { children: React.ReactNode }) {
  const hasEnv = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
  if (hasEnv) return <>{children}</>;

  return (
    <div className="min-h-dvh flex items-center justify-center bg-neutral-50 p-6">
      <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight">Konfiguration erforderlich</h1>
        <p className="mt-2 text-sm text-gray-600">
          Die Variablen <code className="font-mono">VITE_SUPABASE_URL</code> und{" "}
          <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> sind nicht gesetzt.
        </p>
        <ol className="mt-3 list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>In Vercel → Project → <b>Settings → Environment Variables</b> beide Variablen anlegen.</li>
          <li>Werte aus Supabase: <b>Project Settings → API</b>.</li>
          <li>Deployment neu starten (<b>Redeploy</b>).</li>
        </ol>
      </div>
    </div>
  );
}
