
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- devotionals
CREATE TABLE public.devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT NOT NULL DEFAULT '',
  verse TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  application TEXT NOT NULL DEFAULT '',
  prayer TEXT NOT NULL DEFAULT '',
  memory_verse TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  publish_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.devotionals TO anon, authenticated;
GRANT ALL ON public.devotionals TO service_role;
ALTER TABLE public.devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public devotionals" ON public.devotionals FOR SELECT TO anon, authenticated USING (published AND publish_at <= now());
CREATE TRIGGER devotionals_updated BEFORE UPDATE ON public.devotionals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- teachings
CREATE TABLE public.teachings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  speaker TEXT NOT NULL DEFAULT '',
  topic TEXT NOT NULL DEFAULT '',
  series TEXT,
  kind TEXT NOT NULL DEFAULT 'video',
  youtube_id TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  duration TEXT,
  description TEXT,
  publish_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.teachings TO anon, authenticated;
GRANT ALL ON public.teachings TO service_role;
ALTER TABLE public.teachings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public teachings" ON public.teachings FOR SELECT TO anon, authenticated USING (published AND publish_at <= now());
CREATE TRIGGER teachings_updated BEFORE UPDATE ON public.teachings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- events
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  location TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL DEFAULT 'Event',
  description TEXT,
  link TEXT,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.events TO anon, authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public events" ON public.events FOR SELECT TO anon, authenticated USING (published);
CREATE TRIGGER events_updated BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- announcements
CREATE TABLE public.announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  publish_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.announcements TO anon, authenticated;
GRANT ALL ON public.announcements TO service_role;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public announcements" ON public.announcements FOR SELECT TO anon, authenticated USING (published AND publish_at <= now());
CREATE TRIGGER announcements_updated BEFORE UPDATE ON public.announcements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- live streams
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  youtube_id TEXT,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_live BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.live_streams TO anon, authenticated;
GRANT ALL ON public.live_streams TO service_role;
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public live" ON public.live_streams FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER live_updated BEFORE UPDATE ON public.live_streams FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- prayer requests
CREATE TABLE public.prayer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Anonymous',
  request TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'prayer',
  status TEXT NOT NULL DEFAULT 'new',
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.prayer_requests TO anon, authenticated;
GRANT ALL ON public.prayer_requests TO service_role;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved prayers readable" ON public.prayer_requests FOR SELECT TO anon, authenticated USING (approved);
CREATE POLICY "anyone can submit prayer" ON public.prayer_requests FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(request) BETWEEN 1 AND 2000 AND char_length(name) <= 80 AND kind IN ('prayer','praise') AND approved = false AND status = 'new');

-- testimonies
CREATE TABLE public.testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Anonymous',
  message TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.testimonies TO anon, authenticated;
GRANT ALL ON public.testimonies TO service_role;
ALTER TABLE public.testimonies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved testimonies readable" ON public.testimonies FOR SELECT TO anon, authenticated USING (approved);
CREATE POLICY "anyone can submit testimony" ON public.testimonies FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(message) BETWEEN 1 AND 4000 AND char_length(name) <= 80 AND approved = false);

-- community posts
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Believer',
  body TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.community_posts TO anon, authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved posts readable" ON public.community_posts FOR SELECT TO anon, authenticated USING (approved);
CREATE POLICY "anyone can post" ON public.community_posts FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(body) BETWEEN 1 AND 2000 AND char_length(name) <= 80 AND approved = false);

-- contact info (single row)
CREATE TABLE public.contact_info (
  id INT PRIMARY KEY DEFAULT 1,
  whatsapp_numbers TEXT[] NOT NULL DEFAULT '{}',
  email TEXT NOT NULL DEFAULT '',
  youtube TEXT NOT NULL DEFAULT '',
  facebook TEXT,
  instagram TEXT,
  address TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT contact_single_row CHECK (id = 1)
);
GRANT SELECT ON public.contact_info TO anon, authenticated;
GRANT ALL ON public.contact_info TO service_role;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public contact" ON public.contact_info FOR SELECT TO anon, authenticated USING (true);
CREATE TRIGGER contact_updated BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.contact_info (id, whatsapp_numbers, email, youtube)
VALUES (1, ARRAY['+2349159942740','+2347018184333','+2349066328985','+2347046847936'],
        'newgenerationnetwork617@gmail.com', 'https://www.youtube.com/@NGNOfficialTV');

INSERT INTO public.devotionals (title, theme, verse, message, application, prayer, memory_verse) VALUES
('Standing In Grace', 'Grace', 'Ephesians 2:8-9',
 'Grace does not ask you to earn it. It simply asks you to receive it. Every believer stands upright not by their own strength but by the finished work of Christ.',
 'Today, receive God''s grace afresh. Release the pressure of performing for approval you already have in Christ.',
 'Father, thank You for grace that saves and sustains me. Teach me to walk humbly and joyfully in it, in Jesus'' name. Amen.',
 'For by grace you have been saved through faith. — Ephesians 2:8');

INSERT INTO public.announcements (title, body) VALUES
('Raised To Raise', 'We are a people raised to raise a righteous generation for Christ. Join us this week as we gather in worship and the Word.');

INSERT INTO public.events (title, starts_at, location, event_type, description) VALUES
('Sunday Worship Service', now() + interval '3 days', 'NGN Auditorium', 'Service', 'A time of worship, the Word and prayer.'),
('Night of Encounter', now() + interval '10 days', 'Online & Onsite', 'Conference', 'A prophetic night of prayer and encounter.');

INSERT INTO public.teachings (title, speaker, topic, kind, duration) VALUES
('Walking In The Spirit', 'Pastor NGN', 'Holy Spirit', 'video', '42:10'),
('Faith That Moves Mountains', 'Pastor NGN', 'Faith', 'audio', '31:45'),
('Foundations Of Discipleship', 'NGN Teaching Team', 'Discipleship', 'study', '55:02');

INSERT INTO public.live_streams (title, youtube_id, is_live, description) VALUES
('NGN Live Worship', NULL, false, 'Our next live broadcast. Stay tuned.');
