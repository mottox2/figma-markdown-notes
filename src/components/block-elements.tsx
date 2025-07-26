/** @jsx figma.widget.h */

import type { Code, Blockquote } from 'mdast'
import { colors, typography, spacing } from '../constants'
import type { RenderContext } from '../types'
import { HorizontalRule } from './layout'

const { widget } = figma
const { AutoLayout, Text, Rectangle } = widget

export function renderCode(node: Code, context: RenderContext): any {
  return (
    <AutoLayout 
      padding={spacing.md} 
      fill={colors.code} 
      width="fill-parent" 
      key={context.position.join('.')}
    >
      <Text 
        fontSize={typography.code.fontSize} 
        fontFamily={typography.code.fontFamily}
      >
        {node.value}
      </Text>
    </AutoLayout>
  )
}

export function renderBlockquote(node: Blockquote, context: RenderContext, renderChild: Function): any {
  return (
    <AutoLayout 
      spacing={spacing.sm} 
      width="fill-parent" 
      key={context.position.join('.')}
    >
      <Rectangle fill={colors.quote} width={2} height="fill-parent" />
      {node.children.map((child, i) => {
        return renderChild(child, {
          ...context,
          position: [...context.position, i]
        })
      })}
    </AutoLayout>
  )
}

export function renderThematicBreak(context: RenderContext): any {
  return <HorizontalRule key={context.position.join('.')} />
}

export function renderTable(context: RenderContext): any {
  return (
    <Text fontSize={typography.small.fontSize} key={context.position.join('.')}>
      Table is not yet supported.
    </Text>
  )
}

export function renderImage(context: RenderContext): any {
  return (
    <Text fontSize={typography.small.fontSize} key={context.position.join('.')}>
      Image is not yet supported.
    </Text>
  )
}