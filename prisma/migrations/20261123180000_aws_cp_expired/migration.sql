-- AWS Cloud Practitioner has expired: say so honestly and list it last.
UPDATE "Award" SET
  "result" = 'Expired',
  "description" = $$Foundational AWS knowledge: cloud concepts, the shared responsibility model and security, core services across compute, storage, networking and databases, and pricing and billing. The certification has since expired.$$,
  "order" = 5,
  "updatedAt" = now()
WHERE "slug" = 'aws-cloud-practitioner' AND "result" = 'Certified' AND cardinality("images") = 0;
