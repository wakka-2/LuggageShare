/**
 * Content moderation utility for LuggageShare.
 *
 * Provides basic profanity detection and sanitization for
 * user-generated content (reviews, messages, etc.).
 */

// A modest list of common English and Arabic profane terms.
// Each entry is stored in lower-case for case-insensitive matching.
const PROFANITY_LIST: string[] = [
  // English
  'fuck',
  'shit',
  'asshole',
  'bitch',
  'bastard',
  'damn',
  'dick',
  'piss',
  'crap',
  'cunt',
  'whore',
  'slut',
  'motherfucker',
  'bullshit',
  'dumbass',
  // Arabic transliterations (covering common romanized forms)
  'kuss',
  'sharmouta',
  'sharmoot',
  'kelb',
  'ibn el sharmouta',
  'ya kalb',
  'ya hmar',
  'ya khara',
  'kol khara',
  'ayre',
  'ayreh',
  'zift',
  'telhas',
  'ahbal',
  'maniak',
];

/**
 * Build a combined regex that matches any word from the profanity list.
 * Uses word boundaries so partial matches inside normal words are avoided
 * (e.g. "assistant" won't match "ass").
 *
 * The pattern is compiled once at module load time for efficiency.
 */
const PROFANITY_REGEX = new RegExp(
  PROFANITY_LIST.map((word) => `\\b${escapeRegex(word)}\\b`).join('|'),
  'gi'
);

/** Escape special regex characters in a literal string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Returns `true` when the supplied text contains one or more profane words.
 *
 * The check is case-insensitive and uses word-boundary matching to avoid
 * false positives on substrings.
 */
export function containsProfanity(text: string): boolean {
  // Reset lastIndex in case the shared regex was used previously.
  PROFANITY_REGEX.lastIndex = 0;
  return PROFANITY_REGEX.test(text);
}

/**
 * Returns a copy of the text where every profane word is replaced with
 * asterisks of the same length (e.g. "shit" -> "****").
 */
export function sanitizeContent(text: string): string {
  PROFANITY_REGEX.lastIndex = 0;
  return text.replace(PROFANITY_REGEX, (match) => '*'.repeat(match.length));
}
