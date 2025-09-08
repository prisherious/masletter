import { useState } from "react";
export default function IngredientItem({ text }: { text: string }) {
  const [checked, setChecked] = useState(false);
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 hover:bg-brand-50 ${checked ? "opacity-60" : ""}`}>
      <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} className="h-4 w-4 rounded" />
      <span className="text-[15px]">{text}</span>
    </label>
  );
}
