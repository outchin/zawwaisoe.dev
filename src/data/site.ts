// Central place for personal/site info. Edit this file to make the
// portfolio yours — nothing else needs to change.

export const site = {
  name: "Zaw Wai Soe",
  handle: "zawwaisoe",
  role: "Senior Backend Developer",
  previouslyAt: "7r48 IT Solutions",
  tagline: "I build things for the web.",
  bio: "I am a backend software developer with robust problem-solving skills and proven experience in creating and designing software in a real life environment.",
  location: "Chiang Mai, Thailand",
  availability: "Open for new opportunities",

  // Profile photo shown in the project bar. Leave empty to show initials
  // instead. To use a real photo: drop it in public/ (e.g. avatar.jpg) and
  // set this to "/avatar.jpg".
  avatarUrl: "/avatar.jpg",
  avatarInitials: "ZW",

  // Used by the resume download button. PDF lives at public/zawwaisoe-resume.pdf.
  resumeUrl: "/zawwaisoe-resume.pdf",
  resumeFileName: "Zaw-Wai-Soe-Resume.pdf",

  email: "zawwaisoe.job@gmail.com",

  social: [
    { label: "GitHub", href: "https://github.com/zawwaisoe" },
    { label: "LinkedIn", href: "https://linkedin.com/in/zawwaisoe" },
  ],

  skills: [
    "TypeScript",
    "React",
    "Next.js",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "Git",
  ],

  // EmailJS config — see README.md for setup steps.
  // These are meant to be public (EmailJS keys are client-safe by design),
  // but are still read from env vars so you don't hardcode them in source.
  emailjs: {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
  },
};
