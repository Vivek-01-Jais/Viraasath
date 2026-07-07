-- Dynamic site content (banners, hero text, taglines, etc.)
-- Key-value store so you can change content without touching code

CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Default seeding
INSERT INTO site_content (key, value) VALUES
  ('hero_badge', 'Summer Collection 2026'),
  ('hero_title_1', 'Where Heritage'),
  ('hero_title_2', 'Meets Modernity'),
  ('hero_tagline', 'Handcrafted kurtis that celebrate India''s textile legacy — reimagined for the woman who honors tradition while defining her own future.'),
  ('hero_cta', 'Explore Collection'),
  ('ethos_title_1', 'Handcrafted with Love'),
  ('ethos_desc_1', 'Each piece tells a story of generations of craftsmanship.'),
  ('ethos_title_2', 'Premium Fabrics'),
  ('ethos_desc_2', 'Sourced from the finest textile hubs across India.'),
  ('ethos_title_3', 'Free Returns'),
  ('ethos_desc_3', 'Free returns within 15 days, secure checkout, and dedicated support.')
ON CONFLICT (key) DO NOTHING;

NOTIFY pgrst, 'reload schema';
