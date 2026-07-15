/**
 * tailwind.config.js — MedFamilyCare
 * ------------------------------------------------------------------
 * FIX: alias de compatibilidad con Shadcn/ui
 *
 * El CLI de Shadcn/ui genera componentes (Input, Select, Button, Dialog,
 * Card, etc.) que usan un set fijo de nombres de color por convención:
 * background, foreground, border, input, ring, primary, secondary,
 * muted, accent, destructive, popover, card — cada uno con su variante
 * "-foreground" para el texto que va encima.
 *
 * Nuestro design system (sección 8.2/8.3 de 05-especificaciones-tecnicas-
 * frontend.md) define sus propios nombres de token: canvas, ink, body,
 * hairline, surface-soft, etc. Esos dos vocabularios nunca se conectaron,
 * por eso los componentes ui/*.tsx (sin tocar, como exige el ADR-001)
 * renderizaban con clases (bg-background, text-foreground, border-input,
 * ring-ring) que Tailwind no sabía resolver — el navegador las ignoraba
 * y el elemento heredaba color del padre, dando el efecto "texto invisible
 * sobre el mismo fondo".
 *
 * La solución: declarar TODOS los alias que Shadcn espera, apuntando
 * cada uno al token real de nuestro sistema. Así los componentes
 * ui/*.tsx siguen sin tocarse (regla del ADR-001) y heredan automáticamente
 * cualquier ajuste futuro de paleta vía variables CSS.
 * ------------------------------------------------------------------
 */

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Tokens propios del design system (ya existentes) ──────────
        primary: {
          DEFAULT: 'var(--color-primary)',
          active: 'var(--color-primary-active)',
          foreground: 'var(--color-on-primary)',
        },
        ink: 'var(--color-ink)',
        body: 'var(--color-body)',
        muted: {
          DEFAULT: 'var(--color-muted)',
          // Shadcn usa muted-foreground para placeholders e ítems secundarios
          foreground: 'var(--color-muted)',
        },
        canvas: 'var(--color-canvas)',
        'surface-soft': 'var(--color-surface-soft)',
        'surface-strong': 'var(--color-surface-strong)',
        'surface-dark': 'var(--color-surface-dark)',
        hairline: 'var(--color-hairline)',
        'border-strong': 'var(--color-border-strong)',
        link: {
          DEFAULT: 'var(--color-link)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          border: 'var(--color-success-border)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          border: 'var(--color-info-border)',
        },
        coral: 'var(--color-signature-coral)',
        mint: 'var(--color-signature-mint)',
        peach: 'var(--color-signature-peach)',
        cream: 'var(--color-signature-cream)',
        forest: 'var(--color-signature-forest)',

        // Sidebar — fondo/texto fijos, no cambian con el tema (ver globals.css)
        sidebar: {
          DEFAULT: 'var(--color-sidebar-bg)',
          foreground: 'var(--color-sidebar-text)',
          active: 'var(--color-sidebar-item-active)',
          hover: 'var(--color-sidebar-item-hover)',
          border: 'var(--color-sidebar-item-border)',
        },

        // ── Alias de compatibilidad con Shadcn/ui ──────────────────────
        // Cada nombre de la izquierda es lo que los componentes ui/*.tsx
        // usan por convención (bg-background, text-foreground, etc.).
        // Cada valor de la derecha apunta a NUESTRO token real.
        background: 'var(--color-canvas)',
        foreground: 'var(--color-ink)',

        border: 'var(--color-hairline)',
        input: 'var(--color-hairline)',       // borde de inputs (Input, Select, Textarea)
        ring: 'var(--color-info-border)',     // anillo de focus

        card: {
          DEFAULT: 'var(--color-canvas)',
          foreground: 'var(--color-ink)',
        },
        popover: {
          DEFAULT: 'var(--color-canvas)',
          foreground: 'var(--color-ink)',
        },
        secondary: {
          DEFAULT: 'var(--color-surface-soft)',
          foreground: 'var(--color-ink)',
        },
        accent: {
          DEFAULT: 'var(--color-surface-soft)',
          foreground: 'var(--color-ink)',
        },
        destructive: {
          DEFAULT: 'var(--color-signature-coral)',
          foreground: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        // Alias que Shadcn espera (algunos componentes usan rounded-md
        // calculado a partir de --radius con calc()). Lo fijamos directo
        // a nuestro token para evitar otra variable CSS duplicada.
        DEFAULT: 'var(--radius-sm)',
      },
    },
  },
  plugins: [],
}

