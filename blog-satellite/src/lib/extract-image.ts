export function extractFirstImage(content: any): string | null {
  if (!content) return null

  if (content.type === 'customImage' && content.attrs?.src) {
    return content.attrs.src
  }

  if (content.type === 'imageGallery' && content.attrs?.images?.length > 0 && content.attrs.images[0].src) {
    return content.attrs.images[0].src
  }

  if (content.content && Array.isArray(content.content)) {
    for (const node of content.content) {
      const found = extractFirstImage(node)
      if (found) return found
    }
  }

  return null
}
