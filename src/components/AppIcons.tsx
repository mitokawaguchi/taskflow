import type { ReactNode } from 'react';

type AppIconName =
  | 'all'
  | 'bell'
  | 'boss-feedback'
  | 'categories'
  | 'dashboard'
  | 'filter'
  | 'gantt'
  | 'kanban'
  | 'logout'
  | 'mail-tracker'
  | 'materials'
  | 'projects'
  | 'remember'
  | 'review'
  | 'search'
  | 'settings'
  | 'sun'
  | 'templates'
  | 'today'
  | 'user'
  | 'warning';

type AppIconProps = {
  name: AppIconName;
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
      className={`app-svg-icon ${className}`.trim()}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export function AppIcon({ name, className }: AppIconProps) {
  switch (name) {
    case 'projects':
      return (
        <IconFrame className={className}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H10l2 2h5.5A2.5 2.5 0 0 1 20 9.5v7A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5Z" />
        </IconFrame>
      );
    case 'all':
      return (
        <IconFrame className={className}>
          <rect x="5" y="6" width="14" height="12" rx="2.5" />
          <path d="M8.5 10h7" />
          <path d="M8.5 14h5" />
        </IconFrame>
      );
    case 'today':
      return (
        <IconFrame className={className}>
          <rect x="5" y="6" width="14" height="13" rx="2.5" />
          <path d="M8 4.5v3" />
          <path d="M16 4.5v3" />
          <path d="M5 10h14" />
        </IconFrame>
      );
    case 'sun':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="3.5" />
          <path d="M12 4.5v2" />
          <path d="M12 17.5v2" />
          <path d="M4.5 12h2" />
          <path d="M17.5 12h2" />
          <path d="m6.7 6.7 1.4 1.4" />
          <path d="m15.9 15.9 1.4 1.4" />
          <path d="m17.3 6.7-1.4 1.4" />
          <path d="m8.1 15.9-1.4 1.4" />
        </IconFrame>
      );
    case 'warning':
      return (
        <IconFrame className={className}>
          <path d="M12 5.5 19 18H5Z" />
          <path d="M12 10v3.5" />
          <path d="M12 16.5h.01" />
        </IconFrame>
      );
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
    case 'dashboard':
      return (
        <IconFrame className={className}>
          <path d="M4 19.5h16" />
          <rect x="5" y="10.5" width="3.5" height="7" rx="1.5" />
          <rect x="10.25" y="6.5" width="3.5" height="11" rx="1.5" />
          <rect x="15.5" y="8.5" width="3.5" height="9" rx="1.5" />
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
    case 'templates':
      return (
        <IconFrame className={className}>
          <rect x="6" y="5" width="12" height="14" rx="2.5" />
          <path d="M9 9h6" />
          <path d="M9 12.5h6" />
          <path d="M9 16h4" />
        </IconFrame>
      );
    case 'boss-feedback':
      return (
        <IconFrame className={className}>
          <path d="M7 18.5h8.5A2.5 2.5 0 0 0 18 16V8A2.5 2.5 0 0 0 15.5 5.5h-7A2.5 2.5 0 0 0 6 8v8.5Z" />
          <path d="M8.5 10h7" />
          <path d="M8.5 13.5h5.5" />
          <path d="M9 18.5 6 21v-2.5" />
        </IconFrame>
      );
    case 'mail-tracker':
      return (
        <IconFrame className={className}>
          <rect x="4.5" y="6.5" width="15" height="11" rx="2.5" />
          <path d="m6.5 8.5 5.5 4 5.5-4" />
        </IconFrame>
      );
    case 'remember':
      return (
        <IconFrame className={className}>
          <path d="M8 6.5A2.5 2.5 0 0 1 10.5 4h3A2.5 2.5 0 0 1 16 6.5V20l-4-2.5L8 20Z" />
        </IconFrame>
      );
    case 'categories':
      return (
        <IconFrame className={className}>
          <path d="M6.5 7.5h5l6 6a1.8 1.8 0 0 1 0 2.5l-1.5 1.5a1.8 1.8 0 0 1-2.5 0l-6-6v-5Z" />
          <circle cx="9" cy="9" r="1" />
        </IconFrame>
      );
    case 'materials':
      return (
        <IconFrame className={className}>
          <path d="M6 7.5A2.5 2.5 0 0 1 8.5 5H18v14h-9.5A2.5 2.5 0 0 0 6 21.5Z" />
          <path d="M6 7.5v11" />
          <path d="M9.5 9.5H15" />
          <path d="M9.5 13H15" />
        </IconFrame>
      );
    case 'review':
      return (
        <IconFrame className={className}>
          <path d="M7 18.5h8.5A2.5 2.5 0 0 0 18 16V8A2.5 2.5 0 0 0 15.5 5.5h-7A2.5 2.5 0 0 0 6 8v8.5Z" />
          <path d="M9 10.5h6" />
          <path d="M9 14h6" />
          <path d="m8.5 18.5-2.5 2v-2" />
        </IconFrame>
      );
    case 'settings':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 5.5v1.5" />
          <path d="M12 17v1.5" />
          <path d="M18.5 12H17" />
          <path d="M7 12H5.5" />
          <path d="m16.6 7.4-1 1" />
          <path d="m8.4 15.6-1 1" />
          <path d="m16.6 16.6-1-1" />
          <path d="m8.4 8.4-1-1" />
        </IconFrame>
      );
    case 'logout':
      return (
        <IconFrame className={className}>
          <path d="M10 6H7.5A2.5 2.5 0 0 0 5 8.5v7A2.5 2.5 0 0 0 7.5 18H10" />
          <path d="M13 8.5 16.5 12 13 15.5" />
          <path d="M9 12h7.5" />
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
    case 'user':
      return (
        <IconFrame className={className}>
          <circle cx="12" cy="8.5" r="3.25" />
          <path d="M5.5 18.5a6.5 6.5 0 0 1 13 0" />
        </IconFrame>
      );
  }
}
