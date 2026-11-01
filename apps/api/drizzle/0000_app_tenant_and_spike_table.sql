-- Hand-written: Drizzle's schema builder cannot express FORCE ROW LEVEL SECURITY.

-- The repo is public, so no password appears here. On Neon the owner sets one by
-- hand after this runs, and keeps it as a secret.
--
-- Roles belong to the whole server, not to one database, so the role may already
-- exist when a second database migrates. A role made in the Neon Console would also
-- exist, but it has BYPASSRLS (ADR-0001), so refuse it instead of silently trusting
-- it: with that role, every policy below would do nothing.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_tenant') THEN
    CREATE ROLE app_tenant LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE;
  ELSIF EXISTS (
    SELECT FROM pg_roles
    WHERE rolname = 'app_tenant' AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'app_tenant exists with SUPERUSER or BYPASSRLS, so RLS would not apply to it';
  END IF;
END
$$;
--> statement-breakpoint

-- Spike table, dropped with the spike module before Sprint 1 ends. It follows the
-- shape from docs/erd.md, except shop_id has no foreign key: shops arrives in Sprint 2.
CREATE TABLE spike_shop_rows (
  shop_id uuid NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  note text NOT NULL,
  PRIMARY KEY (shop_id, id)
);
--> statement-breakpoint

ALTER TABLE spike_shop_rows ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- ENABLE alone exempts the table's owner. FORCE applies the policies to the owner too.
ALTER TABLE spike_shop_rows FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- NULLIF is required, not defensive. An unset setting returns NULL here because of
-- the `true` argument, but once a connection has used SET LOCAL, the setting returns
-- '' after that transaction ends. ''::uuid would raise an error, so NULLIF turns it
-- back into NULL, and shop_id = NULL matches no row.
CREATE POLICY shop_isolation ON spike_shop_rows TO app_tenant
  USING (shop_id = NULLIF(current_setting('app.shop_id', true), '')::uuid)
  WITH CHECK (shop_id = NULLIF(current_setting('app.shop_id', true), '')::uuid);
--> statement-breakpoint

GRANT USAGE ON SCHEMA public TO app_tenant;
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON spike_shop_rows TO app_tenant;
