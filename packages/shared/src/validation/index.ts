// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Phone validation (Saudi format)
export function isValidSaudiPhone(phone: string): boolean {
  // Saudi phone: +966 5X XXX XXXX or 05X XXX XXXX
  const saudiPhoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;
  return saudiPhoneRegex.test(phone.replace(/\s/g, ''));
}

// Weight validation
export function validateWeight(weight: number): {
  valid: boolean;
  error?: string;
} {
  if (weight <= 0) {
    return { valid: false, error: 'Weight must be greater than 0' };
  }
  if (weight > 30) {
    return { valid: false, error: 'Weight cannot exceed 30 kg' };
  }
  return { valid: true };
}

// Price validation
export function validatePrice(price: number): {
  valid: boolean;
  error?: string;
} {
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  if (price > 1000) {
    return { valid: false, error: 'Price seems too high' };
  }
  return { valid: true };
}

// Item value validation
export function validateItemValue(value: number): {
  valid: boolean;
  error?: string;
} {
  if (value <= 0) {
    return { valid: false, error: 'Value must be greater than 0' };
  }
  if (value > 500) {
    return {
      valid: false,
      error: 'Items over 500 SAR require additional insurance',
    };
  }
  return { valid: true };
}

// Date validation (must be in future)
export function validateFutureDate(date: string | Date): {
  valid: boolean;
  error?: string;
} {
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (inputDate < today) {
    return { valid: false, error: 'Date must be in the future' };
  }
  return { valid: true };
}

// Listing validation
export function validateListing(listing: {
  departureCity: string;
  arrivalCity: string;
  departureDate: string | Date;
  availableWeight: number;
  price: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!listing.departureCity?.trim()) {
    errors.push('Departure city is required');
  }

  if (!listing.arrivalCity?.trim()) {
    errors.push('Arrival city is required');
  }

  if (listing.departureCity === listing.arrivalCity) {
    errors.push('Departure and arrival cities must be different');
  }

  const dateValidation = validateFutureDate(listing.departureDate);
  if (!dateValidation.valid) {
    errors.push(dateValidation.error!);
  }

  const weightValidation = validateWeight(listing.availableWeight);
  if (!weightValidation.valid) {
    errors.push(weightValidation.error!);
  }

  const priceValidation = validatePrice(listing.price);
  if (!priceValidation.valid) {
    errors.push(priceValidation.error!);
  }

  return { valid: errors.length === 0, errors };
}

// Item validation
export function validateItem(item: { name: string; weight: number; value: number }): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!item.name?.trim()) {
    errors.push('Item name is required');
  }

  if (item.name && item.name.length > 100) {
    errors.push('Item name must be less than 100 characters');
  }

  const weightValidation = validateWeight(item.weight);
  if (!weightValidation.valid) {
    errors.push(weightValidation.error!);
  }

  const valueValidation = validateItemValue(item.value);
  if (!valueValidation.valid) {
    errors.push(valueValidation.error!);
  }

  return { valid: errors.length === 0, errors };
}

// Booking validation
export function validateBooking(booking: {
  totalWeight: number;
  items: { name: string; weight: number; value: number }[];
  availableWeight: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!booking.items || booking.items.length === 0) {
    errors.push('At least one item is required');
  }

  // Validate each item
  booking.items?.forEach((item, index) => {
    const itemValidation = validateItem(item);
    if (!itemValidation.valid) {
      errors.push(`Item ${index + 1}: ${itemValidation.errors.join(', ')}`);
    }
  });

  // Check total weight against available weight
  if (booking.totalWeight > booking.availableWeight) {
    errors.push(
      `Total weight (${booking.totalWeight}kg) exceeds available weight (${booking.availableWeight}kg)`
    );
  }

  return { valid: errors.length === 0, errors };
}
