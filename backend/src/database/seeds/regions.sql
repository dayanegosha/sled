INSERT INTO regions (name_ru, name_en, name_zh, code, geom, area_m2)
VALUES
  ('Москва','Moscow','莫斯科','RU-MOW', ST_Multi(ST_GeomFromText('POLYGON((37.35 55.55,37.95 55.55,37.95 55.95,37.35 55.95,37.35 55.55))', 4326))::geography, 1000000000),
  ('Санкт-Петербург','Saint Petersburg','圣彼得堡','RU-SPE', ST_Multi(ST_GeomFromText('POLYGON((30.0 59.75,30.6 59.75,30.6 60.1,30.0 60.1,30.0 59.75))', 4326))::geography, 1439000000)
ON CONFLICT (code) DO NOTHING;
