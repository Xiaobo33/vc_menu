import { useMemo, useState } from 'react';

export default function CartDrawer({ open, onClose, items, cartRows, totalCount, totalPrice, onAdd, onSub, onSubmit, submitting }) {
  const [tableNo, setTableNo] = useState('');
  const [note, setNote] = useState('');

  const isValid = useMemo(() => cartRows.length > 0 && !submitting, [cartRows.length, submitting]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50" onClick={onClose}>
      <div className="absolute bottom-0 left-0 right-0 mx-auto max-h-[85vh] w-full max-w-md rounded-t-3xl bg-[var(--surface)] p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-slate-600" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">购物车 ({totalCount})</h2>
          <button type="button" className="text-sm muted" onClick={onClose}>
            关闭
          </button>
        </div>

        <div className="max-h-56 space-y-3 overflow-auto pr-1">
          {cartRows.map((row) => (
            <div key={row.id} className="panel flex items-center justify-between p-3">
              <div>
                <p className="font-semibold">{row.name}</p>
                <p className="text-sm muted">¥{row.price} x {row.qty}</p>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700" onClick={() => onSub(row.id)}>
                  -
                </button>
                <span className="min-w-5 text-center">{row.qty}</span>
                <button type="button" className="h-8 w-8 rounded-full bg-teal-500 text-white" onClick={() => onAdd(row.id)}>
                  +
                </button>
              </div>
            </div>
          ))}
          {!cartRows.length && <p className="py-8 text-center muted">还没有菜品</p>}
        </div>

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-teal-400 dark:border-slate-600"
            placeholder="桌号 / 取餐号（可选）"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
          />
          <textarea
            className="h-24 w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm outline-none focus:border-teal-400 dark:border-slate-600"
            placeholder="备注：少冰、不要葱等（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm muted">合计</p>
            <strong className="text-xl text-teal-600 dark:text-teal-300">¥{totalPrice}</strong>
          </div>
          <button
            type="button"
            className="btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isValid}
            onClick={() => onSubmit({
              tableNo: tableNo.trim(),
              note: note.trim()
            })}
          >
            {submitting ? '提交中...' : '确认下单'}
          </button>
        </div>
      </div>
    </div>
  );
}
