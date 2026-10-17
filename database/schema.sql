CREATE TABLE IF NOT EXISTS assets (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  environment VARCHAR(50) NOT NULL,
  owner VARCHAR(255) NOT NULL,
  business_unit VARCHAR(255) NOT NULL,
  risk_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
  id SERIAL PRIMARY KEY,
  asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  cvss NUMERIC(3,1) NOT NULL CHECK (cvss >= 0 AND cvss <= 10),
  status VARCHAR(20) NOT NULL CHECK (status IN ('Open', 'In Progress', 'Mitigated', 'Resolved')),
  owner VARCHAR(255) NOT NULL,
  package_name VARCHAR(255) NOT NULL,
  last_seen DATE NOT NULL,
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vulnerabilities_asset_id ON vulnerabilities(asset_id);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity ON vulnerabilities(severity);
CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status ON vulnerabilities(status);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vulnerabilities_severity_check') THEN
    ALTER TABLE vulnerabilities
      ADD CONSTRAINT vulnerabilities_severity_check
      CHECK (severity IN ('Critical', 'High', 'Medium', 'Low'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vulnerabilities_cvss_check') THEN
    ALTER TABLE vulnerabilities
      ADD CONSTRAINT vulnerabilities_cvss_check
      CHECK (cvss >= 0 AND cvss <= 10);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vulnerabilities_status_check') THEN
    ALTER TABLE vulnerabilities
      ADD CONSTRAINT vulnerabilities_status_check
      CHECK (status IN ('Open', 'In Progress', 'Mitigated', 'Resolved'));
  END IF;
END $$;
