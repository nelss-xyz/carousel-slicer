/**
 * Instagram format definitions.
 *
 * Each format describes the expected input dimensions, validation mode, and
 * slicing behaviour. Three modes are supported:
 *
 *   • 'verify'        — check exact dimensions, no slicing.
 *   • 'slice-dynamic'  — height must match, width must be sliceWidth × N.
 *   • 'slice-fixed'    — exact dimensions, predefined slice coordinates.
 *
 * To add a new format, add another key to FORMATS.
 */

export const FORMATS = {
  INSTAGRAM_POST: {
    id: 'INSTAGRAM_POST',
    label: 'Instagram Post',
    description: 'Verify your post is the correct 1080×1350 size.',
    icon: 'post',
    mode: 'verify',
    inputWidth: 1080,
    inputHeight: 1350,
  },

  CAROUSEL: {
    id: 'CAROUSEL',
    label: 'Carousel',
    description: 'Slice a wide image into individual carousel posts.',
    icon: 'carousel',
    mode: 'slice-dynamic',
    inputHeight: 1350,
    sliceWidth: 1080,
    sliceHeight: 1350,
  },

  SEAMLESS_3_POST_CAROUSEL: {
    id: 'SEAMLESS_3_POST_CAROUSEL',
    label: 'Cover Post',
    description: 'Create a seamless 3-post carousel with overlap.',
    icon: 'cover',
    mode: 'slice-fixed',
    inputWidth: 3110,
    inputHeight: 1350,
    sliceWidth: 1080,
    sliceHeight: 1350,
    slices: [
      { x: 0, y: 0 },       // Left-aligned
      { x: 1015, y: 0 },    // Center-aligned  → (3110 - 1080) / 2
      { x: 2030, y: 0 },    // Right-aligned   → 3110 - 1080
    ],
  },
};

/**
 * Ordered list of format IDs shown on the mode-selector screen.
 */
export const FORMAT_ORDER = [
  'INSTAGRAM_POST',
  'CAROUSEL',
  'SEAMLESS_3_POST_CAROUSEL',
];
