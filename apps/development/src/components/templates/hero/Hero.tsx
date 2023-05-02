import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const Hero = ({ children, className, ...rest }: ElementProps<"section">) => {
  const _className = twMerge("section-container grid gap-12 md:grid-cols-[1.5fr_1fr] md:gap-4", className);

  return (
    <section className={_className} {...rest}>
      {children}
    </section>
  );
};
