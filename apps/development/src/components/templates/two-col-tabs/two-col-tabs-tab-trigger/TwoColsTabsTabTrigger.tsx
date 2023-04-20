import { cn, ElementProps, TabsTrigger } from "ui";

type TwoColsTabsTabTriggerProps = ElementProps<typeof TabsTrigger>;

export const TwoColsTabsTabTrigger = ({ children, className, ...rest }: TwoColsTabsTabTriggerProps) => {
  const _className = cn(className, "text-2xl");

  return (
    <TabsTrigger className={_className} {...rest}>
      {children}
    </TabsTrigger>
  );
};
