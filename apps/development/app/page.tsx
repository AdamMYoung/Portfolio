import { Metadata } from "next";
import Image from "next/image";
import selfie from "../src/images/selfie-snow.jpg";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex flex-col gap-8">
          <h1 className="text-4xl font-bold">Hi, I&apos;m Adam Young!</h1>
          <p>
            I&apos;m a Software Engineer currently working at Checkout.com. My focus is currently on React and Next.js,
            as well as any new and interesting libraries that come my way.
          </p>
          <p>
            When I&apos;m not working, you can probably find me hiking, flying drones, or taking pictures, more of which
            you can find on my{" "}
            <a className="underline" target="_blank" rel="noreferrer" href="https://photography.aydev.uk">
              photography site
            </a>
            .
          </p>

          <p className="hidden md:block">
            Use the navigation bar to the left to have a look around, and let me know what you think!
          </p>
          <p className="block md:hidden">
            Use the navigation menu at the top to have a look around, and let me know what you think!
          </p>
        </div>
        <Image priority alt="Selfie in the snow" src={selfie} className="rounded" />
      </div>

      <p></p>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Adam Young | Development",
  description: "Development portfolio of Software Engineer, Adam Young",
};
