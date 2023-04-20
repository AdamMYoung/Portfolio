import { cn, ElementProps } from "ui";

type SectionProps = ElementProps<"section">;

export const Section = ({ children, className, ...rest }: SectionProps) => {
  const _className = cn(className, "py-16");

  return (
    <section className={_className} {...rest}>
      <div className="section-container">{children}</div>
    </section>
  );
};
