-- Barbearia Saviella The Barber - Supabase schema
-- Execute no SQL Editor do Supabase.

create extension if not exists "pgcrypto";
create extension if not exists "btree_gist";

do $$ begin
  create type public.profile_role as enum ('client', 'barber', 'manager', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.appointment_status as enum ('draft', 'pending_payment', 'pending', 'confirmed', 'paid', 'completed', 'canceled', 'no_show');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('pending', 'analyzing', 'authorized', 'paid', 'overdue', 'failed', 'canceled', 'refunded', 'refund_denied', 'chargeback');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('PIX', 'CREDIT_CARD', 'CASH', 'SUBSCRIPTION_CREDIT');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.subscription_status as enum ('pending', 'active', 'past_due', 'canceled', 'expired');
exception when duplicate_object then null; end $$;

create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  phone text,
  email text,
  address jsonb not null default '{}'::jsonb,
  timezone text not null default 'America/Sao_Paulo',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  avatar_url text,
  role public.profile_role not null default 'client',
  asaas_customer_id text unique,
  default_shop_id uuid references public.shops(id),
  birthdate date,
  document text,
  preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.barbers (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  display_name text not null,
  bio text,
  photo_url text,
  specialties text[] not null default '{}',
  rating numeric(3,2) not null default 5.00,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  description text,
  category text not null default 'barber',
  duration_minutes integer not null check (duration_minutes between 5 and 480),
  price_cents integer not null check (price_cents >= 0),
  icon_name text,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, name)
);

