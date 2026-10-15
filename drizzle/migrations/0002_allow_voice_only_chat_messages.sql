ALTER TABLE public.chat_messages DROP CONSTRAINT chat_messages_body_check;
ALTER TABLE public.chat_messages ADD CONSTRAINT chat_messages_body_check
  CHECK (char_length(body) <= 1000 AND (char_length(body) >= 1 OR audio_path IS NOT NULL));