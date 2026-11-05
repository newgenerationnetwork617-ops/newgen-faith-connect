CREATE POLICY "Anyone can read books bucket objects" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'books');

CREATE POLICY "Anyone can read app-files bucket objects" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'app-files');