export default function Loading({ label = 'Loading' }) {
  return (
    <div className="flex items-center justify-center p-10 text-sm font-semibold text-slate-500" role="status">
      {label}...
    </div>
  );
}
