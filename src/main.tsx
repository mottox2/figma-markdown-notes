/** @jsx figma.widget.h */

import { once, showUI } from '@create-figma-plugin/utilities'

const { widget } = figma
const { AutoLayout, Text, useSyncedState, usePropertyMenu, Fragment, Rectangle } = widget
import { Root } from 'remark-parse/lib'
import type { Content } from 'mdast'
import produce from "immer"

const defaultText = '# Hello World\nThis is figma widget\n- [ ] My Task\n- [x] done task'

export default function () {
  widget.register(Notepad)
}

function Notepad () {
  const [text, setText] = useSyncedState('text', defaultText)
  const [data, setData] = useSyncedState<Root | null>('data', null)
  const [inspect, setInspect] = useSyncedState('inspect', '[]')
  const items: Array<WidgetPropertyMenuItem> = [
    {
      itemType: 'action',
      propertyName: 'edit',
      tooltip: 'Edit'
    }
  ]
  async function onChange ({
    propertyName
  }: WidgetPropertyEvent): Promise<void> {
    await new Promise<void>(function (resolve: () => void): void {
      if (propertyName === 'edit') {
        showUI({ width: 240, height: 400 }, { text })
        once('UPDATE_TEXT', function (text: string): void {
          setText(text)
        })
        once('UPDATE_DATA', function (data: any): void {
          console.log('ast:', data.ast)
          setData(data.ast)
          setInspect(data.inspect)
          resolve()
        })
      }
    })
  }

  usePropertyMenu(items, onChange)
  return (
    <AutoLayout
      direction='horizontal'
      horizontalAlignItems='center'
      verticalAlignItems='center'
      height='hug-contents'
      padding={16}
      fill='#FFFFFF'
      spacing={12}
      effect={{
        type: 'drop-shadow',
        color: { r: 0, g: 0, b: 0, a: 0.2 },
        offset: { x: 0, y: 0 },
        blur: 2,
        spread: 2
      }}
    >
      <AutoLayout
        direction='vertical'
        horizontalAlignItems='start'
        verticalAlignItems='start'
        spacing={8}
      >
        {data && data.children.map((child, pos) => {
          return render(child, setData, [pos])
        })}
        <AutoLayout
          direction='vertical'
          horizontalAlignItems='start'
          verticalAlignItems='start'
        >
          {inspect.split('\n').map((line, i) => {
            return line ? (
              <Text fontSize={8} fill="#888" horizontalAlignText='left' width={200} key={i}>
                {line}
              </Text>
            ) : null
          })}
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

type Updater = ReturnType<typeof useSyncedState<Root | null>>[1]

const render = (root: Content, updater: Updater, pos: number[]) => {
  if (root.type === 'text') return root.value

  if (root.type === "heading") {
    const fontSize = {
      1: 36,
      2: 28,
      3: 24,
      4: 20,
      5: 18,
      6: 16
    }[root.depth]
    return <Fragment key={pos.join('.')}>
      <Text fontSize={fontSize}>
        {root.children.map((child, i) => {
          return render(child, updater, [...pos, i])
        })}
      </Text>
    </Fragment>
  }

  if (root.type === 'paragraph')
    return <Text fontSize={14} key={pos.join('.')}>
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </Text>

  if (root.type === 'list')
    return <AutoLayout
      direction='vertical'
      horizontalAlignItems='start'
      verticalAlignItems='start'
      width='fill-parent'
      key={pos.join('.')}
    >
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </AutoLayout>

  if (root.type === 'listItem') {
    const checked = root.checked
    console.log(pos, root)
    return <AutoLayout
      key={pos.join('.')}
      hoverStyle={{ fill: "#eeeeee" }}
      spacing={4}
      onClick={() => {
        updater(prev => produce(prev, (draft) => {
          if (!draft) return
          // @ts-ignore
          const target: Content = pos.reduce((prevValue, currentPos) => {
            console.log(prevValue, currentPos)
            if (prevValue.children) {
              const next = prevValue.children[currentPos]
              return next
            }
            return prevValue
          }, draft)
          if (target.type === 'listItem') target.checked = !target.checked
        }))

      }}
      width='fill-parent'
    >
      {checked && <Text fontSize={12} fill="#ff0000">Checked</Text>}
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </AutoLayout>

  }

  if (root.type === "thematicBreak") {
    return <Rectangle key={pos.join('.')} width='fill-parent' height={1} fill='#CCCCCC' />
  }

  return <Fragment key={pos.join('.')}>
    <Text fontSize={12}>{root.type}</Text>
    <Text fontSize={8}>{JSON.stringify(root, null, 2)}</Text>
  </Fragment>
}