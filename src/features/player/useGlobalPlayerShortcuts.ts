import { useEffect } from 'react'

import { usePlayerStore } from './player-store'

function isInteractiveElement(
  target: EventTarget | null,
) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return Boolean(
    target.closest(
      [
        'input',
        'textarea',
        'select',
        'button',
        'a',
        '[contenteditable="true"]',
        '[role="textbox"]',
      ].join(','),
    ),
  )
}

export function useGlobalPlayerShortcuts() {
  const currentTrack = usePlayerStore(
    (state) => state.currentTrack,
  )

  const togglePlay = usePlayerStore(
    (state) => state.togglePlay,
  )

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      const pressedSpace =
        event.code === 'Space' ||
        event.key === ' '

      if (
        !pressedSpace ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey
      ) {
        return
      }

      /*
        Do not pause music when the user is typing in
        search, forms, journal fields or pressing an
        already-focused button.
      */
      if (
        isInteractiveElement(event.target)
      ) {
        return
      }

      if (!currentTrack?.previewUrl) {
        return
      }

      /*
        Prevent Spacebar from scrolling the page.
      */
      event.preventDefault()

      togglePlay()
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    )

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      )
    }
  }, [
    currentTrack?.previewUrl,
    togglePlay,
  ])
}