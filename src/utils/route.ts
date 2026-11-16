export function readCrumb(handle: unknown) {
  if (handle && typeof handle === 'object' && 'crumb' in handle) {
    const crumb = handle.crumb
    if (typeof crumb === 'string') return crumb
  }
  return null
}
