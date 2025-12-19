/**
 * Main rembg client component with refactored UI and state management
 */

"use client";

import { useAtom } from "jotai";
import {
  ImageViewer,
  ThumbnailStrip,
  UploadPanel,
  UploadToolbar,
} from "./components";
import { hasImagesAtom, imagesAtom } from "./store";

export function RemBgClient() {
  const [images] = useAtom(imagesAtom);
  const [hasImages] = useAtom(hasImagesAtom);

  return (
    <div className="space-y-6">
      {/* Show upload panel only when no images */}
      {!hasImages && (
        <div className="mx-auto" style={{ maxWidth: "600px" }}>
          <UploadPanel />
        </div>
      )}

      {/* Show image viewer and controls when images exist */}
      {hasImages && (
        <>
          {/* Main image viewer */}
          <ImageViewer showNavigation={images.length > 1} />

          {/* Thumbnail strip with add more button */}
          <ThumbnailStrip />

          {/* URL input section */}
          <div className="mx-auto" style={{ maxWidth: "600px" }}>
            <UploadToolbar />
          </div>
        </>
      )}
    </div>
  );
}
