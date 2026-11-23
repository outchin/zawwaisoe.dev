-- MPT: real program name and result from the awards-ceremony photo. Yetagun: team photos and project.
UPDATE "Award" SET
  "title" = 'Myanmar Youth Technopreneurship Development Program 2020',
  "result" = 'Honorable Mention · Top 8',
  "issuer" = 'MPT · Myanmar Computer Federation',
  "date" = 'Feb 2020',
  "description" = $$A nationwide youth technopreneurship program run by MPT and the Myanmar Computer Federation (organised by Kanaung Hub). Sixteen teams were selected, eight from Upper Myanmar and eight from Lower Myanmar, and my team went on to the final eight. At the Final Selection and Awards Ceremony (29 February 2020, MICT Park, Yangon) we received an Honorable Mention with a prize of 800,000 MMK.$$,
  "images" = ARRAY['/achievements/mpt-technopreneurship-2020.jpg'],
  "updatedAt" = now()
WHERE "slug" = 'mpt-entrepreneurship-program' AND cardinality("images") = 0;

UPDATE "Award" SET
  "description" = $$A youth development program run by PETRONAS. Sixteen teams were selected, eight from Upper Myanmar and eight from Lower Myanmar, and my team, Mission 01, went on to the final round. Our project, in the Education category, was an Educational and Entertainment Robot (ET) for Children. The training on 26–27 October 2019 covered presentation, proposal writing, creative thinking and teamwork.$$,
  "images" = ARRAY['/achievements/yetagun-team-2019.jpg', '/achievements/yetagun-final-2019.jpg', '/achievements/yetagun-2019.jpg'],
  "updatedAt" = now()
WHERE "slug" = 'yetagun-youth-program' AND "images" = ARRAY['/achievements/yetagun-2019.jpg'];
