/** @jsx figma.widget.h */

import type { List, ListItem } from 'mdast'
import produce from 'immer'
import { colors, typography, spacing, listConfig } from '../constants'
import type { RenderContext, Position } from '../types'
import type { Content } from 'mdast'

const { widget } = figma
const { AutoLayout, Text, Fragment } = widget

function createListItemClickHandler(
  updater: RenderContext['updater'], 
  itemPosition: Position
) {
  return () => {
    updater(prev => produce(prev, (draft) => {
      if (!draft) return
      
      // Navigate to the target list item using the position array
      const target: Content = itemPosition.reduce((prevValue, currentPos) => {
        if (prevValue && 'children' in prevValue) {
          return prevValue.children[currentPos]
        }
        return prevValue
      }, draft as any)
      
      if (target?.type === 'listItem') {
        target.checked = !target.checked
      }
    }))
  }
}

function renderListMarker(
  isOrdered: boolean, 
  checked: boolean | null, 
  counter: number
): any {
  const paddingTop = checked !== null ? listConfig.padding.checkbox : 
                   (isOrdered ? listConfig.padding.ordered : listConfig.padding.unordered)

  return (
    <AutoLayout padding={{ top: paddingTop }}>
      {isOrdered && checked === null && (
        <Text 
          fontSize={typography.body.fontSize} 
          fill={colors.gray[400]} 
          width={listConfig.counterWidth} 
          horizontalAlignText='right'
        >
          {counter}.
        </Text>
      )}
      {!isOrdered && checked === null && (
        <Text 
          fontSize={typography.body.fontSize} 
          fill={colors.gray[400]} 
          width={listConfig.counterWidth} 
          horizontalAlignText="right"
        >
          *
        </Text>
      )}
      {checked && (
        <Text 
          fontSize={listConfig.checkboxSize} 
          fill={colors.checkbox.checked}
        >
          ✅
        </Text>
      )}
      {checked === false && (
        <Text 
          fontSize={listConfig.checkboxSize} 
          fill={colors.checkbox.unchecked}
        >
          ☑
        </Text>
      )}
    </AutoLayout>
  )
}

function renderListItemContent(
  item: ListItem, 
  context: RenderContext, 
  itemPosition: Position,
  counter: number,
  isOrdered: boolean,
  renderChild: Function
): any {
  const checked = item.checked ?? null

  return (
    <Fragment key={itemPosition.join('.')}>
      {item.children.map((child, j) => {
        if (child.type === "paragraph") {
          return (
            <AutoLayout
              key={[...itemPosition, j].join('.')}
              hoverStyle={{ fill: colors.gray[100] }}
              spacing={spacing.sm}
              padding={{ 
                vertical: spacing.xs, 
                left: (context.position.length - 1) * listConfig.indentMultiplier 
              }}
              onClick={checked !== null ? createListItemClickHandler(context.updater, itemPosition) : undefined}
              width='fill-parent'
            >
              {renderListMarker(isOrdered, checked, counter)}
              {renderChild(child, {
                ...context,
                position: [...itemPosition, j]
              })}
            </AutoLayout>
          )
        } else if (child.type === 'list') {
          return (
            <AutoLayout
              direction='vertical'
              horizontalAlignItems='start'
              verticalAlignItems='start'
              width='fill-parent'
              key={[...itemPosition, j].join('.')}
            >
              {renderChild(child, {
                ...context,
                position: [...itemPosition, j]
              })}
            </AutoLayout>
          )
        }
        return null
      })}
    </Fragment>
  )
}

export function renderList(node: List, context: RenderContext, renderChild: Function): any {
  const isOrdered = !!node.ordered
  let counter = 0

  return (
    <AutoLayout
      direction='vertical'
      horizontalAlignItems='start'
      verticalAlignItems='start'
      width='fill-parent'
      key={context.position.join('.')}
    >
      {node.children.map((item, i) => {
        if (item.type !== "listItem") return null
        
        const itemPosition = [...context.position, i]
        counter++

        return renderListItemContent(
          item, 
          context, 
          itemPosition, 
          counter, 
          isOrdered, 
          renderChild
        )
      })}
    </AutoLayout>
  )
}