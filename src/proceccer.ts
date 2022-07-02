import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import { Node, Parent } from "unist";
import { visit } from 'unist-util-visit'
import { List } from "mdast-util-from-markdown/lib";

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
  };
};

export const transformer = unified().use(noSpread)