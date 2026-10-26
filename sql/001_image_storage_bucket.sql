-- Run manually in Supabase SQL Editor after reviewing. Do not run twice.
-- Public-read bucket is necessary for the current main app's public image URLs.
-- Upload/delete access is restricted to the authenticated, server-side admin endpoint.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('caption-fight-club-images', 'caption-fight-club-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
-- No public INSERT/UPDATE/DELETE policies are created for storage.objects.
