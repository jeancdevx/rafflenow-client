import { cn } from '@/lib/utils'
import { useState } from 'react'

interface RaffleImageGalleryProps {
  images: string[]
  title: string
}

const RaffleImageGallery = ({ images, title }: RaffleImageGalleryProps) => {
  const [coverIndex, setCoverIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className='aspect-video bg-muted rounded-lg flex items-center justify-center'>
        <span className='text-muted-foreground'>Sin imágenes</span>
      </div>
    )
  }

  const coverImage = images[coverIndex]

  return (
    <div className='space-y-3'>
      <div className='relative aspect-video overflow-hidden rounded-md bg-muted'>
        <img
          src={coverImage}
          alt={`${title} - Imagen principal`}
          className='w-full h-full object-cover transition-all duration-300 object-center'
        />
      </div>

      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto pb-2'>
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCoverIndex(index)}
              className={cn(
                'relative shrink-0 size-24 rounded-md overflow-hidden border-2 transition-all ring-0!',
                index === coverIndex
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-transparent hover:border-muted-foreground/50'
              )}
            >
              <img
                src={image}
                alt={`${title} - Imagen ${index + 1}`}
                className='w-full h-full object-cover'
              />
              {index === coverIndex && (
                <div className='absolute inset-0 bg-primary/10' />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export { RaffleImageGallery }
