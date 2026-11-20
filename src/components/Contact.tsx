"use client";

import { useState, type FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { site } from "@/data/site";

type Status = "idle" | "sending" | "sent" | "error";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const configured = Boolean(
    site.emailjs.serviceId && site.emailjs.templateId && site.emailjs.publicKey
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured) return;

    setStatus("sending");
    const form = event.currentTarget;

    try {
      await emailjs.sendForm(
        site.emailjs.serviceId,
        site.emailjs.templateId,
        form,
        { publicKey: site.emailjs.publicKey }
      );
      setStatus("sent");
      form.reset();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-5xl px-6 py-12">
      <h2 className="text-sm font-semibold text-muted">
        <span className="text-accent">$</span> mail --send
      </h2>

      <p className="mt-4 max-w-xl font-sans text-sm leading-relaxed text-muted">
        Have a project in mind, or just want to say hi? Fill in the form
        below, or email me directly at{" "}
        <a href={`mailto:${site.email}`} className="text-accent hover:text-accent-hover">
          {site.email}
        </a>
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="text-xs text-muted">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-xs text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="message" className="text-xs text-muted">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={!configured || status === "sending"}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send message"}
        </button>

        {!configured && (
          <p className="text-xs text-muted">
            Contact form isn&apos;t wired up yet — add your EmailJS keys to{" "}
            <code>.env</code> (see README.md).
          </p>
        )}
        {status === "sent" && (
          <p className="text-sm text-ok">Message sent — thanks, I&apos;ll reply soon.</p>
        )}
        {status === "error" && (
          <p className="text-sm text-red-600">
            Something went wrong. Try again, or email me directly.
          </p>
        )}
      </form>
    </section>
  );
}
