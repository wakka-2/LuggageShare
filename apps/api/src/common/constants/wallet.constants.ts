/**
 * Central money/credits configuration for the wallet.
 *
 * Credits are a prepaid platform-fee wallet tracked in `BalanceHistory` (a ledger:
 * balance = sum of amounts). Users earn starter + referral credits, the platform
 * deducts a commission per completed trip, and users top up by bank transfer that
 * an admin confirms.
 *
 * Platform payout details are overridable via env so they never require a code
 * change to rotate.
 */
export const WALLET = {
  CURRENCY: 'SAR',

  /** Credits granted to every new user on signup. */
  SIGNUP_BONUS: Number(process.env.WALLET_SIGNUP_BONUS ?? 10),

  /** Credits granted to the inviter for each user who registers with their code. */
  REFERRAL_BONUS: Number(process.env.WALLET_REFERRAL_BONUS ?? 10),

  /** Platform commission taken from the carrier per completed trip (0.15 = 15%). */
  COMMISSION_RATE: Number(process.env.WALLET_COMMISSION_RATE ?? 0.15),

  /** Top-up bounds (SAR). */
  TOPUP_MIN: Number(process.env.WALLET_TOPUP_MIN ?? 10),
  TOPUP_MAX: Number(process.env.WALLET_TOPUP_MAX ?? 10000),

  /** Where users transfer money to top up their credits. */
  PLATFORM_IBAN: process.env.WALLET_PLATFORM_IBAN ?? 'SA2705000068202733525000',
  PLATFORM_BANK: process.env.WALLET_PLATFORM_BANK ?? 'Alinma Bank',
  PLATFORM_ACCOUNT_NAME: process.env.WALLET_PLATFORM_ACCOUNT_NAME ?? 'LuggageShare',
} as const;

/** Ledger entry types (BalanceHistory.type). */
export const LEDGER_TYPE = {
  SIGNUP_BONUS: 'signup_bonus',
  REFERRAL_BONUS: 'referral_bonus',
  COMMISSION: 'commission',
  TOPUP: 'topup',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund',
} as const;

/** Round a money amount to 2 decimals, avoiding binary float drift. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
