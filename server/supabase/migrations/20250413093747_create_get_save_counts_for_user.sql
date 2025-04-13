-- server/supabase/migrations/YYYYMMDDHHMMSS_create_get_save_counts_function.sql

-- Function to get save counts per platform for a specific user
CREATE OR REPLACE FUNCTION get_save_counts_for_user(p_userid TEXT)
RETURNS TABLE (platform platform_enum, count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT si.platform, COUNT(*) as count
    FROM "SavedItem" si
    WHERE si."userId" = p_userid
    GROUP BY si.platform;
END;
$$;

COMMENT ON FUNCTION get_save_counts_for_user(TEXT) IS 'Returns the count of saved items per platform for a given userId.';
