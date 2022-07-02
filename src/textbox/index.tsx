import { ComponentProps, h, JSX } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks'
import styles from "./styles.css"

type Props = ComponentProps<'textarea'> & {
  handleReturn: (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => void
}

// https://github.com/fukayatsu/esarea/blob/master/src/js/esarea.coffee
const getCurrentLine = (el: HTMLTextAreaElement) => {
  const text = el.value;
  const selection = getSelection();
  if (!selection) return
  if (el.selectionStart != el.selectionEnd) return
  const startPos = text.lastIndexOf("\n", el.selectionStart - 1) + 1
  let endPos = text.indexOf("\n", el.selectionStart)
  if (endPos === -1) endPos = text.length
  // console.log(text.slice(startPos, endPos))
  const line = {
    text: text.slice(startPos, endPos),
    start: startPos,
    end: endPos,
    caret: el.selectionStart,
  }
  return line
}

const handleTab = (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
  const el = e.target as HTMLTextAreaElement;
  const line = getCurrentLine(el)
  if (!line) return
  // Only ListItem
  if (!line.text.match(/^(\s*(?:-|\+|\*|\d+\.) )/)) return
  const originalStart = el.selectionStart
  const originalEnd = el.selectionEnd
  if (originalStart !== originalEnd) return
  el.setSelectionRange(line.start, line.end)

  if (e.shiftKey) {
    // outdent line
    const after = line.text.replace(/^ {1,2}/gm, '')
    const count = line.text.length - after.length
    replaceText(el, after)
    el.setSelectionRange(originalStart - count, originalStart - count)
  } else {
    // indent line
    replaceText(el, "  " + line.text)
    el.setSelectionRange(originalStart + 2, originalStart + 2)
  }
}

const handleEnter = (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  const el = e.currentTarget
  const line = getCurrentLine(el)
  if (!line) return
  if (line.start == line.end) return
  const match = line.text.match(/^(\s*(?:-|\+|\*|\d+\.) (?:\[(?:x| )\] )?)\s*\S/)
  if (match) {
    if (line.text.match(/^(\s*(?:-|\+|\*|\d+\.) (?:\[(?:x| )\] ))\s*$/)) {
      el.setSelectionRange(line.start, line.end - 1)
      return
    }
    e.preventDefault();
    let listMark = match[1].replace(/\[x\]/, '[ ]')
    const listMarkMatch = listMark.match(/^(\s*)(\d+)\./)
    if (listMarkMatch) {
      const indent = listMarkMatch[1]
      const num = parseInt(listMarkMatch[2])
      if (num !== 1)
        listMark = listMark.replace(/\s*\d+/, `${indent}${num + 1}`)
    }
    replaceText(el, "\n" + listMark)
    const caretTo = line.caret + listMark.length + 1
    el.setSelectionRange(caretTo, caretTo)
  } else if (line.text.match(/^(\s*(?:-|\+|\*|\d+\.) )/)) {
    el.setSelectionRange(line.start, line.end)
  }

  return
}

const replaceText = (el: HTMLTextAreaElement, str: string) => {
  const selection = getSelection();
  if (!selection) return
  const fromIndex = el.selectionStart;
  const toIndex = el.selectionEnd;
  let inserted = false

  if (str) {
    el.focus();
    el.selectionStart = fromIndex
    el.selectionEnd = toIndex
    inserted = document.execCommand('insertText', false, str)
  }
  if (!inserted) {
    const value = el.value
    el.value = '' + value.substring(0, fromIndex) + str + value.substring(toIndex);
  }
}

export const Textbox = (props: Props) => {
  const { style, handleReturn, ...other } = props

  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
      // FIXME: Use (deprecated) keyCode to ignore Enter during IME conversion.
      if (e.keyCode === 13) {
        handleEnter(e)
        handleReturn(e)
      }
      if (e.key === 'Tab') {
        if (ref.current)
          handleTab(e);
        e.preventDefault()
      }
    }, [handleReturn])

  return <div className={styles.container} style={style} >
    <textarea ref={ref} className={styles.textarea} onKeyDown={handleKeyDown} spellcheck={false} {...other} />
    <div className={styles.border} />
  </div>
}