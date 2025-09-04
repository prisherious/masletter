import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider, useParams } from "react-router-dom";
import "./index.css";

// Seiten – passe diese Imports an DEINE Dateipfade an:
import RecipeDetail from "./pages/RecipeDetail";     // <— wichtig: singular & richtiger Ordner
import RecipeForm from "./pages/RecipeForm";         // falls vorhanden
// Optional: wenn du Access/AccessError nutzt
// import Access from "./pages/Access";
// import AccessError from "./pages/AccessError";

// sehr simple Home-Placeholder-Seite, damit "/" rendert:
function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight">Masletter</h1>
      <p className="text-gray-600 mt-2">Willkommen 👋 – wähle ein Rezept aus.</p>
    </div>
  );
}

// Wrapper, der die :id aus der URL zieht und an RecipeDetail weitergibt
function RecipeDetailRoute() {
  const { id } = useParams();
  if (!id) return <div className="p-6 text-red-600">Keine Rezept-ID in der URL.</div>;
  return <RecipeDetail id={id} />;
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/recipes/new", element: <RecipeForm /> },
  { path: "/recipes/:id", element: <RecipeDetailRoute /> },
  // { path: "/access", element: <Access /> },
  // { path: "/access-error", element: <AccessError /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
