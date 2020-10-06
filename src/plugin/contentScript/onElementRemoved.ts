export const onElementRemoved = (element: HTMLElement, callback: () => void) => {
  if (document.body.contains(element)) {
    const observer = new MutationObserver(() => {
      // Node was removed from DOM if parent is null
      if (!document.body.contains(element)) {
        observer.disconnect()
        callback()
      }
    })

    // Observe entire DOM in case element isn't just deleted, but it's deleted together with it's ancestor(s)
    observer.observe(document.documentElement, {
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
