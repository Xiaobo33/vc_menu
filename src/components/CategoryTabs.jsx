export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="panel mt-4 flex gap-2 overflow-x-auto p-2">
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`chip whitespace-nowrap ${
            active === cat ? 'bg-slate-900 text-white dark:bg-teal-400 dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
