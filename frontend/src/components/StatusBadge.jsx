export default function StatusBadge({ status }) {
  const published = status === 'published';
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${published ? 'bg-mint-100 text-mint-700' : 'bg-lilac-100 text-ocean-700'}`}>
      {published ? 'Published' : 'Draft'}
    </span>
  );
}
