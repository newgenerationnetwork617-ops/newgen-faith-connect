CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  author_hash text NOT NULL,
  hidden boolean NOT NULL DEFAULT false,
  edited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, name, body, hidden, edited_at, created_at) ON public.chat_messages TO anon, authenticated;
GRANT ALL ON public.chat_messages TO service_role;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Visible chat messages are public" ON public.chat_messages FOR SELECT TO anon, authenticated USING (hidden = false);
CREATE INDEX chat_messages_created_idx ON public.chat_messages (created_at DESC);