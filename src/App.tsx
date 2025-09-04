import { Link } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 text-white">
      <div className="container-box w-full max-w-md space-y-4">
        <h1>Kochbuch</h1>
        <p className="text-center text-sm text-gray-400">
          Scanne deinen <strong>NFC-Tag</strong>, um zu deiner persönlichen Rezepte-Homepage zu gelangen.
        </p>
        <div className="text-xs text-gray-500 text-center">
          Dev-Tipp: Du kannst auch manuell eine Tag-URL öffnen, z.&nbsp;B.&nbsp;<code>/demo-tag</code>.
        </div>
        <div className="flex justify-center">
          <Link
            to="/demo-tag"
            className="mt-2 bg-pink-500 hover:bg-pink-600 text-white rounded-md px-4 py-2 text-sm"
          >
            Demo öffnen
          </Link>
        </div>
      </div>
    </div>
  );
}
