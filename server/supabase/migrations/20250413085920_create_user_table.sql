-- Create the User table
CREATE TABLE "User" (
    "userId" TEXT PRIMARY KEY,          -- Maps to Mongoose userId (Google User ID), primary key
    "email" TEXT UNIQUE NOT NULL,       -- Maps to Mongoose email, unique and required
    "name" TEXT NOT NULL,               -- Maps to Mongoose name, required
    "picture" TEXT,                     -- Maps to Mongoose picture, optional
    "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL, -- Maps to Mongoose createdAt
    "lastLoginAt" TIMESTAMPTZ DEFAULT now() NOT NULL -- Maps to Mongoose lastLoginAt
);

-- Add comments to clarify column origins
COMMENT ON COLUMN "User"."userId" IS 'Google User ID (sub)';
COMMENT ON COLUMN "User"."email" IS 'User email address';
COMMENT ON COLUMN "User"."name" IS 'User display name';
COMMENT ON COLUMN "User"."picture" IS 'URL to user profile picture';
COMMENT ON COLUMN "User"."createdAt" IS 'Timestamp of user creation';
COMMENT ON COLUMN "User"."lastLoginAt" IS 'Timestamp of last user login';

-- Optional: Add an index on email for faster lookups, similar to Mongoose schema
CREATE INDEX idx_user_email ON "User" ("email");
