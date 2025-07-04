
ALTER TABLE duplicates ADD COLUMN pattern_hash TEXT NOT NULL DEFAULT '';
CREATE INDEX idx_duplicates_pattern_hash ON duplicates(pattern_hash);
CREATE INDEX idx_duplicates_user_hash ON duplicates(user_id, pattern_hash);
