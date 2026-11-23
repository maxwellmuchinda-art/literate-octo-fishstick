-- Inserts the made-up starting records ONCE (the marker row stops a second run)
WITH marker AS (
  INSERT INTO app_meta (key) VALUES ('seeded') ON CONFLICT DO NOTHING RETURNING key
)
INSERT INTO records (title, category, description, status)
SELECT v.title, v.category, v.description, v.status
FROM (VALUES
  ('Broken classroom light',  'Electrical',        'The light in Room B12 does not switch on.',                      'Pending'),
  ('Leaking tap in hostel',   'Plumbing',          'The tap in the Block C ablution area drips all night.',          'In progress'),
  ('Broken lecture chair',    'Furniture',         'Chair 14 in Lecture Hall 2 has a cracked leg.',                  'Pending'),
  ('Flickering corridor bulb','Electrical',        'The bulb near the library entrance flickers constantly.',        'Completed'),
  ('Blocked sink in lab',     'Plumbing',          'The sink in the Computer Lab washroom is blocked.',              'In progress'),
  ('Loose desk top',          'Furniture',         'A desk in Room A3 wobbles and the top is coming off.',           'Pending'),
  ('Window will not close',   'Doors and Windows', 'The window in Room D5 cannot be shut properly.',                 'Completed'),
  ('Dead socket in office',   'Electrical',        'The wall socket in the admin office has no power.',              'Pending'),
  ('Broken toilet flush',     'Plumbing',          'The flush in the male toilet near the cafeteria is broken.',     'In progress')
) AS v(title, category, description, status)
WHERE EXISTS (SELECT 1 FROM marker);
