/**
 * Mock data fallbacks are a development convenience only (API offline, empty DB).
 * Release builds must never show fabricated listings/bookings to real users —
 * they could try to book them, and app review treats fake content as misleading.
 */
export const USE_MOCK_FALLBACK = __DEV__;
