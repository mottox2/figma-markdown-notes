/** @jsx figma.widget.h */

import type { Content } from 'mdast'
import { typography } from '../constants'
import type { RenderContext } from '../types'

// Import all element renderers
import { 
  renderText, 
  renderInlineCode, 
  renderStrong, 
  renderEmphasis, 
  renderDelete, 
  renderLink, 
  renderHeading, 
  renderParagraph, 
  renderHTML 
} from './text-elements'

import { 
  renderCode, 
  renderBlockquote, 
  renderThematicBreak, 
  renderTable, 
  renderImage 
} from './block-elements'

import { renderList } from './list-elements'

const { widget } = figma
const { Fragment, Text } = widget

/**
 * Main markdown renderer function that delegates to specific element renderers
 * @param node - The MDAST node to render
 * @param context - Rendering context with updater and position
 * @returns Rendered Figma widget element
 */
export function renderMarkdownNode(node: Content, context: RenderContext): any {
  // Handle text nodes
  if (node.type === 'text') {
    return renderText(node)
  }

  // Handle inline formatting
  if (node.type === 'inlineCode') {
    return renderInlineCode(node)
  }

  if (node.type === 'strong') {
    return renderStrong(node)
  }

  if (node.type === 'emphasis') {
    return renderEmphasis(node)
  }

  if (node.type === 'delete') {
    return renderDelete(node)
  }

  if (node.type === 'link') {
    return renderLink(node, context)
  }

  // Handle block elements
  if (node.type === 'heading') {
    return renderHeading(node, context, renderMarkdownNode)
  }

  if (node.type === 'paragraph') {
    return renderParagraph(node, context, renderMarkdownNode)
  }

  if (node.type === 'html') {
    return renderHTML(node, context)
  }

  if (node.type === 'code') {
    return renderCode(node, context)
  }

  if (node.type === 'blockquote') {
    return renderBlockquote(node, context, renderMarkdownNode)
  }

  if (node.type === 'thematicBreak') {
    return renderThematicBreak(context)
  }

  if (node.type === 'list') {
    return renderList(node, context, renderMarkdownNode)
  }

  // Handle unsupported elements
  if (node.type === 'table') {
    return renderTable(context)
  }

  if (node.type === 'image') {
    return renderImage(context)
  }

  // Handle nodes with children (fallback)
  if ('children' in node) {
    return (
      <Fragment key={context.position.join('.')}>
        {node.children.map((child, i) => {
          return renderMarkdownNode(child, {
            ...context,
            position: [...context.position, i]
          })
        })}
      </Fragment>
    )
  }

  // Handle nodes with value (fallback)
  if ('value' in node) {
    return node.value
  }

  // Fallback for completely unsupported node types
  return (
    <Text fontSize={typography.small.fontSize}>
      {node.type} is not supported.
    </Text>
  )
}