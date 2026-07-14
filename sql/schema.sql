-- SQL Schema Multitenant (Solo DDL — sin datos)
-- Ejecutar primero, luego aplicar seed aparte.

-- 1. Empresas (Tenants)
create table empresas (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  name text not null,
  phone text,
  instagram_url text,
  maps_url text,
  logo_url text,
  alias text,
  cbu text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categorías
create table categories (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  name text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Productos
create table products (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  code text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Banners
create table banners (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  image_url text not null,
  link text,
  title text,
  subtitle text,
  sort_order integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Pedidos
create table orders (
  id uuid default gen_random_uuid() primary key,
  empresa_id uuid references empresas(id) on delete cascade not null,
  customer_name text not null,
  customer_phone text not null,
  delivery_address text,
  comment text,
  total numeric not null,
  status text default 'pendiente' check (status in ('pendiente','en_preparacion','en_camino','entregado','cancelado')),
  items jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Índices para performance
create index if not EXISTS idx_categories_empresa on categories(empresa_id);
create index if not EXISTS idx_products_empresa on products(empresa_id);
create index if not EXISTS idx_products_category on products(category_id);
create index if not EXISTS idx_banners_empresa on banners(empresa_id);
create index if not EXISTS idx_orders_empresa on orders(empresa_id);
create index if not EXISTS idx_orders_status on orders(status);
create index if not EXISTS idx_orders_created on orders(created_at);
