import type { ReactNode } from 'react';

type TopBarIconName =
  | 'kanban'
  | 'gantt'
  | 'dashboard'
  | 'bell'
  | 'user'
  | 'search'
  | 'filter';

type TopBarIconProps = {
  name: TopBarIconName;
  className?: string;
};

function IconFrame({
  className = '',
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`topbar-svg-icon ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function TopBarIcon({ name, className }: TopBarIconProps) {
  switch (name) {
    case 'kanban':
      return (
        <IconFrame className={className}>
          <path d="M5 6v6" />
          <path d="M12 6v12" />
          <path d="M19 6v8" />
          <path d="M3.5 6h3" />
          <path d="M10.5 12h3" />
          <path d="M17.5 8h3" />
        </IconFrame>
      );
    case 'gantt':
      return (
        <IconFrame className={className}>
          <path d="M4 6.5h16" />
          <path d="M4 12h16" />
          <path d="M4 17.5h16" />
          <path d="M6 5v14" />
          <rect x="7.5" y="4.5" width="5.5" height="4" rx="2" />
          <rect x="10.5" y="10" width="7" height="4" rx="2" />
          <rect x="8.5" y="15.5" width="4.5" height="4" rx="2" />
        </IconFrame>
      );
    case 'dashboard':
      return (
        <IconFrame className={className}>
          <path d="M4 19.5h16" />
          <rect x="5" y="10.5" width="3.5" height="7" rx="1.5" />
          <rect x="10.25" y="6.5" width="3.5" height="11" rx="1.5" />
          <rect x="15.5" y="8.5" width="3.5" height="9" rx="1.5" />
        </IconFrame>
      );
    case 'bell':
      return (
        <IconFrame className={className}>
          <path d="M8.5 18h7" />
          <path d="M10 20a2.2 2.2 0 0 0 4 0" />
          <path d="M18 16H6c1.1-1.2 1.8-2.9 1.8-4.8V10a4.2 4.2 0 1 1 8.4 0v1.2c0 1.9.7 3.6 1.8 4.8Z" />
        </IconFrame>
      );
    case 'user':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="8.5" r="3.25" />
          <path d="M5.5 18.5a6.5 6.5 0 0 1 13 0" />
        </IconFrame>
      );
    case 'search':
      return (
        <IconFrame className={className}>
          <circle cx="11" cy="11" r="5.5" />
          <path d="m16 16 3.5 3.5" />
        </IconFrame>
      );
    case 'filter':
      return (
        <IconFrame className={className}>
          <path d="M4 7h7" />
          <path d="M15 7h5" />
          <path d="M4 17h4" />
          <path d="M12 17h8" />
          <circle cx="13" cy="7" r="2" />
          <circle cx="10" cy="17" r="2" />
        </IconFrame>
      );
  }
}
