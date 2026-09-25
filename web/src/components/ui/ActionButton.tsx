import type { ButtonHTMLAttributes } from 'react'

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon'
  fullWidth?: boolean
}

export function ActionButton({
  variant = 'secondary',
  fullWidth = false,
  className = '',
  ...props
}: ActionButtonProps) {
  const classes = [
    'action-button',
    'action-button--' + variant,
    fullWidth ? 'is-full' : '',
    className,
  ].filter(Boolean).join(' ')

  return <button className={classes} {...props} />
}
