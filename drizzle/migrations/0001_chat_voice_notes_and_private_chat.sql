ALTER TABLE public.chat_messages
  ADD COLUMN audio_path text,
  ADD COLUMN audio_seconds integer,
  ADD COLUMN sender_id uuid,
  ADD COLUMN recipient_id uuid;
ALTER TABLE public.chat_messages ALTER COLUMN body SET DEFAULT '';

CREATE TABLE public.chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_hash text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'Believer',
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.chat_members TO service_role;
ALTER TABLE public.chat_members ENABLE ROW LEVEL SECURITY;

DROP POLICY "Visible chat messages are public" ON public.chat_messages;
CREATE POLICY "Visible public chat messages" ON public.chat_messages
  FOR SELECT TO anon, authenticated USING (hidden = false AND recipient_id IS NULL);
CREATE INDEX chat_messages_dm_idx ON public.chat_messages (sender_id, recipient_id, created_at);