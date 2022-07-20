/** @jsx figma.widget.h */

import { on, once, showUI } from '@create-figma-plugin/utilities'

const { widget } = figma
const { AutoLayout, Text, useSyncedState, usePropertyMenu, Fragment, Rectangle, Image, Span } = widget
import { Root } from 'remark-parse/lib'
import type { Content } from 'mdast'
import produce from "immer"

const scaleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M18 17.625V18H6V6H9.75V6.75H6.75V17.25H17.25V14.25H18V17.625ZM10.125 14.25H9.75V9.75H10.5V12.9697L16.7197 6.75H13.5V6H18V10.5H17.25V7.28033L11.0303 13.5H14.25V14.25H10.125Z" fill="white"/>
</svg>`


// tailwind colors
const gray = {
  900: '#0f172a',
  700: '#334155',
  500: '#64748b',
  400: '#9ca3af',
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

const sizes = {
  "small": 360,
  "medium": 540,
  "large": 720
}

function Notepad() {
  const [data, setData] = useSyncedState<Root | null>('data', null)
  const [inspect, setInspect] = useSyncedState('inspect', '')

  const [size, setSize] = useSyncedState<keyof typeof sizes>('experimental-size', 'small')
  const toggleSize = () => {
    if (size === 'small') setSize("medium")
    if (size === 'medium') setSize("large")
    if (size === 'large') setSize("small")
  }
  const width = sizes[size]

  const items: Array<WidgetPropertyMenuItem> = [
    {
      itemType: 'action',
      propertyName: 'edit',
      tooltip: 'Edit content'
    },
    {
      itemType: 'action',
      icon: scaleIcon,
      propertyName: "scale",
      tooltip: "Change size"
    }
  ]

  async function onChange ({
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

  usePropertyMenu(items, onChange)

  if (!data || data.children.length === 0) {
    return <AutoLayout
      width={width}
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
      width={width}
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
  if (root.type === 'inlineCode')
    return <Span fontFamily='Source Code Pro'>{root.value}</Span>

  if (root.type === 'strong' && root.children[0].type === 'text')
    return <Span fontWeight={700}>{root.children[0].value}</Span>
  if (root.type === 'emphasis' && root.children[0].type === 'text')
    return <Span italic>{root.children[0].value}</Span>
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

    // if (root.children.length === 1 && child.type === 'image') {
    //   // console.log(child)
    //   const { url, alt } = child
    //   return <Image src={url} width={120} height={120} tooltip={alt || undefined} />
    // }

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
            const paddingTop = checked !== null ? 3 : (ordered ? 2 : 4)
            if (child.type === "paragraph") {
              return <AutoLayout
                key={[...itemPos, j].join('.')}
                hoverStyle={{ fill: gray[100] }}
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
                <AutoLayout padding={{ top: paddingTop }}>
                  {ordered && checked === null && <Text fontSize={14} fill={gray[400]} width={16} horizontalAlignText='right'>{counter}.</Text>}
                  {!ordered && checked === null && <Text fontSize={14} fill={gray[400]} width={16} horizontalAlignText="right">*</Text>}
                  {checked && <Text fontSize={16} fill="#ff0000">✅</Text>}
                  {checked === false && <Text fontSize={16} fill="#ff0000">☑</Text>}
                </AutoLayout>
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
      <Text fontSize={12} fontFamily="Source Code Pro">
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