const SMALL_WORDS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
];

/**
 * Converts a product count integer to a formatted sentence fragment.
 * Numbers 1..12 are rendered in words ("Seven products.").
 * Numbers 13+ are formatted with locale commas ("1,420 products.").
 */
export function formatProductCount(count) {
  if (typeof count !== "number" || count <= 0) {
    return "Platform products.";
  }

  if (count < SMALL_WORDS.length) {
    return `${SMALL_WORDS[count]} products.`;
  }

  return `${count.toLocaleString()} products.`;
}

/**
 * Converts a small number (0..12) into its English word representation.
 * Returns locale string for larger numbers.
 */
export function numberToWord(num, capitalize = true) {
  if (typeof num !== "number" || isNaN(num) || num < 0) return "";

  if (num < SMALL_WORDS.length) {
    const word = SMALL_WORDS[num];
    return capitalize ? word : word.toLowerCase();
  }

  return num.toLocaleString();
}
