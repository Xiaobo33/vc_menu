import { useEffect, useMemo, useRef, useState } from 'react';
import { adminLogin, getAdminOrders, updateOrderStatus } from '../lib/api';

const STATUS = ['NEW', 'COOKING', 'DONE'];

function formatStatus(status) {
  if (status === 'NEW') return '新订单';
  if (status === 'COOKING') return '制作中';
  if (status === 'DONE') return '已完成';
  return status;
}

export default function AdminPage() {
  const [token, setToken] = useState(localStorage.getItem('vc_admin_token') || '');
  const [inputToken, setInputToken] = useState(token);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);

  const totalNew = useMemo(() => orders.filter((o) => o.status === 'NEW').length, [orders]);

  const load = async (silent = false) => {
    if (!token) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await getAdminOrders(token);
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    load();
    const id = setInterval(() => load(true), 5000);
    return () => clearInterval(id);
  }, [token]);

  const onSaveToken = async () => {
    if (!inputToken.trim()) return;
    try {
      await adminLogin(inputToken.trim());
      localStorage.setItem('vc_admin_token', inputToken.trim());
      setToken(inputToken.trim());
      setError('');
    } catch (err) {
      setError(err.message || '口令错误');
    }
  };

  const onStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(token, orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch (err) {
      alert(err.message || '更新失败');
    }
  };

  const onTouchStart = (e) => {
    if (window.scrollY === 0) touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e) => {
    if (window.scrollY !== 0) return;
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80) {
      setRefreshing(true);
      load(true);
    }
  };

  if (!token) {
    return (
      <main className="app-shell flex items-center">
        <section className="panel w-full space-y-4 p-5">
          <h1 className="text-xl font-bold">管理员入口</h1>
          <p className="text-sm muted">请输入管理员口令</p>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 outline-none focus:border-teal-400 dark:border-slate-600"
            value={inputToken}
            onChange={(e) => setInputToken(e.target.value)}
            type="password"
            placeholder="Admin Token"
          />
          <button type="button" className="btn-primary w-full" onClick={onSaveToken}>
            进入管理页
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="panel mb-4 flex items-center justify-between p-4">
        <div>
          <h1 className="text-xl font-bold">订单管理</h1>
          <p className="text-sm muted">新订单 {totalNew} 条</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost text-sm" onClick={() => load()} type="button">
            {refreshing ? '刷新中...' : '刷新'}
          </button>
          <button
            className="btn-ghost text-sm"
            onClick={() => {
              localStorage.removeItem('vc_admin_token');
              setToken('');
            }}
            type="button"
          >
            退出
          </button>
        </div>
      </header>

      {loading && <p className="text-center muted">加载中...</p>}
      {error && <p className="text-center text-rose-600">{error}</p>}

      <section className="space-y-3">
        {orders.map((order) => (
          <article key={order.id} className="panel space-y-3 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs muted">{new Date(order.created_at).toLocaleString('zh-CN')}</p>
                <h2 className="text-sm font-bold break-all">#{order.id.slice(0, 8)}</h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${order.status === 'NEW' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200' : order.status === 'COOKING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'}`}>
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="space-y-2 rounded-2xl bg-[var(--surface-soft)] p-3">
              {(order.items || []).map((item, idx) => (
                <div key={`${order.id}-${idx}`} className="flex justify-between text-sm">
                  <span>{item.name} x {item.qty}</span>
                  <span>¥{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <p>桌号/取餐号：<strong>{order.table_no || '-'}</strong></p>
              <p className="text-right">总价：<strong>¥{order.total_price}</strong></p>
            </div>
            <p className="text-sm muted">备注：{order.note || '无'}</p>

            <div className="grid grid-cols-3 gap-2">
              {STATUS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onStatusChange(order.id, s)}
                  className={`rounded-xl px-2 py-2 text-xs font-semibold ${order.status === s ? 'bg-slate-900 text-white dark:bg-teal-500 dark:text-slate-950' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-100'}`}
                >
                  {formatStatus(s)}
                </button>
              ))}
            </div>
          </article>
        ))}

        {!orders.length && !loading && <p className="text-center muted">暂无订单</p>}
      </section>

      <style>{`@media print {
        body { background: white !important; }
        button { display: none !important; }
        .app-shell { max-width: 100% !important; padding: 0 !important; }
      }`}</style>
    </main>
  );
}
