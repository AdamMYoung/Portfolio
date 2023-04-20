import React, { ElementType } from "react";

export type ElementProps<T extends ElementType<any>> = React.ComponentPropsWithoutRef<T> & React.PropsWithChildren;
