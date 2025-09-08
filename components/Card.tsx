export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-brand-100 bg-white shadow-sm ${className}`}>{children}</div>;
}
export function CardBody({ children, className = "" }) {
  return <div className={`p-5 sm:p-7 ${className}`}>{children}</div>;
}
