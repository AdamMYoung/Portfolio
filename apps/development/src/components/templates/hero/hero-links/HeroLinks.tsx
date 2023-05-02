import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const HeroLinks = ({ children, className, ...rest }: ElementProps<"div">) => {
  const _className = twMerge("flex gap-4", className);

  return (
    <div className={_className} {...rest}>
      {children}
    </div>
  );
};
