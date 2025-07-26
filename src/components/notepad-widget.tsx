/** @jsx figma.widget.h */

import { once, showUI } from '@create-figma-plugin/utilities'
import type { Root } from 'remark-parse/lib'
import { sizes, icons } from '../constants'
import { NoteContainer, EmptyState } from './layout'
import { renderMarkdownNode } from './markdown-renderer'
import type { RenderContext } from '../types'

const { widget } = figma
const { useSyncedState, usePropertyMenu } = widget

export function NotepadWidget() {
  const [data, setData] = useSyncedState<Root | null>('data', null)
  const [, setInspect] = useSyncedState('inspect', '')
  const [size, setSize] = useSyncedState<keyof typeof sizes>('experimental-size', 'small')

  const width = sizes[size]

  // Size toggle functionality
  const toggleSize = () => {
    if (size === 'small') setSize("medium")
    if (size === 'medium') setSize("large")
    if (size === 'large') setSize("small")
  }

  // Property menu configuration
  const menuItems: Array<WidgetPropertyMenuItem> = [
    {
      itemType: 'action',
      propertyName: 'edit',
      tooltip: 'Edit content'
    },
    {
      itemType: 'action',
      icon: icons.scale,
      propertyName: "scale",
      tooltip: "Change size"
    }
  ]

  // Property menu event handler
  async function handlePropertyMenuAction({
    propertyName
  }: WidgetPropertyEvent): Promise<void> {
    if (propertyName === 'scale') {
      return toggleSize()
    }
    
    if (propertyName === 'edit') {
      await new Promise<void>(function (resolve: () => void): void {
        showUI({ width: 320, height: 400 }, { data })
        once('UPDATE_DATA', function (data: any): void {
          console.log('ast:', data.ast)
          setData(data.ast)
          setInspect(data.inspect)
          resolve()
        })
      })
    }
  }

  usePropertyMenu(menuItems, handlePropertyMenuAction)

  // Handle empty state
  if (!data || data.children.length === 0) {
    return <EmptyState width={width} />
  }

  // Create render context
  const renderContext: RenderContext = {
    updater: setData,
    position: []
  }

  // Render the note content
  return (
    <NoteContainer width={width}>
      {data.children.map((child, pos) => {
        return renderMarkdownNode(child, {
          ...renderContext,
          position: [pos]
        })
      })}
    </NoteContainer>
  )
}