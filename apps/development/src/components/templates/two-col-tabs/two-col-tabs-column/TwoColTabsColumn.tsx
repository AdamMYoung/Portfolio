import { cn, ElementProps } from "ui";

type TwoColTabsColumnProps = ElementProps<"div">;

export const TwoColTabsColumn = ({ children, className, ...rest }: TwoColTabsColumnProps) => {
  const _className = cn(className, "flex flex-col gap-4");

  return (
    <div className={_className} {...rest}>
      {children}
    </div>
  );
};
