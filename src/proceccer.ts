import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import { Node, Parent } from "unist";
import type { Root, Text, Paragraph, PhrasingContent } from 'mdast'
import { visit } from 'unist-util-visit'
import { List, ListItem } from "mdast-util-from-markdown/lib";
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmToMarkdown } from 'mdast-util-gfm'

export const proceccer = unified().use(remarkParse).use(remarkGfm)

const noSpread = () => {
  return (tree: Node) => {
    visit(tree, 'list', (node: List, index: number, parent: Parent) => {
      if (!("children" in parent)) return
      const newNode: List = {
        ...node,
        spread: false
      }
      parent.children[index] = newNode
    })
    visit(tree, 'listItem', (node: ListItem, index: number, parent: Parent) => {
      if (!("children" in parent)) return
      const newNode: ListItem = {
        ...node,
        spread: false
      }
      parent.children[index] = newNode
    })
  };
};

const find = /[\t ]*(?:\r?\n|\r)/g
const splitLink = () => {
  return (tree: Node) => {
    // https://github.com/remarkjs/remark-breaks/blob/ea1111b6bd7ecc71ecde77e4ce67c3afab579c4a/index.js#L34
    visit(tree, 'text', (node: Text, index: number, parent: Parent) => {
      if (parent.type !== 'paragraph') return
      const result = []
      let start = 0;
      find.lastIndex = 0

      let match = find.exec(node.value)

      while (match) {
        const position = match.index

        if (start !== position) {
          result.push({ type: 'text', value: node.value.slice(start, position) })
        }

        result.push({ type: 'break' })
        start = position + match[0].length
        match = find.exec(node.value)
      }

      if (result.length > 0 && parent && typeof index === 'number') {
        if (start < node.value.length) {
          result.push({ type: 'text', value: node.value.slice(start) })
        }

        parent.children.splice(index, 1, ...result)
        return index + result.length
      }
    })
    visit(tree, 'paragraph', (node: Paragraph, index: number, parent: Parent) => {
      const blocks = []
      let stack: PhrasingContent[] = [];
      console.log('=======PARAGRAPH========')
      console.log(node)

      // 復元コード
      // const newChildren = node.children.map(child => {
      //   if (child.type === 'break') return {
      //     type: 'text',
      //     value: "\n"
      //   } as Text
      //   return child
      // })

      // const paragraph: Paragraph = {
      //   ...node,
      //   children: newChildren
      // }
      // parent.children[index] = paragraph

      // 改行ごとに分割
      node.children.forEach((child) => {
        // console.log(stack.length, stack)
        if (child.type === 'break') {
          if (stack.length > 0)
            blocks.push(stack)
          stack = []
          return
        }
        stack.push(child)
        return
      })
      blocks.push(stack)

      // ブロックをつながる。その際にLink単独のブロックは独立させる。
      let blocks2 = [];
      const result = blocks.reduce((prev, current) => {
        if (current.length === 1 && current[0].type === 'link') {
          blocks2.push(prev)
          blocks2.push(current)
          return []
        }
        const next = prev.length === 0 ?
          current : [...prev, ({ type: 'text', value: '\n' } as Text), ...current]
        console.log({ prev, current, next })
        return next
      }, [])
      console.log({ result })
      blocks2.push(result)
      blocks2 = blocks2.filter(b => b.length > 0)
      // console.log({ result })


      // console.log('=====BLOCKS======')
      // console.log(blocks)
      console.log('======BLOCKS2======')
      console.log(blocks2)

      if (blocks2.length > 0) {
        const resultBlocks = blocks2.map(children => {
          return {
            type: "paragraph",
            children: children
          }
        })
        console.log('======RESULT BLOCKS======')
        // console.log(resultBlocks)
        resultBlocks.map(block => {
          console.log(block)
        })
        parent.children.splice(index, 1, ...resultBlocks)
        return index + resultBlocks.length
      }
    })
  }
}

export const transformer = unified().use(splitLink)

export const mdast2Md = (mdAst: Root) => {
  return toMarkdown(mdAst, {
    extensions: [gfmToMarkdown()],
    fences: true,
    listItemIndent: 'one',
  })
}