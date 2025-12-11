ALTER TABLE brand_identity 
ADD COLUMN IF NOT EXISTS confidence_notes JSONB,
ADD COLUMN IF NOT EXISTS warnings JSONB,
ADD COLUMN IF NOT EXISTS next_steps JSONB,
ADD COLUMN IF NOT EXISTS executive_summary TEXT,
ADD COLUMN IF NOT EXISTS awareness_level TEXT CHECK (awareness_level IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS maturity_score INTEGER CHECK (maturity_score >= 0 AND maturity_score <= 100);


