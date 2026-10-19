import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CoverImageProps {
  src: string
  alt: string
  className?: string
}

/** Image de couverture avec repli dégradé si l'URL est cassée. */
export const CoverImage: React.FC<CoverImageProps> = ({
  src,
  alt,
  className,
}) => {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'bg-linear-to-br from-orange-300 via-rose-400 to-sky-500',
          className,
        )}
      />
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  )
}
