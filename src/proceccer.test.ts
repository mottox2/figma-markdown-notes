import { proceccer, transformer, mdast2Md } from "./proceccer"
import { describe, it, expect } from 'vitest'
import type { List, Root, Paragraph } from 'mdast'

describe('markdown', () => {
  it('strip spread in List', async () => {
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
    const md = `Link
https://mottox2.com
hello world
`

    const ast = proceccer.parse(md);
    expect(ast.type).toBe('root')
    expect(ast.children.length).toBe(1)
    const child = ast.children[0] as Paragraph
    console.log(child)
    expect(child.type).toBe('paragraph')
    expect(child.children.length).toBe(3)

    // TODO
  })
})