import { twMerge } from "tailwind-merge";
import { ElementProps } from "ui";

export const SectionHeading = ({ children, className, ...rest }: ElementProps<"h2">) => {
  const _className = twMerge("font-medium italic tracking-wider text-gray-400", className);

  return (
    <h2 className={_className} {...rest}>
      {children}
    </h2>
  );
};
