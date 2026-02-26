-- Enable extension for UUID generation
create extension if not exists "pgcrypto";

-- ===== menu =====
create table if not exists public.menu (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  price numeric(10,2) not null check (price >= 0),
  img_url text not null,
  "desc" text,
  is_sold_out boolean not null default false,
  sort int not null default 0
);

-- ===== orders =====
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'NEW' check (status in ('NEW', 'COOKING', 'DONE')),
  table_no text,
  note text,
  total_price numeric(10,2) not null check (total_price >= 0),
  items jsonb not null
);

create index if not exists idx_menu_category_sort on public.menu(category, sort);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status on public.orders(status);

alter table public.menu enable row level security;
alter table public.orders enable row level security;

-- Public can read menu
create policy "Public can read menu"
on public.menu for select
to anon, authenticated
using (true);

-- Public can place order (status must be NEW)
create policy "Public can insert order"
on public.orders for insert
to anon, authenticated
with check (status = 'NEW');

-- No public read/update/delete on orders
revoke all on public.orders from anon, authenticated;
grant insert on public.orders to anon, authenticated;

grant select on public.menu to anon, authenticated;

-- ===== seed demo menu =====
insert into public.menu (category, name, price, img_url, "desc", is_sold_out, sort) values
('主食', '黑椒牛肉饭', 28, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=80', '现炒牛肉配时蔬 #微辣 #招牌', false, 1),
('主食', '番茄鸡肉意面', 26, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80', '酸甜开胃 #不辣', false, 2),
('小吃', '椒盐薯条', 12, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=80', '外脆里软 #素食', false, 3),
('小吃', '香辣鸡翅', 16, 'https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=1200&q=80', '4只装 #中辣', false, 4),
('饮料', '冰柠茶', 8, 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1200&q=80', '可选少冰/无糖 #清爽', false, 5),
('饮料', '气泡美式', 14, 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80', '冷萃拼气泡水 #提神', false, 6)
on conflict do nothing;
