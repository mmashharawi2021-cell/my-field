export type IconName =
  | 'home'
  | 'map'
  | 'projects'
  | 'search'
  | 'locate'
  | 'select'
  | 'measure'
  | 'plus'
  | 'layers'
  | 'chevron'

const paths: Record<IconName, string> = {
  home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z',
  map: 'M3 6.5 8.5 4l7 2.5L21 4v13.5L15.5 20l-7-2.5L3 20V6.5Zm5.5-2.5v13.5m7-11V20',
  projects: 'M4 5h6l2 2h8v12H4V5Zm0 5h16',
  search: 'm20 20-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z',
  locate: 'M12 2v3m0 14v3M2 12h3m14 0h3m-5 0a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  select: 'm5 4 6.8 16 2.2-6 6-2.2L5 4Z',
  measure: 'M4 16 16 4l4 4L8 20l-4-4Zm5-5 2 2m1-5 2 2m-8 4 2 2',
  plus: 'M12 5v14M5 12h14',
  layers: 'm12 3 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5m-18 5 9 5 9-5',
  chevron: 'm9 18 6-6-6-6',
}

export function AppIcon({ name, size = 20, className = '' }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
