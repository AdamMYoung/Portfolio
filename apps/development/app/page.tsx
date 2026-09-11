import { DesktopPage } from "./panels";

// "/" is the About panel — see app/routes.ts. Every other panel lives at
// /[slug], all statically generated.
export default function Page() {
  return <DesktopPage defaultOpen="about" />;
}
