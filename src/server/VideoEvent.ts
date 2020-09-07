export type VideoEvent = {
  type: string,
  data?: {
    videoTime?: number,
    wasPreviouslyPlaying?: boolean,
  },
}
