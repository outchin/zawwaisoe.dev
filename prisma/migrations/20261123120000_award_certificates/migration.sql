-- Student achievements: titles, results and dates taken from the actual certificates,
-- plus the certificate scans (served from /public/achievements).
-- Only touches rows still showing the original seed text, so admin edits are never overwritten.

UPDATE "Award" SET
  "title" = 'Outstanding Award for Image & AI', "result" = 'Second Prize', "date" = '2019',
  "issuer" = 'University of Technology (Yatanarpon Cyber City)',
  "description" = $$Second prize in the Department of Information Science's 2019 Image & AI project awards, with a six-person team. Our project, "Hand Drawn Wireframe To Design", takes a hand-drawn wireframe and turns it into a design.$$,
  "images" = ARRAY['/achievements/image-ai-2019.jpg'], "order" = 1, "updatedAt" = now()
WHERE "slug" = 'ai-ml-project-competition' AND cardinality("images") = 0;

UPDATE "Award" SET
  "title" = 'Outstanding Project Award for J2EE', "result" = 'Third Prize', "date" = '2018',
  "issuer" = 'University of Technology (Yatanarpon Cyber City)',
  "description" = $$Third prize in the Department of Information Science's 2018 J2EE (Java Enterprise Edition) project awards, with a six-person team, for our project "Organic Favour".$$,
  "images" = ARRAY['/achievements/j2ee-2018.jpg'], "order" = 2, "updatedAt" = now()
WHERE "slug" = 'j2ee-project-competition' AND cardinality("images") = 0;

UPDATE "Award" SET
  "slug" = 'web-design-course-project-award',
  "title" = 'Web Design Course — Project Award', "result" = 'Third Project Award', "date" = 'Jul – Aug 2019',
  "issuer" = 'University of Technology (Yatanarpon Cyber City)',
  "description" = $$A month-long web design short course (Tailwind CSS) at the university, 1 July – 1 August 2019. My three-person team, Idea-Tech, won third prize for our course project, and I also received the course's certificate of completion.$$,
  "images" = ARRAY['/achievements/web-design-award-2019.jpg', '/achievements/web-design-course-2019.jpg'], "order" = 3, "updatedAt" = now()
WHERE "slug" = 'tailwind-css-short-course-competition' AND cardinality("images") = 0;

UPDATE "Award" SET
  "title" = 'Yetagun Youth Program (Season IV)', "date" = 'Oct 2019',
  "issuer" = 'PETRONAS · Yetagun',
  "description" = $$A youth development program. Sixteen teams were selected, eight from Upper Myanmar and eight from Lower Myanmar, and my team went on to the final eight. The training on 26–27 October 2019 covered presentation, proposal writing, creative thinking and teamwork.$$,
  "images" = ARRAY['/achievements/yetagun-2019.jpg'], "order" = 4, "updatedAt" = now()
WHERE "slug" = 'yetagun-youth-program' AND cardinality("images") = 0;

UPDATE "Award" SET "order" = 5, "updatedAt" = now()
WHERE "slug" = 'mpt-entrepreneurship-program' AND cardinality("images") = 0;

UPDATE "Award" SET
  "title" = 'The Hackathon 2019', "result" = 'Participant', "date" = '2019',
  "issuer" = 'Ooredoo Myanmar · UNDP',
  "description" = $$"The Hackathon 2019: Promoting Digital Entrepreneurship", run by Ooredoo Myanmar with UNDP around the Sustainable Development Goals. Certificate of participation.$$,
  "images" = ARRAY['/achievements/ooredoo-hackathon-2019.jpg'], "order" = 6, "updatedAt" = now()
WHERE "slug" = 'ooredoo-hackathon' AND cardinality("images") = 0;

UPDATE "Award" SET
  "slug" = 'csharp-project-show-2017',
  "title" = '2017 Project Show (C#)', "result" = 'Participant', "date" = '2017',
  "issuer" = 'University of Technology (Yatanarpon Cyber City)',
  "description" = $$The Department of Information Science's 2017 C# project show, with a five-person team. Our project was a "Cinema Ticket Booking System".$$,
  "images" = ARRAY['/achievements/csharp-project-show-2017.jpg'], "order" = 7, "updatedAt" = now()
WHERE "slug" = 'csharp-project-competition' AND cardinality("images") = 0;
