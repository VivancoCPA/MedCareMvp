# Spec: Design System — MedFamilyCare

## Source

Tokens derived from DESIGN-airtable.md (Airtable marketing design system).
**Rule:** Apply visual tokens only. Ignore all marketing components
(hero-band, signature-cards, pricing-cards, logo-strip, top-nav).
This is a management app, not a marketing site.

## Visual Philosophy

- White canvas, no gradients, no decorative shadows
- Whitespace as primary design tool
- Near-black primary button (never colorful CTAs)
- Typography-driven hierarchy: bigger before bolder

## CSS Custom Properties (globals.css)

```css
:root {
  /* Colors — Light mode */
  --color-ink: #1d2432;
  --color-ink-secondary: #4b5563;
  --color-canvas: #ffffff;
  --color-surface: #f8f9fb;
  --color-surface-dark: #181d26;
  --color-border: #e5e7eb;
  --color-primary: #1d2432;
  --color-primary-active: #0d1218;
  --color-on-primary: #ffffff;
  --color-link: #1b61c9;
  --color-destructive: #dc2626;
  --color-success: #16a34a;
  --color-warning: #d97706;

  /* Typography */
  --font-sans: "Inter", "Helvetica Neue", Arial, sans-serif;
  --font-display: "Inter Display", "Inter", sans-serif;

  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-lg: 1.125rem; /* 18px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */

  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Spacing */
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */

  /* Border Radius */
  --rounded-xs: 0.125rem; /* 2px  — system/legal surfaces */
  --rounded-sm: 0.25rem; /* 4px */
  --rounded-md: 0.375rem; /* 6px  — cards, thumbnails */
  --rounded-lg: 0.75rem; /* 12px — buttons, inputs */
  --rounded-xl: 1rem; /* 16px — modals, panels */
  --rounded-full: 9999px; /* avatars, pills */

  /* Shadows — minimal, functional only */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.07);

  /* Layout */
  --sidebar-width: 240px;
  --topbar-height: 64px;
  --content-max-width: 1280px;
  --content-padding-desktop: var(--space-6);
  --content-padding-mobile: var(--space-4);
}

/* Dark mode */
.dark {
  --color-ink: #f1f5f9;
  --color-ink-secondary: #94a3b8;
  --color-canvas: #0f1117;
  --color-surface: #181d26;
  --color-surface-dark: #0a0d13;
  --color-border: #1e2535;
  --color-primary: #f1f5f9;
  --color-primary-active: #ffffff;
  --color-on-primary: #0f1117;
  --color-link: #60a5fa;
}
```

## Tailwind Config Mapping

Tailwind tokens should map to CSS variables so components use
`bg-canvas`, `text-ink`, `border-border`, etc.:

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      ink: 'var(--color-ink)',
      'ink-secondary': 'var(--color-ink-secondary)',
      canvas: 'var(--color-canvas)',
      surface: 'var(--color-surface)',
      'surface-dark': 'var(--color-surface-dark)',
      border: 'var(--color-border)',
      primary: 'var(--color-primary)',
      'on-primary': 'var(--color-on-primary)',
      link: 'var(--color-link)',
      destructive: 'var(--color-destructive)',
      success: 'var(--color-success)',
      warning: 'var(--color-warning)',
    },
    fontFamily: {
      sans: 'var(--font-sans)',
    },
    borderRadius: {
      xs: 'var(--rounded-xs)',
      sm: 'var(--rounded-sm)',
      md: 'var(--rounded-md)',
      lg: 'var(--rounded-lg)',
      xl: 'var(--rounded-xl)',
      full: 'var(--rounded-full)',
    },
  }
}
```

## Component Patterns

### Button Primary

- bg-primary text-on-primary, padding 16px×24px, rounded-lg
- Active: bg-primary-active
- One per viewport maximum

### Button Secondary

- bg-canvas text-ink, 1px border-border, rounded-lg
- Used alongside button-primary as the "less committed" option

### Input

- Height 44px, rounded-lg, border-border
- Focus: ring-1 ring-primary

### Sidebar

- bg-surface-dark, width var(--sidebar-width)
- Collapses to icon-only on tablet, drawer on mobile

### TopBar

- bg-canvas, height var(--topbar-height), border-b border-border

### Card

- bg-canvas, rounded-xl, shadow-sm, border border-border

## Responsive Breakpoints

| Breakpoint | Width      | Behavior                                                          |
| ---------- | ---------- | ----------------------------------------------------------------- |
| Mobile     | < 768px    | Sidebar → drawer, full-width content, horizontal scroll on tables |
| Tablet     | 768–1024px | Sidebar icon-only, 2-col grids                                    |
| Desktop    | > 1024px   | Full sidebar 240px, full grids, max 1280px content                |

## What NOT to use from the source design system

- hero-band, signature-coral-card, logo-strip
- pricing-card, button-pricing-pill
- feature-card-tabbed (marketing variant)
- top-nav (marketing site navigation)
- Any component labeled "marketing" or "landing"
