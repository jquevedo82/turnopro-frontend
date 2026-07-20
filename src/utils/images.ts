const CLOUDINARY_UPLOAD_MARKER = '/upload/';

export function optimizedCloudinaryUrl(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  const markerIndex = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (markerIndex === -1) return url;
  const insertAt = markerIndex + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,w_${width}/${url.slice(insertAt)}`;
}
