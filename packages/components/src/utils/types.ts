import React, { ComponentType, ElementType } from "react";

export type ElementProps<T extends ElementType<any>> = React.ComponentPropsWithoutRef<T> & React.PropsWithChildren;
export type ExtractProps<T> = (T extends ComponentType<infer P> ? P : T) & React.PropsWithChildren