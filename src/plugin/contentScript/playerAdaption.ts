import { SkippableVideoControls } from './videoController'

export type VideoControls = {
  play: () => void
  pause: () => void
  seek: (time: number) => void
}

const getDefaultControls = (video: HTMLVideoElement): VideoControls => ({
  play: () => {
    if (video.paused) {
      return video.play()
    }
  },
  pause: () => {
    if (!video.paused) {
      video.pause()
    }
  },
  seek: (time) => {
    video.currentTime = time
  },
})

const togglePlayingViaButton = (playPauseButton: HTMLElement | null) => {
  if (playPauseButton) {
    playPauseButton.click()
  } else {
    throw new Error(`Play / Pause button could not be found`)
  }
}

const getControlsForNetflix = (video: HTMLVideoElement): VideoControls => {
  const seekBarSelector = '#appMountPoint .track'
  const playPauseButtonSelector =
    '#appMountPoint .button-nfplayerPlay, #appMountPoint .button-nfplayerPause'

  return {
    ...getDefaultControls(video),
    play: () => {
      if (video.paused) {
        const playPauseButton = document.querySelector<HTMLButtonElement>(
          playPauseButtonSelector,
        )
        console.log('playing')
        togglePlayingViaButton(playPauseButton)
      }
    },
    pause: () => {
      if (!video.paused) {
        const playPauseButton = document.querySelector<HTMLButtonElement>(
          playPauseButtonSelector,
        )
        console.log('pausing')
        togglePlayingViaButton(playPauseButton)
      }
    },
    seek: (time) => {
      const seekBar = document.querySelector<HTMLElement>(seekBarSelector)

      if (seekBar) {
        // Seek bar might currently be hidden and could have all dimensions set to 0. Triggering a click event
        // will show the bar and reveal its true dimensions.
        seekBar.click()

        const { width, top, left } = seekBar.getBoundingClientRect()

        const percentage = time / video.duration
        const xPosition = left + width * percentage

        const fireEvent = (eventType: string) => {
          const event = document.createEvent('MouseEvent')
          event.initMouseEvent(
            eventType,
            true /* bubble */,
            true /* cancelable */,
            window,
            NaN,
            xPosition,
            top,
            xPosition,
            top /* coordinates */,
            false,
            false,
            false,
            false /* modifier keys */,
            0 /*left*/,
            null,
          )
          seekBar.dispatchEvent(event)
        }

        console.log('seeking')

        fireEvent('mousedown') // Indicate this is where I plan to seek to
        fireEvent('mouseup') // Indicate that I am done scrubbing along the bar, thus triggering the seek event
      } else {
        throw new Error('Seek bar not found!')
      }
    },
  }
}

const asyncRequestAnimationFrame = () => {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

export const getDisneyPlusPlayPauseElement = async (): Promise<HTMLButtonElement> => {
  // Video controls might not be displayed. Clicking on the overlay once will make them re-appear.
  document
    .querySelector<HTMLDivElement>('#hudson-wrapper .overlay.overlay__skip')
    ?.click()

  for (let i = 0; i < 100; i++) {
    await asyncRequestAnimationFrame()
    const el = document.querySelector<HTMLButtonElement>(
      'button.control-icon-btn.play-pause-icon',
    )
    if (el) {
      console.log(`Button found; took ${i} animation frames!`)
      return el
    }
  }

  throw new Error('No play / pause button found on disney plus.')
}

const getControlsForDisneyPlus = (video: HTMLVideoElement): VideoControls => {
  return {
    ...getDefaultControls(video),
    play: async () => {
      if (video.paused) {
        togglePlayingViaButton(await getDisneyPlusPlayPauseElement())
      }
    },
    pause: async () => {
      if (!video.paused) {
        togglePlayingViaButton(await getDisneyPlusPlayPauseElement())
      }

      await asyncRequestAnimationFrame()
    },
  }
}

const skipEventsBeforeTriggeringThem = (
  oldControls: VideoControls,
  video: HTMLVideoElement,
): SkippableVideoControls => ({
  play: (shouldSkipEvents) => {
    if (video.paused) {
      shouldSkipEvents.play = true
      oldControls.play()
    }
  },
  pause: (shouldSkipEvents) => {
    if (!video.paused) {
      shouldSkipEvents.pause = true
      oldControls.pause()
    }
  },
  seek: (shouldSkipEvents, time) => {
    shouldSkipEvents.seeking = true
    oldControls.seek(time)
  },
})

export const getVideoControls = (
  video: HTMLVideoElement,
): SkippableVideoControls => {
  let controls = getDefaultControls(video)

  if (window.location.host.includes('disney')) {
    controls = getControlsForDisneyPlus(video)
  } else if (window.location.host.includes('netflix')) {
    controls = getControlsForNetflix(video)
  }

  return skipEventsBeforeTriggeringThem(controls, video)
}
