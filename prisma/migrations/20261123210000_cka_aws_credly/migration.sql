-- CKA and AWS Cloud Practitioner: Credly badge screenshots, public verify links, exact dates.
UPDATE "Award" SET
  "validUntil" = 'Nov 2026',
  "credentialUrl" = 'https://www.credly.com/badges/e57b2818-5370-43c4-bcc3-cea0d28459b4/public_url',
  "images" = ARRAY['/achievements/cka-credly.png'],
  "updatedAt" = now()
WHERE "slug" = 'cka' AND cardinality("images") = 0;

UPDATE "Award" SET
  "date" = 'Sep 2021',
  "validUntil" = 'Sep 2024',
  "description" = $$Foundational AWS knowledge: cloud concepts, the shared responsibility model and security, core services across compute, storage, networking and databases, and pricing and billing. Earned in September 2021; the certification expired in September 2024.$$,
  "credentialUrl" = 'https://www.credly.com/badges/ebb96f03-df5b-49b9-81cb-3aef011d8b9a/public_url',
  "images" = ARRAY['/achievements/aws-cloud-practitioner-credly.png'],
  "updatedAt" = now()
WHERE "slug" = 'aws-cloud-practitioner' AND cardinality("images") = 0;
