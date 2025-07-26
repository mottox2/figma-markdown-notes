/** @jsx figma.widget.h */

import { NotepadWidget } from './components'

const { widget } = figma

export default function () {
  widget.register(NotepadWidget)
}


