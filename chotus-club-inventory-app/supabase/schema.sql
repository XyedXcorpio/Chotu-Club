-- =============================================================================
-- Chotu's Club Inventory — Database Schema
-- Run this whole file once in the Supabase SQL editor (Project → SQL Editor).
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE where possible.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------------------------------------------------------------------------
-- 1. Roles: a profile row per auth user, holding their role.
--    Supabase Auth creates rows in auth.users automatically on signup/invite.
--    We mirror a "role" for each into public.profiles.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'store_staff' check (role in ('owner', 'store_staff')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
-- New users default to 'store_staff'; promote the owner's account manually
-- (see README "Make yourself the owner" step) after first login.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'store_staff')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Small helper used inside RLS policies to check the caller's role
-- without recursive-RLS issues (security definer bypasses RLS on profiles).
create or replace function public.current_role_is(check_role text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = check_role
  );
$$;

create or replace function public.is_owner()
returns boolean language sql security definer set search_path = public stable
as $$ select public.current_role_is('owner'); $$;

-- ---------------------------------------------------------------------------
-- 2. Products  (== "New Product Setup" / base columns of "Main Inventory")
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  product_name text not null,
  brand text not null default E'Chotu\'s Club',
  category text not null default 'Track Suit',
  gender text not null check (gender in ('Boys', 'Girls', 'Unisex')),
  color text,
  cost_price numeric(12,2) not null default 0,
  sale_price numeric(12,2) not null default 0,
  date_added date not null default current_date,
  notes text,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_sku on public.products(sku);

-- Fixed size list, same as the spreadsheet
create table if not exists public.sizes (
  size text primary key,
  sort_order int not null
);
insert into public.sizes (size, sort_order) values
  ('4-5', 1), ('5-6', 2), ('6-7', 3), ('7-8', 4), ('8-9', 5),
  ('9-10', 6), ('10-11', 7), ('11-12', 8), ('12+', 9)
on conflict (size) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Stock tables — one row per product+size, per location.
--    Mirrors "Stock - Store" / "Stock - Warehouse" in the spreadsheet:
--    current_stock = opening + received - sold + net_transferred (view, below)
-- ---------------------------------------------------------------------------
create table if not exists public.store_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null references public.sizes(size),
  opening_stock int not null default 0,
  stock_received int not null default 0,
  units_sold int not null default 0,
  last_updated timestamptz not null default now(),
  notes text,
  unique (product_id, size)
);

create table if not exists public.warehouse_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null references public.sizes(size),
  opening_stock int not null default 0,
  stock_received int not null default 0,
  units_sold int not null default 0,
  last_updated timestamptz not null default now(),
  notes text,
  unique (product_id, size)
);

-- ---------------------------------------------------------------------------
-- 4. Transfer log — Warehouse <-> Store movements
-- ---------------------------------------------------------------------------
create table if not exists public.transfers (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null references public.sizes(size),
  quantity int not null check (quantity > 0),
  direction text not null check (direction in ('Warehouse to Store', 'Store to Warehouse')),
  transfer_date date not null default current_date,
  logged_by uuid references public.profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_transfers_product_size on public.transfers(product_id, size);

-- ---------------------------------------------------------------------------
-- 5. Views — current stock per location, and the Main Inventory summary,
--    computed the same way as the Excel workbook.
-- ---------------------------------------------------------------------------
create or replace view public.v_transfer_net as
select
  product_id,
  size,
  sum(case when direction = 'Warehouse to Store' then quantity else 0 end) as net_to_store,
  sum(case when direction = 'Store to Warehouse' then quantity else 0 end) as net_to_warehouse
from public.transfers
group by product_id, size;

create or replace view public.v_store_stock as
select
  s.id, s.product_id, s.size, s.opening_stock, s.stock_received, s.units_sold,
  s.opening_stock + s.stock_received - s.units_sold
    + coalesce(t.net_to_store, 0) - coalesce(t.net_to_warehouse, 0) as current_stock,
  s.last_updated, s.notes
from public.store_stock s
left join public.v_transfer_net t on t.product_id = s.product_id and t.size = s.size;

create or replace view public.v_warehouse_stock as
select
  w.id, w.product_id, w.size, w.opening_stock, w.stock_received, w.units_sold,
  w.opening_stock + w.stock_received - w.units_sold
    + coalesce(t.net_to_warehouse, 0) - coalesce(t.net_to_store, 0) as current_stock,
  w.last_updated, w.notes
from public.warehouse_stock w
left join public.v_transfer_net t on t.product_id = w.product_id and t.size = w.size;

-- Per-product, per-size combined summary (== one "Size X: Stock/Sold" pair on Main Inventory)
create or replace view public.v_product_size_summary as
select
  p.id as product_id, p.sku, p.product_name, p.gender, p.color,
  p.cost_price, p.sale_price, sz.size,
  coalesce(ss.current_stock, 0) as store_stock,
  coalesce(ws.current_stock, 0) as warehouse_stock,
  coalesce(ss.current_stock, 0) + coalesce(ws.current_stock, 0) as total_stock,
  coalesce(ss.units_sold, 0) as store_sold,
  coalesce(ws.units_sold, 0) as warehouse_sold,
  coalesce(ss.units_sold, 0) + coalesce(ws.units_sold, 0) as total_sold
from public.products p
cross join public.sizes sz
left join public.v_store_stock ss on ss.product_id = p.id and ss.size = sz.size
left join public.v_warehouse_stock ws on ws.product_id = p.id and ws.size = sz.size
where p.archived = false
order by p.product_name, sz.sort_order;

-- Per-product totals (== "Totals" block on Main Inventory)
create or replace view public.v_product_summary as
select
  p.id as product_id, p.sku, p.product_name, p.brand, p.category, p.gender,
  p.color, p.cost_price, p.sale_price,
  (p.sale_price - p.cost_price) as profit_per_unit,
  case when p.sale_price > 0 then (p.sale_price - p.cost_price) / p.sale_price else null end as margin_pct,
  sum(pss.total_stock) as total_stock,
  sum(pss.total_sold) as total_sold,
  sum(pss.total_sold) * p.sale_price as total_revenue,
  sum(pss.total_sold) * (p.sale_price - p.cost_price) as total_profit,
  p.date_added, p.notes
from public.products p
join public.v_product_size_summary pss on pss.product_id = p.id
where p.archived = false
group by p.id, p.sku, p.product_name, p.brand, p.category, p.gender,
         p.color, p.cost_price, p.sale_price, p.date_added, p.notes;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
--    Owner: full read/write on everything.
--    Store staff: read products (no price columns exposed — enforced by using
--    a restricted view/API layer in the app for staff, see app/lib/data.ts),
--    read/write store_stock, read/write transfers, read warehouse_stock is
--    blocked, read/write on products is blocked (no add/edit prices).
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.store_stock enable row level security;
alter table public.warehouse_stock enable row level security;
alter table public.transfers enable row level security;
alter table public.sizes enable row level security;

-- profiles: everyone can read their own row; owner can read all
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_owner());

