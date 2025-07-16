/**
 * Email validation regex pattern
 *
 * Pattern breakdown:
 * ^[A-Z0-9._%+-]+  - Start with one or more alphanumeric chars, dots, underscores, percent, plus, or hyphen
 * @                - Literal @ symbol
 * [A-Z0-9.-]+      - One or more alphanumeric chars, dots, or hyphens (domain name part)
 * \.               - Literal dot
 * [A-Z]{2,}$       - End with 2 or more alphabetic characters (top-level domain)
 *
 * The 'i' flag makes it case-insensitive
 */
export const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Stock symbol validation regex pattern
 *
 * Pattern breakdown:
 * ^[A-Z]{1,5}$ - Exactly 1 to 5 uppercase letters from start to end
 */
export const STOCK_SYMBOL_REGEX = /^[A-Z]{1,5}$/;

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

export const validateStockSymbol = (symbol: string): boolean => {
  return STOCK_SYMBOL_REGEX.test(symbol);
};

export const PASSWORD_MIN_LENGTH = 6;

export const validatePassword = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH;
};
