import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import selfie from "../src/images/selfie-snow.jpg";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Card */}
      <div className="grid gap-4 md:grid-cols-[1.5fr_1fr] pb-16 section-container">
        <div className="flex flex-col gap-24">
          <div className="flex flex-col gap-4">
            <h1 className="text-6xl md:text-8xl tracking-wide font-medium">
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
          <p className="text-3xl md:text-4xl">Front-end Software Engineer, based in Darlington, UK.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
      </div>

      {/* About Me */}
      <div className="py-16 bg-gray-100">
        <div className="grid gap-8 md:grid-cols-2 section-container">
          <div className="flex flex-col gap-6">
            <h2>About Me</h2>
            <p className="text-3xl md:text-4xl">When I'm not at the computer, you'll probably find me hiking, traveling, or capturing photos.</p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        </div>
      </div>

      {/* Blog */}
      <div className="pt-16">
          <div className="section-container flex flex-col gap-6 text-center">
            <h2>Blog</h2>
            <p className="text-3xl md:text-4xl">Why not check out my writing? <br/> These are the most popular.</p>
            <div className="mt-8">
              <div className="flex gap-4 -mt-32 translate-y-1/2">
                <div className="w-full h-64 bg-blue-100 rounded"></div>
                <div className="w-full h-64 bg-blue-100 rounded"></div>
                <div className="w-full h-64 bg-blue-100 rounded"></div>
              </div>
            </div>
          </div>
      </div>

       {/* Projects */}
       <div className="pb-16 pt-48 bg-gray-100">
        <div className="section-container grid grid-cols-2">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl">Topics</h3>
          <div className="flex items-center gap-2">
            <Link href="/blog" className="rounded-full px-2 py-1.5 text-xs uppercase text-white bg-gray-500">React</Link>
            <Link href="/blog" className="rounded-full px-2 py-1.5 text-xs uppercase text-white bg-gray-500">React</Link>
            <Link href="/blog" className="rounded-full px-2 py-1.5 text-xs uppercase text-white bg-gray-500">React</Link>
            <Link href="/blog" className="rounded-full px-2 py-1.5 text-xs uppercase text-white bg-gray-500">React</Link>
          </div>
          </div>
          <Link className="text-3xl ml-auto mt-auto" href="/blog">View More</Link>
        </div>
      </div>

      {/* Projects */}
      <div className="py-16">
      <div className="grid gap-8 md:grid-cols-2 section-container">
          <div className="flex flex-col gap-6">
            <h2>Projects</h2>
            <p className="text-3xl md:text-4xl">Have a look at some of my other sites.</p>
            <div className="flex flex-col gap-2 items-start text-2xl">
              <button className="w-auto">Blurdle</button>
              <button>AYDev Photography</button>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Home | AYDev",
  description: "Hi, I'm Adam Young. I'm a software developer, photographer and avid hiker. Why not have a look around?",
};
