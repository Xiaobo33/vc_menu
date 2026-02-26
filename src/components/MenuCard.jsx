function extractTags(desc = '') {
  const tagMatches = desc.match(/#([^\s#]+)/g) || [];
  return tagMatches.map((t) => t.replace('#', ''));
}

function cleanDesc(desc = '') {
  return desc.replace(/#([^\s#]+)/g, '').trim();
}

export default function MenuCard({ item, qty, onAdd, onSub }) {
  const tags = extractTags(item.desc || '');
  const descriptionLines = cleanDesc(item.desc || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const hasImage = typeof item.img_url === 'string' && item.img_url.trim().startsWith('http');

  return (
    <article className="panel overflow-hidden">
      {hasImage && (
        <div className="relative h-40 w-full bg-slate-100 dark:bg-slate-700">
          <img src={item.img_url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
          {item.is_sold_out && (
            <span className="absolute right-3 top-3 rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">
              已售罄
            </span>
          )}
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-bold">{item.name}</h3>
          <strong className="text-base text-teal-600 dark:text-teal-300">¥{item.price}</strong>
        </div>
        {!hasImage && item.is_sold_out && (
          <span className="inline-block rounded-full bg-rose-600 px-3 py-1 text-xs font-bold text-white">已售罄</span>
        )}
        {!!descriptionLines.length && (
          <div className="space-y-1">
            {descriptionLines.map((line, idx) => (
              <p key={`${item.id}-desc-${idx}`} className="text-sm muted">
                {line}
              </p>
            ))}
          </div>
        )}
        {!!tags.length && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-200">
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-slate-200 text-xl font-bold text-slate-700 disabled:opacity-30 dark:bg-slate-700 dark:text-slate-100"
            disabled={qty === 0 || item.is_sold_out}
            onClick={() => onSub(item.id)}
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            className="h-9 w-9 rounded-full bg-teal-500 text-xl font-bold text-white disabled:opacity-40"
            disabled={item.is_sold_out}
            onClick={() => onAdd(item.id)}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
