export const SITE_ICON_STROKE = 1.75;

export type SiteIconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
};

function baseSvgProps({
  className,
  size = 20,
  strokeWidth = SITE_ICON_STROKE,
  title,
}: SiteIconProps) {
  return {
    className: className ? `site-icon ${className}` : 'site-icon',
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth,
    ...(title ? { role: 'img' as const, 'aria-label': title } : { 'aria-hidden': true as const }),
  };
}

/** Section titles — news / editorial blocks */
export function IconNewspaper(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      {props.title ? <title>{props.title}</title> : null}
      <path
        d="M6 8h12M6 12h12M6 16h8M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Short-news / brief headlines strip */
export function IconNewsFlash(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      {props.title ? <title>{props.title}</title> : null}
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronUp(props: SiteIconProps) {
  const svg = baseSvgProps({ size: 14, ...props });
  return (
    <svg {...svg}>
      <path d="M6 14l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronDown(props: SiteIconProps) {
  const svg = baseSvgProps({ size: 14, ...props });
  return (
    <svg {...svg}>
      <path d="M6 10l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronLeft(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChevronRight(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconClose(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}

export function IconSend(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinejoin="round" />
    </svg>
  );
}

export function IconShareNetwork(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.5 10.5 15.5 6.5M8.5 13.5l7 3.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconCamera(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <circle cx="12" cy="13" r="3.5" />
      <path d="M8 6V4h8v2" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlay(props: SiteIconProps) {
  const svg = baseSvgProps(props);
  return (
    <svg {...svg}>
      <path
        d="M8 5.5v13l11-6.5-11-6.5z"
        strokeLinejoin="round"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
