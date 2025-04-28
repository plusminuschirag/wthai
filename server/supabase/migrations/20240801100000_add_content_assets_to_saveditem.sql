-- Add 'content' column to store the main text of the saved item
ALTER TABLE "SavedItem"
ADD COLUMN "content" TEXT;

-- Add 'assets' column to store a list of associated media asset URLs or identifiers
ALTER TABLE "SavedItem"
ADD COLUMN "assets" TEXT[]; -- Using TEXT[] for an array of strings

-- Add comments for the new columns
COMMENT ON COLUMN "SavedItem"."content" IS 'The main textual content of the saved item (e.g., tweet text, article body).';
COMMENT ON COLUMN "SavedItem"."assets" IS 'URLs or identifiers for associated media assets (images, videos).'; 