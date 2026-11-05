import { flattenToAppURL, isInternalURL } from '@plone/volto/helpers';

/**
 * Resolve a Volto image field value to a display URL.
 * Handles: plain string, object_browser array, object with @id / url.
 * @param {*} image — the raw value from widget: 'image'
 * @param {string} scale — Plone image scale (default 'large')
 * @returns {string|null}
 */
export const getImageUrl = (
  image: any,
  scale: string = 'large',
): string | null => {
  if (!image) return null;

  const resolveUrl = (raw: string): string => {
    if (!raw) return '';
    if (raw.includes('/@@images/image')) return flattenToAppURL(raw);
    return isInternalURL(raw)
      ? `${flattenToAppURL(raw)}/@@images/image/${scale}`
      : raw;
  };

  // widget: 'image' stores a plain URL string
  if (typeof image === 'string') {
    return resolveUrl(image);
  }

  // legacy: object_browser stores an array
  if (Array.isArray(image) && image.length) {
    const id = image[0]?.['@id'] || image[0]?.url || '';
    return resolveUrl(id);
  }

  // object with url or @id
  if (typeof image === 'object' && image) {
    const id = image['@id'] || image.url || image.id || '';
    return resolveUrl(id);
  }

  return null;
};

export default getImageUrl;
