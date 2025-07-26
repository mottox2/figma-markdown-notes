import type { Content } from 'mdast'
import type { Root } from 'remark-parse/lib'

// Type definitions for the widget

export type Updater = (updater: (prev: Root | null) => Root | null) => void

export interface RenderContext {
  updater: Updater
  position: number[]
}

export interface WidgetSize {
  width: number
}

// Component props interfaces
export interface BaseMarkdownProps {
  node: Content
  context: RenderContext
}

export interface ContainerProps {
  width: number | 'fill-parent'
  children: any
}

export interface ListItemState {
  checked: boolean | null
  counter: number
  depth: number
}

// Utility type for position tracking
export type Position = number[]