import { ComponentProps, h } from 'preact'
import { useEffect, useRef } from 'preact/hooks'
import styles from "./styles.css"

export const Textbox = (props: ComponentProps<'textarea'>) => {
  const { style, ...other } = props

  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.focus()
  }, [])

  return <div className={styles.container} style={style} >
    <textarea ref={ref} className={styles.textarea} {...other} />
    <div className={styles.border} />
  </div>
}