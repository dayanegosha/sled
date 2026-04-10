CREATE OR REPLACE FUNCTION sync_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_likes_count ON likes;
CREATE TRIGGER trg_sync_likes_count AFTER INSERT OR DELETE ON likes
FOR EACH ROW EXECUTE FUNCTION sync_likes_count();

DROP MATERIALIZED VIEW IF EXISTS heatmap_zoom10;
CREATE MATERIALIZED VIEW heatmap_zoom10 AS
SELECT ST_SnapToGrid(location::geometry, 0.01) AS cell_center,
       COUNT(DISTINCT user_id) AS user_count,
       COUNT(*) AS visit_count
FROM tracks
GROUP BY cell_center;
