declare module "*.mdx" {
  import type { ComponentType } from "react";

  const component: ComponentType<object>;
  export default component;
}