-- sizes: readable by any authenticated user
drop policy if exists sizes_select on public.sizes;
create policy sizes_select on public.sizes for select
  using (auth.role() = 'authenticated');

-- products: owner full access; store_staff can SELECT (app layer hides price
-- fields for staff in the UI/query), but cannot insert/update/delete.
drop policy if exists products_select on public.products;
create policy products_select on public.products for select
  using (auth.role() = 'authenticated');

drop policy if exists products_write on public.products;
create policy products_write on public.products for all
  using (public.is_owner()) with check (public.is_owner());

-- store_stock: owner full access; store_staff can select + insert/update
-- (they update stock numbers), never delete.
drop policy if exists store_stock_select on public.store_stock;
create policy store_stock_select on public.store_stock for select
  using (auth.role() = 'authenticated');

drop policy if exists store_stock_upsert on public.store_stock;
create policy store_stock_upsert on public.store_stock for insert
  with check (auth.role() = 'authenticated');

drop policy if exists store_stock_update on public.store_stock;
create policy store_stock_update on public.store_stock for update
  using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists store_stock_delete on public.store_stock;
create policy store_stock_delete on public.store_stock for delete
  using (public.is_owner());

-- warehouse_stock: owner only, in every direction
drop policy if exists warehouse_stock_all on public.warehouse_stock;
create policy warehouse_stock_all on public.warehouse_stock for all
  using (public.is_owner()) with check (public.is_owner());

-- transfers: owner + store_staff can select and insert; only owner can delete
drop policy if exists transfers_select on public.transfers;
create policy transfers_select on public.transfers for select
  using (auth.role() = 'authenticated');

drop policy if exists transfers_insert on public.transfers;
create policy transfers_insert on public.transfers for insert
  with check (auth.role() = 'authenticated');

drop policy if exists transfers_delete on public.transfers;
create policy transfers_delete on public.transfers for delete
  using (public.is_owner());

-- ---------------------------------------------------------------------------
-- 7. Seed example product (mirrors the Excel "example row") — safe to delete
--    from the app once you're happy everything works.
-- ---------------------------------------------------------------------------
insert into public.products (sku, product_name, brand, category, gender, color, cost_price, sale_price, notes)
values ('CC-TS-B-BLU-001', 'Classic Track Suit', E'Chotu\'s Club', 'Track Suit', 'Boys', 'Blue', 1200, 2000, 'Example product — feel free to delete')
on conflict (sku) do nothing;

insert into public.store_stock (product_id, size, opening_stock, stock_received, units_sold)
select id, '6-7', 5, 3, 1 from public.products where sku = 'CC-TS-B-BLU-001'
on conflict (product_id, size) do nothing;

insert into public.warehouse_stock (product_id, size, opening_stock, stock_received, units_sold)
select id, '6-7', 20, 0, 0 from public.products where sku = 'CC-TS-B-BLU-001'
on conflict (product_id, size) do nothing;
