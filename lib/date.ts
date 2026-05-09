export function coerceDate(value: Date | string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalizedDate = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(normalizedDate.getTime())) {
    return null;
  }

  return normalizedDate;
}
