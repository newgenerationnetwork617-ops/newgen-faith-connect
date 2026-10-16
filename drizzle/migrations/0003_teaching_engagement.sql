CREATE TABLE public.teaching_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 teaching_id uuid NOT NULL REFERENCES public.teachings(id) ON DELETE CASCADE,
 author_hash text NOT NULL CHECK (length(author_hash) = 64),
 name text NOT NULL CHECK (length(name) BETWEEN 1 AND 60),
 body text NOT NULL CHECK (length(body) BETWEEN 1 AND 1000),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.teaching_comments TO service_role;
GRANT SELECT (id, teaching_id, name, body, created_at) ON public.teaching_comments TO anon, authenticated;
ALTER TABLE public.teaching_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read comments on published teachings" ON public.teaching_comments FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.teachings t WHERE t.id = teaching_id AND t.published AND t.publish_at <= now()));
CREATE INDEX teaching_comments_teaching_date ON public.teaching_comments(teaching_id, created_at DESC);
CREATE TABLE public.teaching_likes (
 teaching_id uuid NOT NULL REFERENCES public.teachings(id) ON DELETE CASCADE,
 author_hash text NOT NULL CHECK (length(author_hash) = 64),
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (teaching_id, author_hash)
);
GRANT ALL ON public.teaching_likes TO service_role;
ALTER TABLE public.teaching_likes ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.teaching_like_count(_teaching_id uuid) RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT count(*) FROM public.teaching_likes l WHERE l.teaching_id = _teaching_id AND EXISTS (SELECT 1 FROM public.teachings t WHERE t.id = _teaching_id AND t.published AND t.publish_at <= now()) $$;
REVOKE ALL ON FUNCTION public.teaching_like_count(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.teaching_like_count(uuid) TO anon, authenticated, service_role;