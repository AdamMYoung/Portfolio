import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const HeroColumn = ({ children, className, ...rest }: ElementProps<"div">) => {
  const _className = twMerge("relative flex flex-col gap-12", className);

  return (
    <div className={_className} {...rest}>
      {children}
    </div>
  );
};
