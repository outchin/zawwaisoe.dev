-- Ooredoo hackathon: add a team photo after the certificate.
UPDATE "Award" SET
  "images" = ARRAY['/achievements/ooredoo-hackathon-2019.jpg', '/achievements/ooredoo-hackathon-team-2019.jpg'],
  "updatedAt" = now()
WHERE "slug" = 'ooredoo-hackathon' AND "images" = ARRAY['/achievements/ooredoo-hackathon-2019.jpg'];
