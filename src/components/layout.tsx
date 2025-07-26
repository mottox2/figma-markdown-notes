/** @jsx figma.widget.h */

import { colors, shadows, spacing } from '../constants'

const { widget } = figma
const { AutoLayout, Text, Rectangle } = widget

// Reusable layout components

export function NoteContainer({ 
  width, 
  children 
}: { 
  width: number; 
  children: any
}) {
  return (
    <AutoLayout
      width={width}
      direction='horizontal'
      horizontalAlignItems='center'
      verticalAlignItems='center'
      height='hug-contents'
      padding={spacing.xxl}
      cornerRadius={8}
      fill={colors.white}
      spacing={spacing.md}
      effect={shadows}
    >
      <AutoLayout
        width='fill-parent'
        direction='vertical'
        horizontalAlignItems='start'
        verticalAlignItems='start'
        spacing={spacing.md}
      >
        {children}
      </AutoLayout>
    </AutoLayout>
  )
}

export function EmptyState({ width }: { width: number }) {
  return (
    <AutoLayout
      width={width}
      direction='horizontal'
      horizontalAlignItems='start'
      verticalAlignItems='center'
      height='hug-contents'
      padding={spacing.xxl}
      cornerRadius={8}
      fill={colors.white}
      spacing={spacing.md}
      effect={shadows}
    >
      <Text fill={colors.gray[500]}>Empty note</Text>
    </AutoLayout>
  )
}

export function VerticalContainer({ 
  children, 
  width = 'fill-parent',
  spacing: spacingProp = spacing.md
}: { 
  children: any
  width?: number | 'fill-parent'
  spacing?: number
}) {
  return (
    <AutoLayout
      direction='vertical'
      horizontalAlignItems='start'
      verticalAlignItems='start'
      width={width}
      spacing={spacingProp}
    >
      {children}
    </AutoLayout>
  )
}

export function HorizontalRule() {
  return (
    <AutoLayout padding={{ vertical: spacing.md }} width='fill-parent'>
      <Rectangle width='fill-parent' height={1} fill={colors.gray[300]} />
    </AutoLayout>
  )
}