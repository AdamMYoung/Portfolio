import { cn, ElementProps, Tabs } from "ui";

type TwoColTabsProps = ElementProps<typeof Tabs> & {};

export const TwoColTabs = ({ children, className, orientation = "vertical", ...rest }: TwoColTabsProps) => {
  const _className = cn(className, "grid gap-8 md:grid-cols-2");

  return (
    <Tabs orientation={orientation} className={_className} {...rest}>
      {children}
    </Tabs>
  );
};
