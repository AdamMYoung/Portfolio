"use client";

import React, { createContext, useState } from "react";
import { usePopper } from "react-popper";

type LayoutMobileContextOptions = {
  popper: ReturnType<typeof usePopper>;
  setReferenceElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  setPopperElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
};

type LayoutMobileProviderProps = React.PropsWithChildren;

export const LayoutMobileContext = createContext<LayoutMobileContextOptions>({} as LayoutMobileContextOptions);

export const LayoutMobileProvider = ({ children }: LayoutMobileProviderProps) => {
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const popper = usePopper(referenceElement, popperElement);

  return (
    <LayoutMobileContext.Provider value={{ popper, setReferenceElement, setPopperElement }}>
      {children}
    </LayoutMobileContext.Provider>
  );
};

export const useLayoutMobileContext = () => {
  return React.useContext(LayoutMobileContext);
};
