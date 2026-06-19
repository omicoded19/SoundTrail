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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex min-h-[320px] flex-col justify-end overflow-hidden md:min-h-[420px] lg:min-h-[520px] lg:w-[42%] lg:shrink-0"
      aria-label={`${artist.name} artist profile`}
    >
      <motion.div
        className="absolute inset-0"
        animate={{
          background: `linear-gradient(160deg, ${artist.accentColor} 0%, ${artist.accentColorDark} 55%, #0a0a0a 100%)`,
        }}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      />

      <div className="relative flex flex-1 items-end px-6 pb-8 pt-16 md:px-10 md:pb-10">
        <motion.img
          key={artist.portraitUrl}
          src={artist.portraitUrl}
          alt={artist.name}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-0 left-1/2 h-[85%] max-h-[480px] w-auto max-w-[90%] -translate-x-1/2 object-cover object-top drop-shadow-2xl md:left-auto md:right-4 md:translate-x-0 lg:right-8"
        />

        <div className="relative z-10 max-w-full">
          <motion.h1
            key={artist.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-5xl font-extrabold leading-[0.95] tracking-tight text-white drop-shadow-lg sm:text-6xl md:text-7xl lg:text-8xl"
          >
            {artist.name}
          </motion.h1>

          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="icon"
              size="sm"
              aria-label={isFollowing ? 'Unfollow artist' : 'Follow artist'}
              aria-pressed={isFollowing}
              onClick={() => setIsFollowing((value) => !value)}
              className={cn(isFollowing && 'bg-white/15 text-white')}
            >
              <Plus className={cn('h-5 w-5', isFollowing && 'rotate-45')} />
            </Button>
            <Button
              variant="icon"
              size="sm"
              aria-label={isFavourite ? 'Remove from favourites' : 'Favourite artist'}
              aria-pressed={isFavourite}
              onClick={() => setIsFavourite((value) => !value)}
              className={cn(isFavourite && 'text-amber-300')}
            >
              <Star className={cn('h-5 w-5', isFavourite && 'fill-current')} />
            </Button>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
