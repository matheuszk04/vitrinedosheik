import type { SVGProps } from 'react'

/**
 * Ícones de traço fino desenhados para a VITTA (24×24, traço 1,5).
 * Decorativos por padrão (aria-hidden); o texto acessível fica no botão ou link.
 */
const paths = {
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20c.9-3.6 3.8-5.5 7.25-5.5s6.35 1.9 7.25 5.5" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8.5h13l-1 11.5h-11z" />
      <path d="M9 8.5V7a3 3 0 016 0v1.5" />
    </>
  ),
  'chevron-left': <path d="M14.5 6l-6 6 6 6" />,
  'chevron-right': <path d="M9.5 6l6 6-6 6" />,
  'chevron-down': <path d="M6 9.5l6 6 6-6" />,
  'arrow-right': <path d="M4 12h15m-5-5l5 5-5 5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M4.5 7h15M9.5 7V5h5v2M6.5 7l1 12.5h9l1-12.5" />
      <path d="M10.5 11v5M13.5 11v5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  sliders: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6.5h11v9H3zM14 9.5h3.5l3 3v3H14" />
      <circle cx="7" cy="17.5" r="1.75" />
      <circle cx="17" cy="17.5" r="1.75" />
    </>
  ),
  return: (
    <>
      <path d="M9 7L5 11l4 4" />
      <path d="M5 11h9.5a4.5 4.5 0 010 9H11" />
    </>
  ),
  chat: <path d="M5 5.5h14v10H10l-4 3.5v-3.5H5z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5M12 8v.01" />
    </>
  ),
  image: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <path d="M4 16l4.5-4.5 4 4 2.5-2.5L20 18" />
    </>
  ),
  cube: (
    <>
      <path d="M12 3.5l7.5 4.25v8.5L12 20.5l-7.5-4.25v-8.5z" />
      <path d="M4.5 7.75L12 12l7.5-4.25M12 12v8.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.5" />
      <path d="M4 6.5l8 6 8-6" />
    </>
  ),
  link: <path d="M10 14a4 4 0 005.66 0l3-3a4 4 0 00-5.66-5.66l-1 1M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 005.66 5.66l1-1" />,
  alert: (
    <>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4M12 17v.01" />
    </>
  ),
} as const

export type IconName = keyof typeof paths

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName
}

export function Icon({ name, className = 'size-5', ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      {paths[name]}
    </svg>
  )
}
