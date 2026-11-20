import { ProjectBar } from "@/components/ProjectBar";
import { Hero } from "@/components/Hero";
import { Skills } from "@/components/Skills";
import { Projects } from "@/components/Projects";
import { Contact } from "@/components/Contact";

// <Projects> reads from the database. Render per request so the build
// doesn't need DB access and admin edits show up without a redeploy.
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <ProjectBar />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </>
  );
}
