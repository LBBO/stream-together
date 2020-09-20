export type VideoControls = {
  play: () => void
  pause: () => void
  seek: (time: number) => void
}

const getDefaultControls = (video: HTMLVideoElement): VideoControls => (
  {
    play: () => {
      if (video.paused) {
        video.play()
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
  }
)

const togglePlayingViaButton = (playPauseButton: HTMLElement | null) => {
  if (playPauseButton) {
    playPauseButton.click()
  } else {
    throw new Error(
      `Play / Pause button could not be found`)
  }
}

const getControlsForNetflix = (video: HTMLVideoElement): VideoControls => {
  const seekBarSelector = '#appMountPoint .track'
  const playPauseButtonSelector = '#appMountPoint .button-nfplayerPlay, #appMountPoint .button-nfplayerPause'

  return {
    ...getDefaultControls(video),
    play: () => {
      if (video.paused) {
        const playPauseButton = document.querySelector<HTMLButtonElement>(playPauseButtonSelector)
        console.log('playing')
        togglePlayingViaButton(playPauseButton)
      }
    },
    pause: () => {
      if (!video.paused) {
        const playPauseButton = document.querySelector<HTMLButtonElement>(playPauseButtonSelector)
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
            true /* bubble */, true /* cancelable */,
            window, NaN,
            xPosition, top, xPosition, top, /* coordinates */
            false, false, false, false, /* modifier keys */
            0 /*left*/, null,
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

export const getDisneyPlusPlayPauseElement = () => document.querySelector<HTMLButtonElement>(
  'div > div > div.controls__footer.display-flex > div.controls__footer__wrapper.display-flex >' +
  ' div.controls__center > button.control-icon-btn.play-icon.play-pause-icon',
)

const getControlsForDisneyPlus = (video: HTMLVideoElement): VideoControls => {
  return {
    ...getDefaultControls(video),
    play: () => {
      if (video.paused) {
        togglePlayingViaButton(getDisneyPlusPlayPauseElement())
      }
    },
    pause: () => {
      if (!video.paused) {
        togglePlayingViaButton(getDisneyPlusPlayPauseElement())
      }
    },
  }
}

export const getVideoControls = (video: HTMLVideoElement): VideoControls => {
  if (window.location.host.includes('disney')) {
    return getControlsForDisneyPlus(video)
  } else if (window.location.host.includes('netflix')) {
    return getControlsForNetflix(video)
  } else {
    return getDefaultControls(video)
  }
}
