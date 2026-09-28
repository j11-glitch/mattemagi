import type { Child } from '../domain/puzzles'

const IMAGE = /\.(png|jpe?g|webp|gif|svg)$/i

/** A child's avatar: an image path under public/ (e.g. "avatars/simo.png") or an emoji. */
export function Avatar({ child, className }: { child: Child; className: string }) {
  if (IMAGE.test(child.avatar)) {
    return <img className={`${className} avatar-image`} src={`${import.meta.env.BASE_URL}${child.avatar}`} alt="" />
  }
  return (
    <span className={className} aria-hidden="true">
      {child.avatar}
    </span>
  )
}
