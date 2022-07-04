/** @jsx figma.widget.h */

import { once, showUI } from '@create-figma-plugin/utilities'

const { widget } = figma
const { AutoLayout, Text, useSyncedState, usePropertyMenu, Fragment, Rectangle } = widget
import { Root } from 'remark-parse/lib'
import type { Content } from 'mdast'
import produce from "immer"

// tailwind colors
const gray = {
  900: '#0f172a',
  700: '#334155',
  500: '#64748b',
  300: '#cbd5e1',
  100: '#f3f4f6',
}

const shadows: WidgetJSX.Effect[] = [
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

export default function () {
  widget.register(Notepad)
}

function Notepad() {
  const [data, setData] = useSyncedState<Root | null>('data', null)
  const [inspect, setInspect] = useSyncedState('inspect', '')
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
        showUI({ width: 300, height: 400 }, { data })
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

  if (!data || data.children.length === 0) {
    return <AutoLayout
      width={360}
      direction='horizontal'
      horizontalAlignItems='start'
      verticalAlignItems='center'
      height='hug-contents'
      padding={32}
      cornerRadius={8}
      fill='#FFFFFF'
      spacing={12}
      effect={shadows}
    >
      <Text fill={gray[500]}>Empty note</Text>
    </AutoLayout>
  }
  return (
    <AutoLayout
      width={360}
      direction='horizontal'
      horizontalAlignItems='center'
      verticalAlignItems='center'
      height='hug-contents'
      padding={32}
      cornerRadius={8}
      fill='#FFFFFF'
      spacing={12}
      effect={shadows}
    >
      <AutoLayout
        width='fill-parent'
        direction='vertical'
        horizontalAlignItems='start'
        verticalAlignItems='start'
        spacing={12}
      >
        {data && data.children.map((child, pos) => {
          return render(child, setData, [pos])
        })}
        {/* <AutoLayout
          direction='vertical'
          horizontalAlignItems='start'
          verticalAlignItems='start'
        >
          {inspect.split('\n').map((line, i) => {
            return line ? (
              <Text fontSize={8} fill={gray[500]} horizontalAlignText='left' width={200} key={i}>
                {line}
              </Text>
            ) : null
          })}
        </AutoLayout> */}
      </AutoLayout>
    </AutoLayout>
  )
}

type Updater = ReturnType<typeof useSyncedState<Root | null>>[1]

const render = (root: Content, updater: Updater, pos: number[]) => {
  if (root.type === 'text') return root.value
  if (root.type === 'inlineCode') return root.value

  if (root.type === 'strong' && root.children[0].type === 'text') return root.children[0].value
  if (root.type === 'delete' && root.children[0].type === 'text') return root.children[0].value
  if (root.type === 'link' && root.children[0].type === 'text') return root.children[0].value

  if (root.type === "heading") {
    const fontSize = {
      1: 24,
      2: 20,
      3: 18,
      4: 16,
      5: 16,
      6: 16
    }[root.depth]
    return <Fragment key={pos.join('.')}>
      <Text fontSize={fontSize} width='fill-parent' fill={gray[900]} fontWeight={600}>
        {root.children.map((child, i) => {
          return render(child, updater, [...pos, i])
        })}
      </Text>
    </Fragment>
  }

  if (root.type === 'paragraph') {
    const child = root.children[0];
    if (child && child.type === 'image') {
      return <Text fontSize={12} lineHeight="150%" fill={gray[700]} width='fill-parent' key={pos.join('.')}>
        Image is not supported.({child.alt || ''})
      </Text>
    }

    if (root.children.length === 1 && child.type === 'link') {
      // console.log(child)
      const href = child.url
      return <Text href={href} fontSize={14} lineHeight="150%" fill={gray[700]} textDecoration='underline' width='fill-parent' key={pos.join('.')}>
        {child.children[0].type === 'text' ? child.children[0].value : ''}
      </Text>
    }

    return <Text fontSize={14} lineHeight="150%" fill={gray[700]} width='fill-parent' key={pos.join('.')}>
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </Text>
  }

  if (root.type === "html") {
    return <Text fontSize={14} fill={gray[700]} width='fill-parent' key={pos.join('.')}>{root.value}</Text>
  }

  if (root.type === 'list') {
    const ordered = root.ordered;
    let counter = 0;
    return <AutoLayout
      direction='vertical'
      horizontalAlignItems='start'
      verticalAlignItems='start'
      width='fill-parent'
      key={pos.join('.')}
    >
      {root.children.map((item, i) => {
        if (item.type !== "listItem") return null
        const checked = item.checked
        const itemPos = [...pos, i]
        counter++

        return <Fragment key={itemPos.join('.')}>
          {item.children.map((child, j) => {
            if (child.type === "paragraph") {
              return <AutoLayout
                key={[...itemPos, j].join('.')}
                hoverStyle={{ fill: gray[100] }}
                verticalAlignItems="center"
                spacing={8}
                padding={{ vertical: 4, left: (pos.length - 1) * 12 }}
                onClick={checked !== null ? () => {
                  updater(prev => produce(prev, (draft) => {
                    if (!draft) return
                    // @ts-ignore
                    const target: Content = itemPos.reduce((prevValue, currentPos) => {
                      // console.log(prevValue, currentPos)
                      if (prevValue.children) {
                        const next = prevValue.children[currentPos]
                        return next
                      }
                      return prevValue
                    }, draft)
                    if (target.type === 'listItem') target.checked = !target.checked
                  }))

                } : undefined}
                width='fill-parent'
              >
                {ordered && checked === null && <Text fontSize={16} fill={gray[500]}>{counter}.</Text>}
                {!ordered && checked === null && <Text fontSize={16} fill={gray[500]}>・</Text>}
                {checked && <Text fontSize={16} fill="#ff0000">✅</Text>}
                {checked === false && <Text fontSize={16} fill="#ff0000">☑</Text>}
                {render(child, updater, [...itemPos, j])}
              </AutoLayout>
            } else if (child.type === 'list') {
              return <AutoLayout
                direction='vertical'
                horizontalAlignItems='start'
                verticalAlignItems='start'
                width='fill-parent'
                key={[...itemPos, j].join('.')}
              >
                {render(child, updater, [...itemPos, j])}
              </AutoLayout>
            }
          })}
        </Fragment>
      })}
    </AutoLayout>
  }

  if (root.type === "thematicBreak") {
    return <AutoLayout padding={{ vertical: 12 }} width='fill-parent' key={pos.join('.')}>
      <Rectangle key={pos.join('.')} width='fill-parent' height={1} fill={gray[300]} />
    </AutoLayout>
  }

  if (root.type === "code") {
    return <AutoLayout padding={12} fill="#f5f5f5" width="fill-parent" key={pos.join('.')}>
      <Text fontSize={12}>
        {root.value}
      </Text>
    </AutoLayout>
  }

  if (root.type === "blockquote") {
    return <AutoLayout spacing={8} width="fill-parent" key={pos.join('.')}>
      <Rectangle fill={'#ddd'} width={2} height="fill-parent" />
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </AutoLayout>
  }

  if (root.type === 'table') {
    return <Text fontSize={12} key={pos.join('.')}>Table is not yet supported.</Text>
  }

  if (root.type === 'image') {
    return <Text fontSize={12} key={pos.join('.')}>Image is not yet supported.</Text>
  }

  if ("children" in root) {
    return <Fragment key={pos.join('.')}>
      {root.children.map((child, i) => {
        return render(child, updater, [...pos, i])
      })}
    </Fragment>
  }

  if ("value" in root) {
    return root.value
  }

  return <Text fontSize={12}>{root.type} is not supported.</Text>
}