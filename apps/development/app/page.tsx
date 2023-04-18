import { Metadata } from "next";
import Image from "next/image";
import selfie from "../src/images/selfie-snow.jpg";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Card */}
      <div className="grid grid-cols-[1.5fr_1fr] pb-16 section-container">
        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-4">
            <h1 className="text-8xl tracking-wide font-medium">
              Adam <br /> Young.
            </h1>
            <div className="border-b-8 w-24" />
          </div>
          <div className="flex gap-4">
            <a>Twitter</a>
            <a>GitHub</a>
            <a>LinkedIn</a>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <h2 className="tracking-wider">Introduction</h2>
          <p className="text-3xl">Front-end Software Engineer, based in Darlington, UK</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
      </div>

      <div className="flex py-16 bg-gray-100">
        {/* Logos */}
        <div className="flex gap-6 mx-auto">
          <p>Logo 1</p>
          <p>Logo 2</p>
          <p>Logo 3</p>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Home | AYDev",
  description: "Hi, I'm Adam Young. I'm a software developer, photographer and avid hiker. Why not have a look around?",
};
