export type CategoryKey = 'nitro' | 'ipa' | 'stout' | 'sour' | 'cider' | 'event'

export interface Category {
  key: CategoryKey
  label: string
  color: string
}

export const CATEGORIES: Category[] = [
  { key: 'nitro', label: 'Light', color: 'var(--color-nitro)' },
  { key: 'ipa', label: 'Hoppy', color: 'var(--color-ipa)' },
  { key: 'stout', label: 'Dark', color: 'var(--color-stout)' },
  { key: 'sour', label: 'Sour', color: 'var(--color-sour)' },
  { key: 'cider', label: 'Cider', color: 'var(--color-cider)' },
  { key: 'event', label: 'Wine', color: 'var(--color-event)' },
]

const STYLE_TO_CATEGORY: Record<string, CategoryKey> = {
  'porter, stout': 'stout',
  cider: 'cider',
  'pale, ipa': 'ipa',
  sour: 'sour',
  wine: 'event',
}

export function getCategoryKey(style: string): CategoryKey {
  return STYLE_TO_CATEGORY[style] ?? 'nitro'
}

export function getCategoryColor(style: string): string {
  const key = getCategoryKey(style)
  return CATEGORIES.find((category) => category.key === key)!.color
}
