import React from "react";
import {
  LoaderOne,
  LoaderTwo,
  LoaderThree,
  LoaderFour,
} from "@/components/ui/loader";

interface LoaderDemoProps {
  number: number;
}

export function LoaderDemo({ number }: LoaderDemoProps) {
  switch (number) {
    case 1:
      return <LoaderOne />;
    case 2:
      return <LoaderTwo />;
    case 3:
      return <LoaderThree />;
    case 4:
      return <LoaderFour />;
    default:
      return <LoaderOne />; // fallback
  }
}
