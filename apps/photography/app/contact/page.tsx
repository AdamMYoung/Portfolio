import React from "react";
import { ContactForm } from "./contact-form";

export default async function Contact() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 p-8 md:p-0 md:pr-8 md:pt-12">
      <h1 className="text-3xl font-bold">Contact</h1>

      <p>
        Thanks for reaching out, please feel free to get in touch below. I&apos;ll do my best to answer back as soon as
        I can, usually within 48 hours.
      </p>

      <div>
        <p>All the best,</p>
        <p>Adam</p>
      </div>

      <ContactForm />
    </div>
  );
}

export const metadata: Metadata = {
  title: "Adam Young | Contact",
  description: "Get in touch",
};
