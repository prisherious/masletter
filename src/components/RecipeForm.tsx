import { useState } from "react";

export default function RecipeForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({ title, image });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
      <h2 className="text-xl font-bold">Neues Rezept</h2>
      <input
        type="text"
        placeholder="Rezeptname"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="border rounded px-3 py-2 w-full"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={e => setImage(e.target.files?.[0] || null)}
        className="w-full"
      />
      <button
        type="submit"
        className="bg-pink-500 hover:bg-pink-600 text-white rounded px-4 py-2"
      >
        Rezept speichern
      </button>
    </form>
  );
}