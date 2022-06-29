import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"

export const proceccer = unified().use(remarkParse).use(remarkGfm)