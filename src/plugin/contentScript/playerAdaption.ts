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

const getControlsForNetflix = (video: HTMLVideoElement): VideoControls => {
  return {
    ...getDefaultControls(video),
    seek: () => {
      throw new Error('Seek is not yet supported for Netflix.')
    },
  }
}

export const getDisneyPlusPlayPauseElement = () => document.querySelector<HTMLButtonElement>(
  'div > div > div.controls__footer.display-flex > div.controls__footer__wrapper.display-flex >' +
  ' div.controls__center > button.control-icon-btn.play-icon.play-pause-icon',
)

const getControlsForDisneyPlus = (video: HTMLVideoElement): VideoControls => {
  const togglePlaying = () => {
    const playPauseButton = getDisneyPlusPlayPauseElement()

    if (playPauseButton) {
      playPauseButton.click()
    } else {
      throw new Error(
        `Play / Pause button could not be found and Disney Plus doesn't seem to support normal play / pause`)
    }
  }

  return {
    ...getDefaultControls(video),
    play: () => {
      if (video.paused) {
        togglePlaying()
      }
    },
    pause: () => {
      if (!video.paused) {
        togglePlaying()
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
