import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteError() {
  const err = useRouteError();
  if (isRouteErrorResponse(err)) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Fehler {err.status}</h1>
        <p className="text-gray-600 mt-2">{err.statusText}</p>
      </div>
    );
  }
  const message = err instanceof Error ? err.message : "Unbekannter Fehler";
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Es ist ein Fehler aufgetreten</h1>
      <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{message}</pre>
    </div>
  );
}
