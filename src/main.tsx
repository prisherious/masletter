import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider, useParams, Navigate } from "react-router-dom";

function RouteError() {
  return <div className="p-6 text-red-600">Seite konnte nicht geladen werden.</div>;
}

import RecipeDetail from "./pages/RecipeDetail";
import RecipeForm from "./pages/RecipeForm";

function Home() {
  return <div className="p-6"><h1 className="text-2xl font-semibold">Masletter</h1><p className="text-gray-600 mt-2">Willkommen 👋</p></div>;
}
function RecipeDetailRoute() {
  const { id } = useParams(); if (!id) throw new Error("Keine Rezept-ID.");
  return <RecipeDetail id={id} />;
}
function LegacySlugRedirect() {
  const { id } = useParams(); return <Navigate to={`/recipes/${id}`} replace />;
}
function NotFound() { return <div className="p-6 text-red-600">404 – Seite nicht gefunden.</div>; }

const router = createBrowserRouter([
  { path: "/", element: <Home />, errorElement: <RouteError /> },
  { path: "/recipes/new", element: <RecipeForm />, errorElement: <RouteError /> },
  { path: "/recipes/:id", element: <RecipeDetailRoute />, errorElement: <RouteError /> },
  { path: "/:id", element: <LegacySlugRedirect />, errorElement: <RouteError /> }, // /Tag-1 -> /recipes/Tag-1
  { path: "*", element: <NotFound />, errorElement: <RouteError /> },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><RouterProvider router={router} /></React.StrictMode>
);
