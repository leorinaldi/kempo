'use client'

import Image from 'next/image'

export interface ArticleImageProps {
  /** The image URL */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Caption text displayed below the image */
  caption?: string
  /** Float position: left, right, or center (default: right) */
  position?: 'left' | 'right' | 'center'
  /** Image width in pixels (default: 300) */
  width?: number
  /** Optional click handler to open full image */
  onClick?: () => void
}

/**
 * ArticleImage - Wiki-style inline image component for articles
 *
 * Displays an image with optional caption, supporting float positioning
 * for integration within article text flow.
 */
export function ArticleImage({
  src,
  alt,
  caption,
  position = 'right',
  width = 300,
  onClick,
}: ArticleImageProps) {
  const positionClasses = {
    left: 'article-image-left',
    right: 'article-image-right',
    center: 'article-image-center',
  }

  return (
    <figure
      className={`article-image ${positionClasses[position]}`}
      style={{ maxWidth: width }}
    >
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="article-image-link"
        onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
      >
        <img
          src={src}
          alt={alt}
          className="article-image-img"
        />
      </a>
      {caption && (
        <figcaption className="article-image-caption">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export default ArticleImage
