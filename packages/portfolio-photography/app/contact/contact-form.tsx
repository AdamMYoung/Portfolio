"use client";

import { useState } from "react";
import { Button } from "../client-components";

export const ContactForm = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit: React.FormEventHandler = (e) => {
    e.preventDefault();

    window.location.href = `mailto:photography@aydev.uk?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(message)}`;
  };

  return (
    <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
      <label className="flex flex-col gap-2 font-bold">
        <span>
          Subject <span className="text-red-600">*</span>
        </span>
        <input
          type="text"
          className="w-full rounded border  p-2 font-normal"
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>

      <label className=" flex flex-col gap-2 font-bold">
        <span>
          Message <span className="text-red-600">*</span>
        </span>
        <textarea className="w-full rounded border p-2 font-normal" onChange={(e) => setMessage(e.target.value)} />
      </label>

      <Button
        disabled={!subject || !message}
        className="disabled:cursor-not-allowed disabled:bg-slate-50"
        type="submit"
      >
        Send
      </Button>
    </form>
  );
};
