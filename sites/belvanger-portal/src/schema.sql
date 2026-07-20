CREATE TABLE IF NOT EXISTS tenants (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Europe/Amsterdam',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
-- Systeemcheck: welk domein bij deze klant hoort. Het n8n-workflow-ID hoort per
-- KANAAL (twilio/website/email), niet per klant, en staat daarom in
-- tenant_integrations.config (elke klant heeft immers al één workflow per bron).
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS website_domain TEXT;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN NOT NULL DEFAULT TRUE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, email)
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer_admin';

CREATE TABLE IF NOT EXISTS tenant_integrations (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('twilio', 'website', 'email', 'chatbot')),
  label TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  external_identifier TEXT,
  twilio_account_sid TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'connected', 'paused')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_event_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, source)
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_integrations_source_identifier_unique
  ON tenant_integrations (source, external_identifier) WHERE external_identifier IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS tenant_integrations_twilio_account_unique
  ON tenant_integrations (twilio_account_sid) WHERE twilio_account_sid IS NOT NULL;

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT,
  company TEXT,
  phone TEXT,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'follow_up', 'contacted', 'closed')),
  last_event_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_phone_unique
  ON contacts (tenant_id, phone) WHERE phone IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_email_unique
  ON contacts (tenant_id, email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS contacts_tenant_status_idx ON contacts (tenant_id, status, last_event_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  contact_id BIGINT REFERENCES contacts(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  event_type TEXT NOT NULL,
  direction TEXT CHECK (direction IS NULL OR direction IN ('inbound', 'outbound', 'system')),
  external_id TEXT,
  status TEXT,
  subject TEXT,
  preview TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, dedupe_key)
);

CREATE INDEX IF NOT EXISTS events_tenant_time_idx ON events (tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_contact_time_idx ON events (contact_id, occurred_at DESC);

-- Activiteitenlog: platform-niveau (niet aan een tenant gebonden), alleen zichtbaar
-- voor platform_admin. Bijgehouden beslissingen/bouwwerk/fixes/tests aan Belvanger
-- zelf, niet klantactiviteit (die staat al in events/contacts hierboven).
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  log_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('beslissing', 'bouwwerk', 'fix', 'test', 'onderzoek', 'infra')),
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_by TEXT NOT NULL DEFAULT 'claude',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS activity_log_date_idx ON activity_log (log_date DESC, id);
