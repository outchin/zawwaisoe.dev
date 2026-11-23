-- Terraform Associate: certificate image and Credly verification. Skipped if already edited in the admin.
UPDATE "Award" SET
  "title" = 'HashiCorp Certified: Terraform Associate (004)',
  "date" = 'Feb 2026',
  "validUntil" = 'Feb 2028',
  "credentialId" = '4dec4838-8589-4822-8530-8bb218d1aa7d',
  "credentialUrl" = 'https://www.credly.com/badges/4dec4838-8589-4822-8530-8bb218d1aa7d/public_url',
  "images" = ARRAY['/achievements/terraform-associate.png'],
  "updatedAt" = now()
WHERE "slug" = 'terraform-associate' AND cardinality("images") = 0;
