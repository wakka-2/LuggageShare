/**
 * Marker for accounts deleted via DELETE /users/me. The row is kept (anonymized)
 * so bookings, reviews and ledger history stay consistent for the other party.
 */
export const DELETED_PROVIDER = 'deleted';

/** Bookings in these states mean someone's items are in transit — deletion is blocked. */
export const ACTIVE_DELIVERY_STATUSES = ['accepted', 'picked_up', 'in_transit'] as const;
