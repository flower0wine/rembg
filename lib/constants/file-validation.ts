/**
 * File validation constants
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ACCEPTED_IMAGE_TYPE_NAMES = [
  "png",
  "jpeg",
  "jpg",
  "webp",
] as const;

export const ACCEPTED_IMAGE_TYPES = ACCEPTED_IMAGE_TYPE_NAMES.map(name => `image/${name}`);

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number];
