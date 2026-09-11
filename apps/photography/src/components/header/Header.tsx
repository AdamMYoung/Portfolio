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
// Deliberately a single row at every width: the overlays on /gallery are
// positioned just under it, and a wrapping header would slide beneath them.
export const Header = ({ transparent }: HeaderProps) => {
  const { pathname } = useRouter();
  // The splash already offers Gallery / List as its two big choices, so the
  // nav links are noise there — leave the socials alone on the title line.
  const isSplash = pathname === "/";

  return (
    <header
      className={twMerge(
        "fixed inset-x-0 top-0 z-40 flex items-center justify-between gap-x-4 px-4 pb-4 sm:gap-x-6 sm:px-6 pt-[max(1rem,env(safe-area-inset-top))]",
        transparent
          ? "bg-gradient-to-b from-black/60 to-transparent text-white"
          : "bg-[#f5f2ea] text-[#141414]"
      )}
    >
      <Link href="/" className="flex items-baseline gap-2">
        <span className="text-xl font-bold tracking-tight">Adam Young</span>
        <span className="hidden text-sm font-light opacity-70 sm:inline">Photography</span>
      </Link>

      {/* One row at every width — measured to fit a 375px viewport with the
          subtitle hidden, so it can never wrap under the gallery overlays. */}
      <nav className="flex items-center gap-4 text-sm font-bold uppercase tracking-wide sm:gap-6">
        {!isSplash &&
          NAV.map((item) => (
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
