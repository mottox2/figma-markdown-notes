import { h, JSX } from 'preact'
import styles from "./styles.css"

// ref. https://zenn.dev/catnose99/articles/26bd8dac9ea5268486c8
// style. https://www.figma.com/file/Gj9iMcTbFbHrFq1ZWbDBuyc9/UI2%3A-Figma's-Design-System?node-id=0%3A1284

export const Tooltip = (props: { children: JSX.Element, label: string }) => {
  return <div class={styles.container}>
    {props.children}
    <div class={styles.tooltip}>{props.label}</div>
  </div>
}