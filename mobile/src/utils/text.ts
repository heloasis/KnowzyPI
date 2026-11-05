
const MOJIBAKE_PATTERN = /Ã|Â|â€|â€œ|â€™|â€˜|â€“|â€”|ðŸ/i;

export const normalizeUtf8Text = (value: unknown): any => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUtf8Text(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        normalizeUtf8Text(item),
      ])
    );
  }

  if (typeof value !== 'string' || !value) {
    return value;
  }

  if (!MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const bytes = new Uint8Array(
      Array.from(value, (char) => char.charCodeAt(0) & 0xff)
    );

    const decoded = new TextDecoder('utf-8', {
      fatal: true,
    }).decode(bytes);

    return decoded || value;
  } catch {
    return value;
  }
};
