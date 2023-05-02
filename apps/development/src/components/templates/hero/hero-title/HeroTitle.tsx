import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const HeroTitle = ({ children, className, ...rest }: ElementProps<"div">) => {
  const _className = twMerge("flex flex-col gap-4 w-min", className);

  return (
    <div className={_className} {...rest}>
      <h1 className="text-6xl font-bold tracking-wide md:text-8xl">{children}</h1>
      <div className="w-24 border-b-8 border-blue-600" />
    </div>
  );
};
