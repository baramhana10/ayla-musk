"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader, isCloudinaryImage } from "@/lib/cloudinary-loader";

export default function OptimizedImage(props: ImageProps) {
  const loader = props.loader ?? (typeof props.src === "string" && isCloudinaryImage(props.src) ? cloudinaryLoader : undefined);
  return <Image {...props} alt={props.alt} loader={loader} />;
}
