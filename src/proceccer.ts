import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import { Node, Parent, Root } from "unist";
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

export const transformer = unified().use(noSpread)

export const mdast2Md = (mdAst: Root) => {
  return toMarkdown(mdAst, {
    extensions: [gfmToMarkdown()],
    fences: true,
    listItemIndent: 'one',
  })
}