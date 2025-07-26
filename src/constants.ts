// Design tokens and configuration constants

// Tailwind-inspired color palette
export const colors = {
  gray: {
    900: '#0f172a',
    700: '#334155',
    500: '#64748b',
    400: '#9ca3af',
    300: '#cbd5e1',
    100: '#f3f4f6',
  },
  white: '#FFFFFF',
  code: '#f5f5f5',
  quote: '#ddd',
  link: '#334155',
  checkbox: {
    checked: '#ff0000',
    unchecked: '#ff0000',
  }
} as const

// Typography scale
export const typography = {
  heading: {
    1: { fontSize: 24, fontWeight: 600 },
    2: { fontSize: 20, fontWeight: 600 },
    3: { fontSize: 18, fontWeight: 600 },
    4: { fontSize: 16, fontWeight: 600 },
    5: { fontSize: 16, fontWeight: 600 },
    6: { fontSize: 16, fontWeight: 600 },
  },
  body: {
    fontSize: 14,
    lineHeight: '150%',
  },
  small: {
    fontSize: 12,
    lineHeight: '150%',
  },
  code: {
    fontSize: 12,
    fontFamily: 'Source Code Pro',
  },
  inlineCode: {
    fontFamily: 'Source Code Pro',
  }
} as const

// Layout and spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const

export const sizes = {
  small: 360,
  medium: 540,
  large: 720,
} as const

// Widget effects
export const shadows: WidgetJSX.Effect[] = [
  {
    type: 'drop-shadow',
    color: { r: 0, g: 0, b: 0, a: 0.09 },
    blur: 2,
    offset: { x: 0, y: 2 }
  },
  {
    type: 'drop-shadow',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    blur: 1,
    offset: { x: 0, y: 1 }
  },
  {
    type: 'drop-shadow',
    color: { r: 0, g: 0, b: 0, a: 0.1 },
    blur: 0,
    offset: { x: 0, y: 0 }
  }
]

// Icons
export const icons = {
  scale: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18 17.625V18H6V6H9.75V6.75H6.75V17.25H17.25V14.25H18V17.625ZM10.125 14.25H9.75V9.75H10.5V12.9697L16.7197 6.75H13.5V6H18V10.5H17.25V7.28033L11.0303 13.5H14.25V14.25H10.125Z" fill="white"/>
</svg>`
} as const

// List styling configuration
export const listConfig = {
  counterWidth: 16,
  checkboxSize: 16,
  indentMultiplier: 12,
  padding: {
    checkbox: 3,
    ordered: 2,
    unordered: 4,
  }
} as const