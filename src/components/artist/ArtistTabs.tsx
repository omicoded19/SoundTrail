import { cn } from '@/lib/cn'
import { ARTIST_TABS, type ArtistTab } from '@/lib/constants'

interface ArtistTabsProps {
  activeTab: ArtistTab
  onTabChange: (tab: ArtistTab) => void
  accentColor: string
}

export function ArtistTabs({ activeTab, onTabChange, accentColor }: ArtistTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Artist sections"
      className="flex gap-1 overflow-x-auto border-b border-white/10 pb-px"
    >
      {ARTIST_TABS.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'relative shrink-0 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/80',
            )}
          >
            {tab.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full"
                style={{ backgroundColor: accentColor }}
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
