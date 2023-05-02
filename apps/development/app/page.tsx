import { Metadata } from "next";
import Image from "next/image";
import { Link } from "@/components/atoms/link";

import selfie from "../src/images/selfie.jpg";
import blurdle from "../src/images/blurdle.png";
import { Twitter, Github, Linkedin } from "lucide-react";

import { Section } from "@/components/organisms/section";
import {
  TwoColsTabsTabTrigger,
  TwoColTabs,
  TwoColTabsColumn,
  TwoColTabsTabContent,
  TwoColTabsTabList,
} from "@templates/two-col-tabs";
import { Hero, HeroColumn, HeroLinks, HeroSubtitle, HeroTitle } from "@templates/hero";
import { SectionHeading } from "@atoms/section-heading";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Card */}
      <Hero>
        <HeroColumn className="relative">
          <HeroTitle>
            Adam <br /> Young
          </HeroTitle>
          <HeroLinks>
            <a>
              <Twitter />
            </a>
            <a>
              <Github />
            </a>
            <a>
              <Linkedin />
            </a>
          </HeroLinks>
        </HeroColumn>
        <HeroColumn className="gap-4 pb-16">
          <SectionHeading>Introduction</SectionHeading>
          <HeroSubtitle>Front-end Software Engineer, based in Darlington, UK.</HeroSubtitle>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
            ea commodo consequat.
          </p>
          <Link href="/contact">Get in touch</Link>
        </HeroColumn>
      </Hero>

      {/* About Me */}
      <div className="z-0 bg-gray-100 py-16">
        <div className="section-container grid gap-8 md:grid-cols-2">
          <div className="my-auto flex flex-col gap-4">
            <SectionHeading>About Me</SectionHeading>
            <p className="text-3xl font-medium md:text-4xl">
              When I'm not at the computer, you'll probably find me hiking, traveling, or capturing photos.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
              ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
              fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </div>
          <Image src={selfie} alt="" className="rounded-lg" priority />
        </div>
      </div>

      {/* Blog */}
      <div className="pt-16">
        <div className="section-container flex flex-col gap-4 text-center">
          <SectionHeading>Blog</SectionHeading>
          <p className="text-3xl font-medium md:text-4xl">
            Why not check out my writing? <br /> These are the most popular.
          </p>
          <div className="mt-8">
            <div className="relative -mt-32 flex w-full translate-y-1/2 snap-x gap-4 overflow-x-auto">
              <div className="h-64 w-1/2 shrink-0 snap-start rounded bg-blue-100 md:w-1/3"></div>
              <div className="h-64 w-1/2 shrink-0 snap-start rounded bg-blue-100 md:w-1/3"></div>
              <div className="h-64 w-1/2 shrink-0 snap-start rounded bg-blue-100 md:w-1/3"></div>
              <div className="h-64 w-1/2 shrink-0 snap-start rounded bg-blue-100 md:w-1/3"></div>
              <div className="h-64 w-1/2 shrink-0 snap-start rounded bg-blue-100 md:w-1/3"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Links */}
      <div className="bg-gray-100 pb-16 pt-48">
        <div className="section-container grid gap-8 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h3 className="text-3xl font-medium">Topics</h3>
            <div className="flex items-center gap-2">
              <Link href="/blog" className="rounded-full bg-blue-600 px-2 py-1.5 text-xs uppercase text-white">
                React
              </Link>
              <Link href="/blog" className="rounded-full bg-blue-600 px-2 py-1.5 text-xs uppercase text-white">
                TypeScript
              </Link>
              <Link href="/blog" className="rounded-full bg-blue-600 px-2 py-1.5 text-xs uppercase text-white">
                React
              </Link>
              <Link href="/blog" className="rounded-full bg-blue-600 px-2 py-1.5 text-xs uppercase text-white">
                React
              </Link>
            </div>
          </div>
          <Link className="mt-auto text-2xl font-medium text-blue-600 underline md:ml-auto" href="/blog">
            View More
          </Link>
        </div>
      </div>

      <Section>
        <TwoColTabs className="min-h-[42rem]" defaultValue="blurdle">
          <TwoColTabsColumn>
            <SectionHeading>Projects</SectionHeading>
            <p className="text-3xl font-medium md:text-4xl">Here's some of my other projects too.</p>
            <TwoColTabsTabList>
              <TwoColsTabsTabTrigger value="blurdle">Blurdle</TwoColsTabsTabTrigger>
              <TwoColsTabsTabTrigger value="photography">Photography Portfolio</TwoColsTabsTabTrigger>
              <TwoColsTabsTabTrigger value="biscuit">Biscuit Sog Index</TwoColsTabsTabTrigger>
            </TwoColTabsTabList>
          </TwoColTabsColumn>
          <TwoColTabsColumn>
            <TwoColTabsTabContent value="blurdle">
              <h3 className="text-3xl font-medium">Blurdle</h3>
              <Image src={blurdle} alt="" className="rounded-lg" />
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
                deserunt mollit anim id est laborum.
              </p>
              <Link className="mt-auto text-2xl font-medium text-blue-600 underline" href="/blog">
                blurdle.aydev.uk
              </Link>
            </TwoColTabsTabContent>
          </TwoColTabsColumn>
        </TwoColTabs>
      </Section>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Home | AYDev",
  description: "Hi, I'm Adam Young. I'm a software developer, photographer and avid hiker. Why not have a look around?",
};
