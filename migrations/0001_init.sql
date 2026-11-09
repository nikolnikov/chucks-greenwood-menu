-- One row per beer-on-a-tap. A beer that leaves the list gets removed_at set;
-- if it comes back it is treated as a fresh keg (first_seen reset).
CREATE TABLE IF NOT EXISTS beers (
  key TEXT PRIMARY KEY,
  tap INTEGER NOT NULL,
  brewery TEXT NOT NULL,
  name TEXT NOT NULL,
  first_seen TEXT NOT NULL,
  last_seen TEXT NOT NULL,
  removed_at TEXT,
  -- 1 when the beer was already on tap the first time tracking ran, so its
  -- real start date is unknown.
  baseline INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS beers_active ON beers (removed_at);
