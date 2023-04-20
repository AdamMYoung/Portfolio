import { cn, ElementProps, TabsList } from "ui";

type TwoColTabsColumnProps = ElementProps<"div">;

export const TwoColTabsTabList = ({ children, className, ...rest }: TwoColTabsColumnProps) => {
  const _className = cn(className, "flex flex-col items-start gap-2 text-2xl");

  return (
    <TabsList className={_className} {...rest}>
      {children}
    </TabsList>
  );
};
