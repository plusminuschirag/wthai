-- Optional: Define an ENUM type for platforms for better data integrity
CREATE TYPE platform_enum AS ENUM ('x', 'reddit', 'linkedin', 'chatgpt');

-- Create the SavedItem table
CREATE TABLE "SavedItem" (
    "itemId" UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique ID for each saved item
    "userId" TEXT NOT NULL,                         -- Foreign key to the User table
    "platform" platform_enum NOT NULL,              -- The platform the item is from (using ENUM)
    "url" TEXT NOT NULL,                            -- The URL of the saved content
    "savedAt" TIMESTAMPTZ DEFAULT now() NOT NULL,   -- Timestamp when the item was saved
    -- Optional: Supabase typically adds createdAt automatically
    -- "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,

    -- Foreign Key Constraint linking to the User table
    CONSTRAINT fk_user
        FOREIGN KEY("userId")
        REFERENCES "User"("userId")
        ON DELETE CASCADE, -- If a user is deleted, their saved items are also deleted

    -- Ensure a user cannot save the exact same URL from the same platform twice
    UNIQUE ("userId", "platform", "url")
);

-- Add comments for clarity
COMMENT ON TABLE "SavedItem" IS 'Stores individual items saved by users from various platforms.';
COMMENT ON COLUMN "SavedItem"."itemId" IS 'Unique identifier for the saved item.';
COMMENT ON COLUMN "SavedItem"."userId" IS 'References the user who saved the item.';
COMMENT ON COLUMN "SavedItem"."platform" IS 'The source platform (e.g., x, reddit).';
COMMENT ON COLUMN "SavedItem"."url" IS 'The URL of the saved content.';
COMMENT ON COLUMN "SavedItem"."savedAt" IS 'Timestamp when the item was originally saved by the user.';

-- Indices for common query patterns
CREATE INDEX idx_saveditem_user_platform ON "SavedItem" ("userId", "platform"); -- For fetching items per user/platform & counts
CREATE INDEX idx_saveditem_user_savedat ON "SavedItem" ("userId", "savedAt" DESC); -- For fetching recent items for a user