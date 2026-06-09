/**
 * Image slicing engine.
 *
 * Loads a File into an <img>, validates its dimensions against the chosen
 * format, then uses off-screen <canvas> elements to crop each slice and
 * return them as PNG Blobs.
 *
 * Supports three validation modes:
 *   • 'verify'         — exact width × height match.
 *   • 'slice-dynamic'  — height exact, width must be a multiple of sliceWidth.
 *   • 'slice-fixed'    — exact width × height match (uses predefined slices).
 */

/**
 * Load a file and validate its dimensions against the format rules.
 *
 * @param {File} file
 * @param {import('../config/formats').FORMATS[string]} format
 * @returns {Promise<HTMLImageElement>}  Resolves with the loaded image if valid.
 * @throws {Error}  If dimensions don't match.
 */
export function loadAndValidate(file, format) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;

      if (format.mode === 'verify' || format.mode === 'slice-fixed') {
        // Exact dimension match
        if (w !== format.inputWidth || h !== format.inputHeight) {
          reject(
            new Error(
              `Please ensure your design dimensions are exactly ${format.inputWidth}×${format.inputHeight} pixels. Yours: ${w}×${h}.`
            )
          );
          return;
        }
      } else if (format.mode === 'slice-dynamic') {
        // Height must match exactly
        if (h !== format.inputHeight) {
          reject(
            new Error(
              `Image height must be exactly ${format.inputHeight}px. Yours: ${h}px.`
            )
          );
          return;
        }
        // Width must be a multiple of sliceWidth
        if (w % format.sliceWidth !== 0) {
          reject(
            new Error(
              `Image width must be a multiple of ${format.sliceWidth}px. Yours: ${w}px.`
            )
          );
          return;
        }
        // Must be at least 2 posts wide
        if (w < format.sliceWidth * 2) {
          reject(
            new Error(
              `Image must be at least ${format.sliceWidth * 2}px wide (2 posts minimum). Yours: ${w}px.`
            )
          );
          return;
        }
      }

      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load the image. Please try a different file.'));
    };

    img.src = url;
  });
}

/**
 * Slice a validated image into individual PNG Blobs.
 *
 * For 'slice-fixed' mode, uses the predefined coordinates.
 * For 'slice-dynamic' mode, computes slices from the image width.
 * For 'verify' mode, this function should not be called.
 *
 * @param {HTMLImageElement} img       Already-loaded image element.
 * @param {import('../config/formats').FORMATS[string]} format
 * @returns {Promise<Blob[]>}          One Blob per slice, in order.
 */
export async function sliceImage(img, format) {
  let slices;

  if (format.mode === 'slice-fixed') {
    slices = format.slices;
  } else if (format.mode === 'slice-dynamic') {
    const n = img.naturalWidth / format.sliceWidth;
    slices = Array.from({ length: n }, (_, i) => ({
      x: i * format.sliceWidth,
      y: 0,
    }));
  } else {
    throw new Error('sliceImage called on a verify-only format.');
  }

  const blobs = [];

  for (const slice of slices) {
    const canvas = document.createElement('canvas');
    canvas.width = format.sliceWidth;
    canvas.height = format.sliceHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      img,
      slice.x,
      slice.y,
      format.sliceWidth,
      format.sliceHeight,
      0,
      0,
      format.sliceWidth,
      format.sliceHeight
    );

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    blobs.push(blob);
  }

  return blobs;
}
