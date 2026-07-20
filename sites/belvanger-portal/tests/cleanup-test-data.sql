BEGIN;
DELETE FROM events WHERE metadata @> '{"test": true}'::jsonb;
DELETE FROM contacts c
WHERE NOT EXISTS (SELECT 1 FROM events e WHERE e.contact_id = c.id);
COMMIT;
