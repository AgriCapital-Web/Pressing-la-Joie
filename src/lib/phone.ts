const NON_DIGIT_REGEX = /\D/g;

export const normalizePhoneDigits = (value: string) => value.replace(NON_DIGIT_REGEX, "");

export const toIvoryCoastLocalPhone = (value: string) => {
  let digits = normalizePhoneDigits(value);

  if (digits.startsWith("225")) {
    digits = digits.slice(3);
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(1);
  }

  if (digits.length === 8 || digits.length === 9) {
    digits = `0${digits}`;
  }

  return digits;
};

export const isValidIvoryCoastLocalPhone = (value: string) => {
  const localPhone = toIvoryCoastLocalPhone(value);
  return /^0\d{9}$/.test(localPhone);
};

export const toIvoryCoastWhatsAppPhone = (value: string) => {
  const localPhone = toIvoryCoastLocalPhone(value);

  if (/^0\d{9}$/.test(localPhone)) {
    return `225${localPhone.slice(1)}`;
  }

  const digits = normalizePhoneDigits(value).replace(/^2250/, "225");
  if (digits.startsWith("225")) return digits;

  return `225${digits.replace(/^0/, "")}`;
};