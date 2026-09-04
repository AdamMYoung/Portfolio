declare module "*.mdx" {
  import type { ComponentType } from "react";

  export const meta: {
    id?: string;
    title: string;
    icon?: string;
    url?: string;
    year?: string;
    stack?: string[];
  };

  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}
