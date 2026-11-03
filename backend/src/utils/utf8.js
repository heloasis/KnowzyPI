const MOJIBAKE_PATTERNS = /Ã|Â|â€|â€œ|â€™|Ã¡|Ã©|Ã³|Ãº|Ãª|Ã§|Ã£|Ã±/i;

const normalizeUtf8String = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (!trimmed || !MOJIBAKE_PATTERNS.test(trimmed)) {
    return value;
  }

  try {
    const latin1Bytes = Buffer.from(trimmed, 'latin1');
    const converted = latin1Bytes.toString('utf8');
    return converted && converted !== trimmed ? converted : value;
  } catch (error) {
    return value;
  }
};

const normalizeUtf8Value = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeUtf8Value(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeUtf8Value(item)])
    );
  }

  if (typeof value === 'string') {
    return normalizeUtf8String(value);
  }

  return value;
};

module.exports = {
  normalizeUtf8String,
  normalizeUtf8Value,
};
