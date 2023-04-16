"use client";

import { ElementProps, Button } from "components";
import { twMerge } from "tailwind-merge";
import { FiAperture, FiCamera, FiCalendar } from "react-icons/fi";
import { FaRuler, FaRunning, FaInfo } from "react-icons/fa";
import { BsAspectRatio } from "react-icons/bs";
import { MdGradient, MdOutlineLens } from "react-icons/md";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

import { ImageExif } from "../../utils";
import { useState } from "react";

dayjs.extend(customParseFormat);

type ImageMetadataTableProps = ElementProps<"div"> & {
  exif: ImageExif;
};

export const ImageMetadataTable = ({ exif, className, children, ...rest }: ImageMetadataTableProps) => {
  const [isContentHidden, setIsContentHidden] = useState(true);

  const parsedDate = dayjs(exif.captureDate, "YYYY:MM:DD HH:mm:ss");
  const _className = twMerge(
    "flex flex-col text-sm font-bold h-min rounded-sm p-2",
    !isContentHidden && "shadow bg-white",
    className
  );

  return (
    <div className={_className} {...rest}>
      <table
        className={twMerge("border-separate text-left md:border-spacing-2", isContentHidden ? "hidden" : "visible")}
      >
        <tbody>
          <tr>
            <td>
              <FiCalendar className="h-6 w-6" />
            </td>
            <td>{parsedDate.format("DD MMM YYYY")}</td>
          </tr>
          <tr>
            <td>
              <BsAspectRatio className="h-6 w-6" />
            </td>
            <td className="whitespace-nowrap">
              {exif.width}px / {exif.height}px
            </td>
          </tr>
          <tr>
            <td>
              <hr />
            </td>
            <td>
              <hr />
            </td>
          </tr>
          <tr>
            <td>
              <FaRunning className="h-6 w-6" />
            </td>
            <td>{exif.exposure}s</td>
          </tr>
          <tr>
            <td>
              <FiAperture className="h-6 w-6" />
            </td>
            <td>{exif.aperture}</td>
          </tr>
          <tr>
            <td>
              <MdGradient className="h-6 w-6" />
            </td>
            <td>ISO {exif.iso}</td>
          </tr>
          <tr>
            <td>
              <FaRuler className="h-6 w-6" />
            </td>
            <td>{exif.focalLength}</td>
          </tr>
          <tr>
            <td>
              <hr />
            </td>
            <td>
              <hr />
            </td>
          </tr>
          <tr>
            <td>
              <FiCamera className="h-6 w-6" />
            </td>
            <td>{exif.model}s</td>
          </tr>
          <tr>
            <td>
              <MdOutlineLens className="h-6 w-6" />
            </td>
            <td>{exif.lens}</td>
          </tr>
        </tbody>
      </table>
      <Button
        aria-label={`${isContentHidden ? "Show" : "Hide"} capture info`}
        className={twMerge(isContentHidden ? "rounded-full bg-white p-3 tracking-wider" : "rounded-sm")}
        onClick={() => setIsContentHidden((isContentHidden) => !isContentHidden)}
      >
        {isContentHidden ? <FaInfo /> : "Hide Capture Info"}
      </Button>
    </div>
  );
};
