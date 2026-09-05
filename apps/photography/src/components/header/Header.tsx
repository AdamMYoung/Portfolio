import { useRouter } from "next/router";
import { FiInstagram, FiTwitter } from "react-icons/fi";
import { twMerge } from "tailwind-merge";

import { IconList } from "../icon-list";
import { Link } from "../link";

const NAV = [
  { href: "/gallery", label: "Gallery" },
  { href: "/list", label: "List" },
];

type HeaderProps = { transparent?: boolean };

// One header, one layout, used on every page — the gallery just gets a
// transparent variant that floats over the 3D canvas instead of a solid bar.
export const Header = ({ transparent }: HeaderProps) => {
  const { pathname } = useRouter();

  return (
    <header
      className={twMerge(
        "fixed inset-x-0 top-0 z-40 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4",
        transparent
          ? "bg-gradient-to-b from-black/60 to-transparent text-white"
          : "bg-[#f5f2ea] text-[#141414]"
      )}
    >
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tight">Adam Young</span>
        <span className="text-sm font-light opacity-70">Photography</span>
      </Link>

      <nav className="flex items-center gap-6 text-sm font-bold uppercase tracking-wide">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={
              pathname === item.href
                ? "underline underline-offset-4"
                : "opacity-60 hover:opacity-100"
            }
          >
            {item.label}
          </Link>
        ))}
        <IconList className="text-base">
          <Link
            type="external"
            aria-label="Instagram"
            href="https://www.instagram.com/adammyoung_/"
          >
            <FiInstagram />
          </Link>
          <Link type="external" aria-label="Twitter" href="https://twitter.com/AdamMYoung_">
            <FiTwitter />
          </Link>
        </IconList>
      </nav>
    </header>
  );
};
