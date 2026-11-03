const MOJIBAKE_PATTERN = /Ã|Â|â€|â€œ|â€™|Ã¡|Ã©|Ã³|Ãº|Ãª|Ã§|Ã£|Ã±/i;

export const normalizeUtf8Text = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUtf8Text(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeUtf8Text(item)])
    );
  }

  if (typeof value !== 'string') {
    return value;
  }

  if (!value || !MOJIBAKE_PATTERN.test(value)) {
    return value;
  }

  try {
    const latin1Bytes = Uint8Array.from(Array.from(value, (char) => char.charCodeAt(0)));
    const decoded = new TextDecoder('utf-8', { fatal: true }).decode(latin1Bytes);
    return decoded && decoded !== value ? decoded : value;
  } catch (error) {
    return value;
  }
};
