import { ComponentProps, h, JSX } from 'preact'
import { useCallback, useEffect, useRef } from 'preact/hooks'
import styles from "./styles.css"

type Props = ComponentProps<'textarea'> & {
  handleReturn: (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => void
}

// https://github.com/fukayatsu/esarea/blob/master/src/js/esarea.coffee
const getCurrentLine = (text: string, el: HTMLTextAreaElement) => {
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
  console.log(line)
  return line
}

// 引数はeventにする
const handleTab = (event: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>, value: string, el: HTMLTextAreaElement) => {
  const line = getCurrentLine(value, el)
  // ListItemのときのみ動作させる
  if (!line) return
  const originalStart = el.selectionStart
  const originalEnd = el.selectionEnd
  if (originalStart !== originalEnd) return
  el.setSelectionRange(line.start, line.end)

  if (event.shiftKey) {
    const after = line.text.replace(/^ {1,2}/gm, '')
    const count = line.text.length - after.length
    replaceText(el, after)
    el.setSelectionRange(originalStart - count, originalStart - count)
  } else {
    replaceText(el, "  " + line.text)
    el.setSelectionRange(originalStart + 2, originalStart + 2)
  }
}

const replaceText = (el: HTMLTextAreaElement, str: string) => {
  const selection = getSelection();
  if (!selection) return
  const fromIndex = el.selectionStart;
  const toIndex = el.selectionEnd;
  let inserted = false

  let expectedLen = el.value.length - Math.abs(toIndex - fromIndex) + str.length
  el.focus();
  el.selectionStart = fromIndex
  el.selectionEnd = toIndex
  inserted = document.execCommand('insertText', false, str)
}

export const Textbox = ({
  ...props
}: Props) => {
  const { style, onKeyDown, handleReturn, ...other } = props

  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.focus()
  }, [])

  const handleKeyDown = useCallback(
    (e: JSX.TargetedKeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter') handleReturn(e)
      if (e.key === 'Tab') {
        if (ref.current)
          handleTab(e, props.value as string, ref.current);
        e.preventDefault()
      }
    }, [handleReturn])

  return <div className={styles.container} style={style} >
    <textarea ref={ref} className={styles.textarea} onKeyDown={handleKeyDown} spellcheck={false} {...other} />
    <div className={styles.border} />
  </div>
}