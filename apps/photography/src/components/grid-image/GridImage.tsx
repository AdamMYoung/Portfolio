import React, { useState, Fragment } from "react";
import NextImage from "next/image";
import { Dialog, Transition } from "@headlessui/react";

import { Image } from "../../utils";
import { ImageMetadataTable } from "../image-metadata-table";
import { useSelectedImage } from "../../providers/selected-image-provider/SelectedImageProvider";
import { twMerge } from "tailwind-merge";

type GridImageProps = {
  index: number;
  image: Image;
  isPriority?: boolean;
};

type GridImageDialogProps = {
  image: Image;
  isOpen: boolean;
  onClose: () => void;
};

export const GridImage = ({ image, isPriority, index }: GridImageProps) => {
  const { selectedIndex, setSelectedIndex, clear } = useSelectedImage();

  return (
    <>
      <GridImageDialog isOpen={selectedIndex === index} onClose={clear} image={image} />
      <div className="relative w-full" style={{ aspectRatio: image.exif.width / image.exif.height }}>
        <NextImage
          onClick={() => setSelectedIndex(index)}
          className="transition-all hover:cursor-pointer hover:brightness-75 active:brightness-50"
          priority={isPriority}
          alt=""
          src={image.path}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
        />
      </div>
    </>
  );
};

const GridImageDialog = ({ isOpen, onClose, image }: GridImageDialogProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 cursor-pointer overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="pointer-events-none h-full w-full rounded-sm">
                <div
                  className="pointer-events-auto relative mx-auto h-full max-h-[90vh] max-w-[90vw]"
                  style={{ aspectRatio: image.exif.width / image.exif.height }}
                >
                  <NextImage
                    alt=""
                    className={twMerge("block cursor-default rounded-sm object-contain", isLoaded && "shadow")}
                    src={image.path}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    onLoad={() => setIsLoaded(true)}
                  />
                  {isLoaded && (
                    <ImageMetadataTable
                      exif={image.exif}
                      className="pointer-events-auto absolute top-4 right-4 cursor-default gap-2"
                    />
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
