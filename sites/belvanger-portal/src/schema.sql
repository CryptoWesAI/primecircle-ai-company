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

-- "Deze periode bespaard"-widget (Overzicht-tabblad): gemiddelde klus-waarde in
-- hele euro's, per tenant door platform_admin ingesteld. NULL = nog niet ingesteld,
-- dan valt de widget terug op een indicatieve default (zie DEFAULT_AVG_JOB_VALUE in
-- server.js) en toont een hint dat het bedrag indicatief is.
-- Grens (1-100.000) wordt in server.js afgedwongen bij het opslaan, niet hier via
-- een CHECK-constraint: schema.sql draait bij elke boot opnieuw en ALTER TABLE ...
-- ADD CONSTRAINT kent geen "IF NOT EXISTS" in PostgreSQL.
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS avg_job_value INTEGER;

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

-- Partners: het eigen netwerk van een tenant om een lead handmatig naar door te zetten
-- als de tenant zelf geen tijd heeft. Bewust geen automatische routing/matching — de
-- tenant kiest zelf, per lead, welke partner. Zie ook de servicebelofte-copy in
-- docs/offers/belvanger-servicebelofte-copy-2026-07-24.md.
CREATE TABLE IF NOT EXISTS partners (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS partners_tenant_idx ON partners (tenant_id, name);

-- Losstaand van de bestaande status (new/follow_up/contacted/closed), die de tenant apart
-- blijft bijhouden: een doorverwijzing is geen vervanging van de status, een aanvulling erop.
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS referred_partner_id BIGINT REFERENCES partners(id) ON DELETE SET NULL;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ;

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

-- Zichtbaarheid: site-analytics per klant (Microsoft Clarity Data Export API +
-- link naar Google Search Console). Losstaat van tenant_integrations, want dit zijn
-- geen lead-kanalen maar zichtbaarheidsdata; elke tenant heeft er ten hoogste één van.
-- Nu alleen ingevuld voor Belvanger zelf, per-klant volgt later.
-- Wachtwoord vergeten: eenmalig bruikbare, tijdelijke reset-tokens. Alleen de hash
-- wordt bewaard (zelfde patroon als sessions.token_hash), nooit het ruwe token.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens (user_id, created_at DESC);

-- 2FA (e-mail-OTP): na een juist wachtwoord, vóórdat er een echte sessie komt, moet
-- er een 6-cijferige code uit e-mail worden ingevoerd. login_challenges is de
-- tussenstap (het echte session-token wordt pas aangemaakt ná een juiste code).
CREATE TABLE IF NOT EXISTS login_challenges (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- "Vertrouw dit apparaat 30 dagen": slaat een 2FA-check over bij een herkend apparaat.
CREATE TABLE IF NOT EXISTS trusted_devices (
  token_hash TEXT PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tenant_analytics (
  tenant_id BIGINT PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  clarity_project_id TEXT,
  clarity_api_token TEXT,
  search_console_url TEXT,
  clarity_last_fetched_at TIMESTAMPTZ,
  clarity_last_payload JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Web Push (PWA/Android-app): één rij per toestel dat meldingen aan heeft gezet.
--
-- GDPR: `endpoint` is een apparaat-identificator en dus persoonsgegeven. Daarom
-- staat hier bewust GEEN user-agent, IP of toestelnaam bij (zelfde
-- anonimiseringslijn als het bezoekersdashboard), en daarom wordt de rij op drie
-- momenten hard verwijderd: bij uitloggen, bij een 404/410 van de push-dienst, en
-- als de klant zelf de meldingen uitzet. Zonder die verwijdering bij uitloggen
-- blijven lead-meldingen naar een toestel gaan dat geen geldige sessie meer heeft.
--
-- `failure_count` en `last_success_at` zijn geen statistiek maar een storingssignaal:
-- Web Push kent geen afleverbewijs, dus een toestel dat stil gestopt is met werken
-- (OEM-batterijbeheer, Chrome-data gewist) is alleen zo te zien.
CREATE TABLE IF NOT EXISTS push_devices (
  id BIGSERIAL PRIMARY KEY,
  tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_success_at TIMESTAMPTZ,
  last_failure_at TIMESTAMPTZ,
  failure_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS push_devices_tenant_idx ON push_devices (tenant_id);
CREATE INDEX IF NOT EXISTS push_devices_user_idx ON push_devices (user_id);
