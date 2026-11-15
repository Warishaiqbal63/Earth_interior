-- Earth Interior — Neon Postgres schema. Safe to run repeatedly (npm run db:setup).

CREATE TABLE IF NOT EXISTS products (
  id               SERIAL PRIMARY KEY,
  title            TEXT        NOT NULL,
  slug             TEXT        NOT NULL UNIQUE,
  category         TEXT        NOT NULL,
  price            INTEGER     NULL CHECK (price IS NULL OR price > 0),
  compare_at_price INTEGER     NULL CHECK (compare_at_price IS NULL OR compare_at_price > 0),
  description      TEXT        NOT NULL DEFAULT '',
  dimensions       TEXT        NOT NULL DEFAULT '',
  features         JSONB       NOT NULL DEFAULT '[]'::jsonb,
  images           JSONB       NOT NULL DEFAULT '[]'::jsonb,
  sort_order       INTEGER     NOT NULL DEFAULT 0,
  published        BOOLEAN     NOT NULL DEFAULT TRUE,
  is_sample        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_public ON products (published, sort_order, id);

CREATE TABLE IF NOT EXISTS settings (
  id   INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data JSONB   NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id         SERIAL PRIMARY KEY,
  name       TEXT        NOT NULL,
  phone      TEXT        NOT NULL,
  product_id INTEGER     NULL REFERENCES products(id) ON DELETE SET NULL,
  message    TEXT        NOT NULL DEFAULT '',
  handled    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_leads_inbox ON leads (handled, created_at DESC);

CREATE TABLE IF NOT EXISTS admin_users (
  id            SERIAL PRIMARY KEY,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  last_login_at TIMESTAMPTZ NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT        NOT NULL,
  email        TEXT        NOT NULL DEFAULT '',
  succeeded    BOOLEAN     NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_login_ip ON login_attempts (ip, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_email ON login_attempts (email, attempted_at);

CREATE TABLE IF NOT EXISTS lead_attempts (
  id           BIGSERIAL PRIMARY KEY,
  ip           TEXT        NOT NULL,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_attempts_ip ON lead_attempts (ip, attempted_at);
