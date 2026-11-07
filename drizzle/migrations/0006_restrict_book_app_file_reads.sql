DROP POLICY IF EXISTS "Anyone can read books bucket objects" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read app-files bucket objects" ON storage.objects;

CREATE POLICY "Read files of published books" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'books' AND EXISTS (SELECT 1 FROM public.books b WHERE b.file_path = storage.objects.name AND b.published = true));

CREATE POLICY "Read files of published app builds" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'app-files' AND EXISTS (SELECT 1 FROM public.app_builds a WHERE a.file_path = storage.objects.name AND a.published = true));