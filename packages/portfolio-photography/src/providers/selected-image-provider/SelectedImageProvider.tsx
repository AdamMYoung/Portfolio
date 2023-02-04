"use client";

import { createContext } from "portfolio-shared";
import React, { useCallback, useEffect, useState } from "react";

type SelectedImageContextOptions = {
  selectedIndex?: number;
  setSelectedIndex: (index: number) => void;
  next: () => void;
  previous: () => void;
  clear: () => void;
};

type SelectedImageProviderProps = React.PropsWithChildren & {
  numberOfImages: number;
};

const [SelectedImageContextProvider, useSelectedImageContext] = createContext<SelectedImageContextOptions>();

export const useSelectedImage = useSelectedImageContext;

export const SelectedImageProvider = ({ children, numberOfImages }: SelectedImageProviderProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>();

  const next = useCallback(() => {
    if (selectedIndex === undefined) {
      return;
    }

    if (selectedIndex + 1 > numberOfImages - 1) {
      setSelectedIndex(0);
    } else {
      setSelectedIndex((index) => index! + 1);
    }
  }, [numberOfImages, setSelectedIndex, selectedIndex]);

  const previous = useCallback(() => {
    if (selectedIndex === undefined) {
      return;
    }

    if (selectedIndex - 1 < 0) {
      setSelectedIndex(numberOfImages - 1);
    } else {
      setSelectedIndex((index) => index! - 1);
    }
  }, [numberOfImages, setSelectedIndex, selectedIndex]);

  const clear = () => setSelectedIndex(undefined);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        previous();
      }

      if (e.key === "ArrowRight") {
        next();
      }
    },
    [next, previous]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <SelectedImageContextProvider value={{ next, previous, clear, setSelectedIndex, selectedIndex }}>
      {children}
    </SelectedImageContextProvider>
  );
};
