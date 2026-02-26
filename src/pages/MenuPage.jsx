import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryTabs from '../components/CategoryTabs';
import MenuCard from '../components/MenuCard';
import CartDrawer from '../components/CartDrawer';
import { CATEGORY_ORDER, createOrder, fetchMenu } from '../lib/menu';

function groupByCategory(menuList) {
  const map = new Map();
  menuList.forEach((item) => {
    const key = item.category || '其他';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return map;
}

export default function MenuPage() {
  const navigate = useNavigate();
  const [menu, setMenu] = useState([]);
  const [activeCat, setActiveCat] = useState(CATEGORY_ORDER[0]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cart, setCart] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchMenu();
        setMenu(data);
        if (data[0]?.category) {
          setActiveCat(data[0].category);
        }
      } catch (err) {
        setError(err.message || '菜单加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(menu.map((m) => m.category).filter(Boolean))];
    const sorted = [...CATEGORY_ORDER.filter((c) => unique.includes(c)), ...unique.filter((c) => !CATEGORY_ORDER.includes(c))];
    return sorted.length ? sorted : CATEGORY_ORDER;
  }, [menu]);

  const filtered = useMemo(() => {
    return menu.filter((item) => {
      const matchCat = item.category === activeCat;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || item.name.toLowerCase().includes(q) || (item.desc || '').toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [menu, activeCat, search]);

  const cartRows = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const item = menu.find((m) => m.id === id);
        if (!item) return null;
        return {
          id,
          name: item.name,
          price: Number(item.price),
          qty,
          menuId: id
        };
      })
      .filter(Boolean);
  }, [cart, menu]);

  const totalCount = useMemo(() => cartRows.reduce((sum, row) => sum + row.qty, 0), [cartRows]);
  const totalPrice = useMemo(() => cartRows.reduce((sum, row) => sum + row.price * row.qty, 0), [cartRows]);

  const inc = (id) => setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const dec = (id) => setCart((prev) => ({ ...prev, [id]: Math.max((prev[id] || 0) - 1, 0) }));

  const onSubmitOrder = async ({ tableNo, note }) => {
    if (!cartRows.length) return;
    setSubmitting(true);
    try {
      const payload = {
        table_no: tableNo || null,
        note: note || null,
        total_price: totalPrice,
        status: 'NEW',
        items: cartRows.map((row) => ({
          menuId: row.menuId,
          name: row.name,
          price: row.price,
          qty: row.qty
        }))
      };
      const order = await createOrder(payload);
      setCart({});
      setDrawerOpen(false);
      navigate(`/success/${order.id}?time=${encodeURIComponent(order.created_at)}`);
    } catch (err) {
      alert(err.message || '下单失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="app-shell">
      <header className="panel flex items-center justify-between p-4">
        <div>
          <p className="text-xs uppercase tracking-wide muted">ZHEMEIZI × VC</p>
          <h1 className="text-2xl font-extrabold">浙妹子点餐</h1>
        </div>
      </header>

      <CategoryTabs categories={categories} active={activeCat} onChange={setActiveCat} />

      <div className="mt-3 panel p-3">
        <input
          className="w-full rounded-2xl bg-[var(--surface-soft)] px-4 py-3 text-sm outline-none"
          placeholder="搜索菜品 / 口味标签"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p className="mt-6 text-center muted">菜单加载中...</p>}
      {error && <p className="mt-6 text-center text-rose-600">{error}</p>}

      <section className="mt-4 space-y-4">
        {!loading && !filtered.length && <p className="text-center muted">这个分类暂无符合条件的菜品</p>}
        {filtered.map((item) => (
          <MenuCard key={item.id} item={item} qty={cart[item.id] || 0} onAdd={inc} onSub={dec} />
        ))}
      </section>

      {totalCount > 0 && (
        <button
          type="button"
          className="fixed bottom-4 left-0 right-0 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-md items-center justify-between rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-2xl dark:bg-teal-500 dark:text-slate-950"
          onClick={() => setDrawerOpen(true)}
        >
          <span>{totalCount} 件</span>
          <strong>查看购物车 · ¥{totalPrice}</strong>
        </button>
      )}

      <CartDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        items={menu}
        cartRows={cartRows}
        totalCount={totalCount}
        totalPrice={totalPrice}
        onAdd={inc}
        onSub={dec}
        onSubmit={onSubmitOrder}
        submitting={submitting}
      />
    </main>
  );
}