create table if not exists public.barber_services (
  barber_id uuid not null references public.barbers(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (barber_id, service_id)
);

create table if not exists public.barber_working_hours (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  slot_interval_minutes integer not null default 30,
  is_active boolean not null default true,
  check (starts_at < ends_at)
);

create table if not exists public.barber_time_off (
  id uuid primary key default gen_random_uuid(),
  barber_id uuid not null references public.barbers(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text,
  created_at timestamptz not null default now(),
  check (starts_at < ends_at)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  name text not null,
  tier text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  cuts_per_cycle integer not null default 1,
  cycle text not null default 'MONTHLY',
  benefits jsonb not null default '[]'::jsonb,
  loyalty_multiplier numeric(5,2) not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shop_id, tier)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  shop_id uuid not null references public.shops(id),
  asaas_subscription_id text unique,
  status public.subscription_status not null default 'pending',
  current_cycle_start date,
  current_cycle_end date,
  remaining_cuts integer not null default 0,
  auto_renew boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  code text not null unique,
  description text,
  percent_off numeric(5,2),
  amount_off_cents integer,
  max_uses integer,
  used_count integer not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  check (percent_off is not null or amount_off_cents is not null)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references public.shops(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  barber_id uuid not null references public.barbers(id),
  subscription_id uuid references public.subscriptions(id),
  coupon_id uuid references public.coupons(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'pending_payment',
  total_cents integer not null default 0,
  discount_cents integer not null default 0,
  cashback_used_cents integer not null default 0,
  notes text,
  canceled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at),
  check (total_cents >= 0 and discount_cents >= 0 and cashback_used_cents >= 0)
);

do $$ begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_no_overlap'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_no_overlap
      exclude using gist (
        barber_id with =,
        tstzrange(starts_at, ends_at, '[)') with &&
      )
      where (status in ('pending_payment', 'pending', 'confirmed', 'paid'));
  end if;
end $$;

create table if not exists public.appointment_services (
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  service_id uuid not null references public.services(id),
  price_cents integer not null,
  duration_minutes integer not null,
  primary key (appointment_id, service_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  asaas_payment_id text unique,
  asaas_invoice_url text,
  pix_payload text,
  pix_qr_code_url text,
  due_date date,
  paid_at timestamptz,
  raw_provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  points integer not null default 0,
  cashback_cents integer not null default 0,
  vip_level text not null default 'starter',
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  appointment_id uuid references public.appointments(id),
  kind text not null,
  points_delta integer not null default 0,
  cashback_delta_cents integer not null default 0,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null unique references public.appointments(id) on delete cascade,
  client_id uuid not null references public.profiles(id) on delete cascade,
  barber_id uuid not null references public.barbers(id),
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create table if not exists public.device_tokens (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token text not null unique,
  platform text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  shop_id uuid references public.shops(id) on delete cascade,
  title text not null,
  body text not null,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace view public.users as
select
  p.id,
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.role,
  p.asaas_customer_id,
  p.default_shop_id,
  p.created_at,
  p.updated_at
from public.profiles p;

alter view public.users set (security_invoker = true);

create or replace view public.schedules as
select
  wh.id,
  b.shop_id,
  wh.barber_id,
  'working_hour'::text as schedule_type,
  wh.weekday,
  wh.starts_at::text as starts_at,
  wh.ends_at::text as ends_at,
  wh.is_active
from public.barber_working_hours wh
join public.barbers b on b.id = wh.barber_id;

alter view public.schedules set (security_invoker = true);

create or replace view public.notifications as
select
  id,
  profile_id,
  shop_id,
  title,
  body,
  kind,
  data,
  read_at,
  sent_at,
  created_at
from public.notification_events;

alter view public.notifications set (security_invoker = true);

create table if not exists public.promo_banners (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid references public.shops(id) on delete cascade,
  title text not null,
  subtitle text,
  image_url text,
  cta_label text,
  cta_route text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_id)
);

create index if not exists idx_appointments_shop_start on public.appointments(shop_id, starts_at);
create index if not exists idx_appointments_client_start on public.appointments(client_id, starts_at desc);
create index if not exists idx_appointments_barber_start on public.appointments(barber_id, starts_at);
create index if not exists idx_payments_profile_status on public.payments(profile_id, status);
create index if not exists idx_subscriptions_profile_status on public.subscriptions(profile_id, status);
create index if not exists idx_notifications_profile_created on public.notification_events(profile_id, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.protect_profile_sensitive_fields()
returns trigger
language plpgsql
as $$
begin
  if not public.is_admin() then
    new.role = old.role;
    new.asaas_customer_id = old.asaas_customer_id;
    new.created_at = old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();

drop trigger if exists trg_profiles_protect_sensitive on public.profiles;
create trigger trg_profiles_protect_sensitive before update on public.profiles for each row execute function public.protect_profile_sensitive_fields();

drop trigger if exists trg_appointments_touch on public.appointments;
create trigger trg_appointments_touch before update on public.appointments for each row execute function public.touch_updated_at();

drop trigger if exists trg_payments_touch on public.payments;
create trigger trg_payments_touch before update on public.payments for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'manager')
  );
$$;

create or replace function public.is_barber_for(barber uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.barbers b
    where b.id = barber and b.profile_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;

  insert into public.loyalty_accounts (profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.shops enable row level security;
alter table public.profiles enable row level security;
alter table public.barbers enable row level security;
alter table public.services enable row level security;
alter table public.barber_services enable row level security;
alter table public.barber_working_hours enable row level security;
alter table public.barber_time_off enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.coupons enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_services enable row level security;
alter table public.payments enable row level security;
alter table public.loyalty_accounts enable row level security;
alter table public.loyalty_transactions enable row level security;
alter table public.reviews enable row level security;
alter table public.device_tokens enable row level security;
alter table public.notification_events enable row level security;
alter table public.promo_banners enable row level security;
alter table public.webhook_events enable row level security;

create policy "Public can read active shops" on public.shops for select using (is_active);
create policy "Admins manage shops" on public.shops for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own profile" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "Users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "Read active barbers" on public.barbers for select using (is_active or public.is_admin() or profile_id = auth.uid());
create policy "Admins manage barbers" on public.barbers for all using (public.is_admin()) with check (public.is_admin());

create policy "Read active services" on public.services for select using (is_active or public.is_admin());
create policy "Admins manage services" on public.services for all using (public.is_admin()) with check (public.is_admin());

create policy "Read barber services" on public.barber_services for select using (true);
create policy "Admins manage barber services" on public.barber_services for all using (public.is_admin()) with check (public.is_admin());

create policy "Read working hours" on public.barber_working_hours for select using (true);
create policy "Admins manage working hours" on public.barber_working_hours for all using (public.is_admin()) with check (public.is_admin());

create policy "Read relevant time off" on public.barber_time_off for select using (public.is_admin() or public.is_barber_for(barber_id));
create policy "Admins manage time off" on public.barber_time_off for all using (public.is_admin() or public.is_barber_for(barber_id)) with check (public.is_admin() or public.is_barber_for(barber_id));

create policy "Read active plans" on public.plans for select using (is_active or public.is_admin());
create policy "Admins manage plans" on public.plans for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own subscriptions" on public.subscriptions for select using (profile_id = auth.uid() or public.is_admin());
create policy "Admins manage subscriptions" on public.subscriptions for all using (public.is_admin()) with check (public.is_admin());

create policy "Read active coupons" on public.coupons for select using (is_active or public.is_admin());
create policy "Admins manage coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own appointments" on public.appointments for select using (client_id = auth.uid() or public.is_admin() or public.is_barber_for(barber_id));
create policy "Users create own appointments" on public.appointments for insert with check (client_id = auth.uid());
create policy "Users update own cancelable appointments" on public.appointments for update using (client_id = auth.uid()) with check (client_id = auth.uid());
create policy "Admins manage appointments" on public.appointments for all using (public.is_admin()) with check (public.is_admin());

create policy "Read appointment services" on public.appointment_services for select using (
  exists (
    select 1 from public.appointments a
    where a.id = appointment_id
      and (a.client_id = auth.uid() or public.is_admin() or public.is_barber_for(a.barber_id))
  )
);
create policy "Admins manage appointment services" on public.appointment_services for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own payments" on public.payments for select using (profile_id = auth.uid() or public.is_admin());
create policy "Admins manage payments" on public.payments for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own loyalty account" on public.loyalty_accounts for select using (profile_id = auth.uid() or public.is_admin());
create policy "Admins manage loyalty account" on public.loyalty_accounts for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own loyalty transactions" on public.loyalty_transactions for select using (profile_id = auth.uid() or public.is_admin());
create policy "Admins manage loyalty transactions" on public.loyalty_transactions for all using (public.is_admin()) with check (public.is_admin());

create policy "Users manage own reviews" on public.reviews for all using (client_id = auth.uid() or public.is_admin()) with check (client_id = auth.uid() or public.is_admin());

create policy "Users manage own device tokens" on public.device_tokens for all using (profile_id = auth.uid() or public.is_admin()) with check (profile_id = auth.uid() or public.is_admin());

create policy "Users read own notifications" on public.notification_events for select using (profile_id = auth.uid() or public.is_admin());
create policy "Users update own notifications" on public.notification_events for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "Admins manage notifications" on public.notification_events for all using (public.is_admin()) with check (public.is_admin());

create policy "Read active promo banners" on public.promo_banners for select using (is_active or public.is_admin());
create policy "Admins manage promo banners" on public.promo_banners for all using (public.is_admin()) with check (public.is_admin());

create policy "Admins read webhook events" on public.webhook_events for select using (public.is_admin());

insert into public.shops (name, slug, phone, address)
values ('Saviella The Barber', 'saviella-the-barber', null, '{}'::jsonb)
on conflict (slug) do nothing;

with s as (select id from public.shops where slug = 'saviella-the-barber' limit 1)
insert into public.services (shop_id, name, description, category, duration_minutes, price_cents, icon_name, sort_order)
select id, 'Corte', 'Corte masculino premium', 'hair', 45, 7000, 'scissors', 1 from s
union all select id, 'Barba', 'Barba desenhada com acabamento', 'beard', 30, 5000, 'razor', 2 from s
union all select id, 'Corte + Barba', 'Experiencia completa', 'combo', 75, 11000, 'sparkles', 3 from s
union all select id, 'Pigmentacao', 'Acabamento e cobertura', 'color', 45, 9000, 'palette', 4 from s
union all select id, 'Sobrancelha', 'Design masculino', 'brow', 20, 3000, 'eye', 5 from s
on conflict do nothing;

with s as (select id from public.shops where slug = 'saviella-the-barber' limit 1)
insert into public.plans (shop_id, name, tier, description, price_cents, cuts_per_cycle, benefits, loyalty_multiplier)
select id, 'Plano Gold', 'gold', 'Essencial para manter o visual sempre alinhado.', 14990, 2, '["2 cortes por mes", "Prioridade na agenda", "5% de cashback"]'::jsonb, 1.20 from s
union all select id, 'Plano Premium', 'premium', 'Mais beneficios para quem vive a experiencia completa.', 22990, 4, '["4 cortes por mes", "Barba com desconto", "10% de cashback", "Cupons exclusivos"]'::jsonb, 1.50 from s
union all select id, 'Plano VIP', 'vip', 'Atendimento premium com vantagens maximas.', 34990, 8, '["8 cortes por mes", "Agenda prioritaria", "15% de cashback", "Programa VIP"]'::jsonb, 2.00 from s
on conflict do nothing;
