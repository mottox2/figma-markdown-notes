/** @jsx figma.widget.h */

import type { Heading, Paragraph, Text as MdastText, InlineCode, Strong, Emphasis, Delete, Link, HTML } from 'mdast'
import { colors, typography } from '../constants'
import type { RenderContext } from '../types'

const { widget } = figma
const { Text, Span, Fragment } = widget

export function renderText(node: MdastText): string {
  return node.value
}

export function renderInlineCode(node: InlineCode): any {
  return (
    <Span fontFamily={typography.inlineCode.fontFamily}>
      {node.value}
    </Span>
  )
}

export function renderStrong(node: Strong): any {
  if (node.children[0]?.type === 'text') {
    return (
      <Span fontWeight={700}>
        {node.children[0].value}
      </Span>
    )
  }
  return null
}

export function renderEmphasis(node: Emphasis): any {
  if (node.children[0]?.type === 'text') {
    return (
      <Span italic>
        {node.children[0].value}
      </Span>
    )
  }
  return null
}

export function renderDelete(node: Delete): any {
  if (node.children[0]?.type === 'text') {
    return (
      <Span textDecoration='strikethrough'>
        {node.children[0].value}
      </Span>
    )
  }
  return null
}

export function renderLink(node: Link, context: RenderContext): any {
  if (node.children[0]?.type === 'text') {
    return (
      <Span 
        href={node.url} 
        fontSize={typography.body.fontSize} 
        fill={colors.link} 
        textDecoration='underline'
        key={context.position.join('.')}
      >
        {node.children[0].value}
      </Span>
    )
  }
  return null
}

export function renderHeading(node: Heading, context: RenderContext, renderChild: Function): any {
  const headingStyle = typography.heading[node.depth as keyof typeof typography.heading]
  
  return (
    <Fragment key={context.position.join('.')}>
      <Text 
        fontSize={headingStyle.fontSize} 
        width='fill-parent' 
        fill={colors.gray[900]} 
        fontWeight={headingStyle.fontWeight}
      >
        {node.children.map((child, i) => {
          return renderChild(child, {
            ...context,
            position: [...context.position, i]
          })
        })}
      </Text>
    </Fragment>
  )
}

export function renderParagraph(node: Paragraph, context: RenderContext, renderChild: Function): any {
  const firstChild = node.children[0]

  // Handle images in paragraphs
  if (firstChild?.type === 'image') {
    return (
      <Text 
        fontSize={typography.small.fontSize} 
        lineHeight={typography.small.lineHeight} 
        fill={colors.gray[700]} 
        width='fill-parent' 
        key={context.position.join('.')}
      >
        Image is not supported.({firstChild.alt || ''})
      </Text>
    )
  }

  return (
    <Text 
      fontSize={typography.body.fontSize} 
      lineHeight={typography.body.lineHeight} 
      fill={colors.gray[700]} 
      width='fill-parent' 
      key={context.position.join('.')}
    >
      {node.children.map((child, i) => {
        return renderChild(child, {
          ...context,
          position: [...context.position, i]
        })
      })}
    </Text>
  )
}

export function renderHTML(node: HTML, context: RenderContext): any {
  return (
    <Text 
      fontSize={typography.body.fontSize} 
      fill={colors.gray[700]} 
      width='fill-parent' 
      key={context.position.join('.')}
    >
      {node.value}
    </Text>
  )
}