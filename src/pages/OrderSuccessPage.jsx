import { Link, useParams, useSearchParams } from 'react-router-dom';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const time = params.get('time');

  return (
    <main className="app-shell flex items-center">
      <section className="panel w-full space-y-4 p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl dark:bg-emerald-900/30">✓</div>
        <h1 className="text-2xl font-bold">下单成功</h1>
        <p className="muted">订单号</p>
        <p className="break-all rounded-xl bg-[var(--surface-soft)] px-3 py-2 text-sm font-semibold">{orderId}</p>
        <p className="text-sm muted">下单时间：{time ? new Date(time).toLocaleString('zh-CN') : '刚刚'}</p>
        <Link to="/" className="btn-primary inline-block w-full text-center">
          返回菜单
        </Link>
      </section>
    </main>
  );
}
