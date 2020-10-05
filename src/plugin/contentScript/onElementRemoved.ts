export const onElementRemoved = (element: HTMLElement, callback: () => void) => {
  if (element.parentElement) {
    const observer = new MutationObserver(() => {
      // Node was removed from DOM if parent is null
      if (element.parentElement === null) {
        observer.disconnect()
        callback()
      }
    })

    observer.observe(element.parentElement, {
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    })
  } else {
    callback()
  }
}
