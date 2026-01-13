-- Create rankings table for economic sense test
-- Schema: economic_sense_test
CREATE TABLE IF NOT EXISTS economic_sense_test.economic_rankings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname VARCHAR(50) NOT NULL,
  final_balance BIGINT NOT NULL,
  total_return DECIMAL(10,2) NOT NULL,
  investor_type VARCHAR(50) NOT NULL,
  risk_score INTEGER NOT NULL,
  rationality_score INTEGER NOT NULL,
  luck_score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster ranking queries
CREATE INDEX IF NOT EXISTS idx_economic_rankings_return ON economic_sense_test.economic_rankings(total_return DESC);

-- Enable Row Level Security
ALTER TABLE economic_sense_test.economic_rankings ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rankings
CREATE POLICY "Anyone can read rankings" ON economic_sense_test.economic_rankings
  FOR SELECT USING (true);

-- Allow anyone to insert rankings
CREATE POLICY "Anyone can insert rankings" ON economic_sense_test.economic_rankings
  FOR INSERT WITH CHECK (true);
