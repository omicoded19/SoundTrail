export type AccentTheme =
  | 'rose'
  | 'violet'
  | 'cyan'
  | 'emerald'

export type AccentThemeOption = {
  id: AccentTheme
  label: string
  description: string
  preview: string
}

export const ACCENT_STORAGE_KEY = 'soundtrail-accent'

export const DEFAULT_ACCENT_THEME: AccentTheme = 'rose'

export const ACCENT_THEME_OPTIONS: AccentThemeOption[] = [
  {
    id: 'rose',
    label: 'Rose',
    description: 'Warm pink and magenta',
    preview: '#ec4899',
  },
  {
    id: 'violet',
    label: 'Violet',
    description: 'Deep purple and lavender',
    preview: '#8b5cf6',
  },
  {
    id: 'cyan',
    label: 'Cyan',
    description: 'Bright blue and turquoise',
    preview: '#06b6d4',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    description: 'Fresh green and teal',
    preview: '#10b981',
  },
]

export function isAccentTheme(
  value: string | null,
): value is AccentTheme {
  return ACCENT_THEME_OPTIONS.some(
    (theme) => theme.id === value,
  )
}

export function getSavedAccentTheme(): AccentTheme {
  const savedTheme = localStorage.getItem(
    ACCENT_STORAGE_KEY,
  )

  return isAccentTheme(savedTheme)
    ? savedTheme
    : DEFAULT_ACCENT_THEME
}

export function applyAccentTheme(
  theme: AccentTheme,
): void {
  document.documentElement.dataset.accent = theme

  localStorage.setItem(
    ACCENT_STORAGE_KEY,
    theme,
  )
}