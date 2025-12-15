'use client'

import * as React from 'react'
import * as AvatarPrimitive from '@radix-ui/react-avatar'

// Import helper function to merge class names (assuming it's available)
import { cn } from '@/lib/utils'

// =============================================================================
// 1. AVATAR ROOT
// =============================================================================

/**
 * Renders the root container for the avatar component.
 * Sets default styles for size, overflow, and shape (rounded-full).
 */
function Avatar({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
    return (
        <AvatarPrimitive.Root
            data-slot="avatar"
            className={cn(
                // Base styles: relative, flex, fixed size (8/size-32px), shrink-0, overflow-hidden, rounded-full
                'relative flex size-8 shrink-0 overflow-hidden rounded-full',
                className,
            )}
            {...props}
        />
    )
}

// =============================================================================
// 2. AVATAR IMAGE
// =============================================================================

/**
 * Renders the image element inside the avatar root.
 * Ensures the image covers the full size of the container and maintains aspect ratio.
 */
function AvatarImage({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
    return (
        <AvatarPrimitive.Image
            data-slot="avatar-image"
            className={cn(
                // Base styles: square aspect ratio, full size
                'aspect-square size-full',
                className
            )}
            {...props}
        />
    )
}

// =============================================================================
// 3. AVATAR FALLBACK
// =============================================================================

/**
 * Renders the fallback element (initials or icon) when the image fails to load or is not provided.
 * Centers the content within the full size of the root container.
 */
function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                // Base styles: muted background, flex, size-full, center content, rounded-full
                'bg-muted flex size-full items-center justify-center rounded-full',
                className,
            )}
            {...props}
        />
    )
}

// =============================================================================
// 4. EXPORTS
// =============================================================================

export { Avatar, AvatarImage, AvatarFallback }