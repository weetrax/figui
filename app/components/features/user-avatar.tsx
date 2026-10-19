import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { PublicUser } from '@/types'

interface UserAvatarProps {
  user: PublicUser
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'default',
  className,
}) => (
  <Avatar size={size} className={cn('border bg-card', className)}>
    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
    <AvatarFallback className="bg-secondary text-xs font-semibold text-muted-foreground">
      {initials(user.name)}
    </AvatarFallback>
  </Avatar>
)
