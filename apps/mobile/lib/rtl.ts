import i18n from '@/i18n';

type DirectionalIcon = 'chevron-forward' | 'chevron-back' | 'arrow-forward' | 'arrow-back';

const FLIPPED: Record<DirectionalIcon, DirectionalIcon> = {
  'chevron-forward': 'chevron-back',
  'chevron-back': 'chevron-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back': 'arrow-forward',
};

/**
 * Ionicons glyphs are not mirrored automatically. Pass the LTR name ("forward"
 * = towards the end of the line); in Arabic the mirrored glyph is returned.
 */
export function dirIcon(name: DirectionalIcon): DirectionalIcon {
  return i18n.language === 'ar' ? FLIPPED[name] : name;
}

/** Route arrow for "A → B" text in the current reading direction. */
export function routeArrow(): string {
  return i18n.language === 'ar' ? '←' : '→';
}
