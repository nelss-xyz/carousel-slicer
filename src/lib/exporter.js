/**
 * ZIP exporter.
 *
 * Bundles an array of image Blobs into a .zip archive and triggers a
 * browser download via file-saver.
 */

import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Bundle the given blobs into a ZIP and download it.
 *
 * @param {Blob[]} blobs            Ordered slice Blobs.
 * @param {string} [prefix='carousel']  Filename prefix for the zip.
 */
export async function exportAsZip(blobs, prefix = 'carousel') {
  const zip = new JSZip();

  blobs.forEach((blob, i) => {
    zip.file(`${prefix}-post-${i + 1}.png`, blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${prefix}.zip`);
}
