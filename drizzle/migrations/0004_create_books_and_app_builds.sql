CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text,
  description text,
  file_path text NOT NULL,
  cover_url text,
  pages integer,
  publish_at timestamptz NOT NULL DEFAULT now(),
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.books TO anon, authenticated;
GRANT ALL ON public.books TO service_role;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published books" ON public.books FOR SELECT TO anon, authenticated USING (published = true);

CREATE TABLE public.app_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_name text NOT NULL,
  notes text,
  file_path text NOT NULL,
  file_size bigint,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.app_builds TO anon, authenticated;
GRANT ALL ON public.app_builds TO service_role;
ALTER TABLE public.app_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published app builds" ON public.app_builds FOR SELECT TO anon, authenticated USING (published = true);