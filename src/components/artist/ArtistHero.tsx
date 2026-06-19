import { useState } from 'react'
import { motion } from 'motion/react'
import { Plus, Star } from 'lucide-react'

import type { Artist } from '@/types/artist'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

interface ArtistHeroProps {
  artist: Artist
}

export function ArtistHero({ artist }: ArtistHeroProps) {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isFavourite, setIsFavourite] = useState(false)

  return (
    <motion.section
      key={artist.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="relative min-h-[500px] overflow-hidden lg:min-h-[calc(100dvh-96px)] lg:w-[52%]"
      aria-label={`${artist.name} artist profile`}
    >
      {/* Background gradient based on the selected artist */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(155deg, ${artist.accentColor} 0%, ${artist.accentColorDark} 100%)`,
        }}
        transition={{ duration: 0.45 }}
        aria-hidden="true"
      />

      {/* Large artist image */}
      <motion.img
        key={artist.portraitUrl}
        src={artist.portraitUrl}
        alt={artist.name}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-top"
        style={{
          /*
            Mask makes the image fade into the background.
            This prevents the image from looking like a rectangular card.
          */
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 72%, transparent 100%), linear-gradient(to right, transparent 0%, black 24%, black 100%)',
          WebkitMaskComposite: 'source-in',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 72%, transparent 100%), linear-gradient(to right, transparent 0%, black 24%, black 100%)',
          maskComposite: 'intersect',
        }}
      />

      {/* Dark overlay so white text stays readable */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.32)_0%,rgba(0,0,0,0.04)_58%),linear-gradient(0deg,rgba(0,0,0,0.58)_0%,transparent_52%)]"
        aria-hidden="true"
      />

      {/* Text content */}
      <div className="relative z-10 flex min-h-[500px] flex-col justify-end px-6 pb-10 pt-20 sm:px-10 sm:pb-12 lg:min-h-[calc(100dvh-96px)] lg:px-12 lg:pb-16 xl:px-14">
        <motion.div
          key={artist.name}
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="max-w-[92%]"
        >
          {/* Huge artist name like the reference UI */}
          <h1 className="max-w-[700px] text-6xl font-extrabold leading-[0.86] tracking-[-0.055em] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.3)] sm:text-7xl lg:text-[clamp(4.8rem,7vw,8rem)]">
            {artist.name}
          </h1>

          {/* Minimal action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <Button
              variant="icon"
              size="sm"
              aria-label={isFollowing ? 'Unfollow artist' : 'Follow artist'}
              aria-pressed={isFollowing}
              onClick={() => setIsFollowing((value) => !value)}
              className={cn(
                'border border-white/30 bg-black/25 text-white hover:bg-black/40',
                isFollowing && 'bg-white text-black hover:bg-white/90',
              )}
            >
              <Plus
                className={cn(
                  'h-5 w-5 transition-transform',
                  isFollowing && 'rotate-45',
                )}
              />
            </Button>

            <Button
              variant="icon"
              size="sm"
              aria-label={isFavourite ? 'Remove from favourites' : 'Favourite artist'}
              aria-pressed={isFavourite}
              onClick={() => setIsFavourite((value) => !value)}
              className={cn(
                'border border-white/30 bg-black/25 text-white hover:bg-black/40',
                isFavourite && 'bg-white text-black hover:bg-white/90',
              )}
            >
              <Star className={cn('h-5 w-5', isFavourite && 'fill-current')} />
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}