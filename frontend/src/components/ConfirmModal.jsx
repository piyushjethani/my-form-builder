export default function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="panel w-full max-w-md p-6">
        <h2 className="display-title text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn-secondary" type="button" onClick={onCancel}>Cancel</button>
          <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" type="button" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}
