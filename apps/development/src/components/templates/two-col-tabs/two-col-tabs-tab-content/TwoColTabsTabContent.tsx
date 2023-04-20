import { cn, ElementProps, TabsContent } from "ui";

type TwoColTabsTabContentProps = ElementProps<typeof TabsContent>;

export const TwoColTabsTabContent = ({ children, className, ...rest }: TwoColTabsTabContentProps) => {
  const _className = cn(className, "flex flex-col gap-8");

  return (
    <TabsContent className={_className} {...rest}>
      {children}
    </TabsContent>
  );
};
