import { cn } from '@/lib/utils'

type ContainerProps = React.ComponentProps<'div'>

/** Largeur de lecture centrée, partagée par la navbar et les pages. */
export const Container: React.FC<ContainerProps> = ({
  className,
  ...props
}) => (
  <div
    className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}
    {...props}
  />
)
