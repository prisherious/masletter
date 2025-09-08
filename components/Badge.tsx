export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm text-brand-700">
      {children}
    </span>
  );
}
