// src/components/ui/avatar.tsx
import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// ✅ Enhanced Avatar Component with Smart Fallbacks
interface SmartAvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const SmartAvatar: React.FC<SmartAvatarProps> = ({ 
  src, 
  name = 'User', 
  size = 'md',
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base',
    xl: 'h-24 w-24 text-lg'
  };

  const getInitials = (fullName: string) => {
    const names = fullName.trim().split(' ');
    let initials = '';
    for (let i = 0; i < Math.min(names.length, 2); i++) {
      if (names[i] && names[i].length > 0) {
        initials += names[i][0].toUpperCase();
      }
    }
    return initials || 'U';
  };

  const generateColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-red-500', 'bg-yellow-500', 'bg-indigo-500',
      'bg-pink-500', 'bg-cyan-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {src && <AvatarImage src={src} alt={`${name}'s avatar`} />}
      <AvatarFallback className={`${generateColor(name)} text-white font-bold`}>
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
};

export { Avatar, AvatarImage, AvatarFallback };
