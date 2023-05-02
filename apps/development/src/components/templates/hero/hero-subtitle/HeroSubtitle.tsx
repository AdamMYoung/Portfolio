import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const HeroSubtitle = ({ children, className, ...rest }: ElementProps<"p">) => {
  const _className = twMerge("text-3xl font-medium md:text-4xl", className);

  return (
    <p className={_className} {...rest}>
      {children}
    </p>
  );
};
