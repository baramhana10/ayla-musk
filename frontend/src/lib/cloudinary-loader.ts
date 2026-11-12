import type { ImageLoaderProps } from "next/image";

export function isCloudinaryImage(src: string) {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && /^\/[^/]+\/image\/upload\//.test(url.pathname);
  } catch { return false; }
}

export function cloudinaryLoader({ src, width }: ImageLoaderProps) {
  const url = new URL(src);
  const size = Math.max(16, Math.min(3840, Math.round(width)));
  url.pathname = url.pathname.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${size}/`);
  return url.href;
}
