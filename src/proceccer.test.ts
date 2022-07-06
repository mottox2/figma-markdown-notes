import { proceccer, transformer, mdast2Md } from "./proceccer"
import { describe, it, expect } from 'vitest'
import type { List, Root, Paragraph } from 'mdast'

describe('markdown', () => {
  it.skip('strip spread in List', async () => {
    const md = `# Markdown
* List1

* List2`

    const ast = proceccer.parse(md);
    const list = ast.children[1] as List
    console.log(ast)
    expect(ast.type).toBe('root')
    expect(ast.children.length).toBe(2)
    expect(list.type).toBe('list')
    expect(list.spread).toBe(true)

    const noSpread = await transformer.run(ast) as Root
    const noSpreadList = noSpread.children[1] as List
    expect(noSpreadList.type).toBe('list')
    expect(noSpreadList.spread).toBe(false)

    const converted = mdast2Md(noSpread)
    console.log(converted)
    expect(converted).toBe(`# Markdown

* List1
* List2
`)
  })

  it('split link in paragraph', async () => {
    const md = `Link Text
https://mottox2.com
こんにちは世界
こんばんは家庭
`

    const ast = proceccer.parse(md);
    expect(ast.type).toBe('root')
    expect(ast.children.length).toBe(1)
    const child = ast.children[0] as Paragraph
    expect(child.type).toBe('paragraph')
    // expect(child.children.length).toBe(3)

    console.log(ast.children[0], '')
    const transformed = await transformer.run(ast) as Root
    // console.log(transformed.children[0])
    console.log('==============')
    // console.log(transformed.children)
    transformed.children.forEach(t => {
      console.log(t)
    })
    const converted = mdast2Md(transformed)
    expect(converted).toBe(`Link Text

<https://mottox2.com>

こんにちは世界
こんばんは家庭
`)
    expect(transformed.children.length).toBe(3)
  })

  it.skip('test', async () => {
    const ast = {
      type: 'root',
      children: [
        {
          type: "paragraph",
          children: [
            {
              type: "text",
              value: "aaaa\n"
            },
            {
              type: "text",
              value: "bbbb\n"
            },
            {
              type: "link",
              url: "https://mottox2.com",
              title: null,
              children: [
                { type: 'text', value: 'https://mottox2.com' }
              ]
            },
            {
              type: "text",
              value: "\n"
            },
            {
              type: "text",
              value: "cccc"
            }
          ]
        }

      ]
    }
    const transformed = await transformer.run(ast) as Root
    console.log('======TRANSFORM=======')
    transformed.children.forEach(child => {
      console.log(child)
    })
  })
})