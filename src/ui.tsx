import {
  Button,
  Container,
  render,
  TextboxMultiline,
  useInitialFocus,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useEffect, useState } from 'preact/hooks'
import { inspect } from "unist-util-inspect"
import { proceccer } from './proceccer'
import { toMarkdown } from 'mdast-util-to-markdown'
import { gfmToMarkdown } from 'mdast-util-gfm'


function Plugin(props: { data: any }) {
  const [text, setText] = useState(
    props.data ? toMarkdown(props.data, {
      extensions: [gfmToMarkdown()],
      fences: true
    }) : ""
  )
  useEffect(() => {
    // Workaround: because textbox multiline is not support onKeyDown
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        setText(prev => {
          const result = proceccer.parse(prev)
          emit('UPDATE_DATA', {
            ast: result,
            inspect: inspect(result)
          })
          return prev
        })
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  const handleUpdateDataButtonClick = useCallback(
    async function () {
      const result = proceccer.parse(text)
      console.log(inspect(result))
      emit('UPDATE_DATA', {
        ast: result,
        inspect: inspect(result)
      })
    },
    [text]
  )
  return (
    <Container space="medium">
      <VerticalSpace space='medium' />
      <TextboxMultiline
        {...useInitialFocus()}
        onValueInput={setText}
        value={text}
        placeholder="# Your idea"
        rows={19}
      />
      <VerticalSpace space='medium' />
      <Button fullWidth onClick={handleUpdateDataButtonClick}>
        Update
      </Button>
      <VerticalSpace space='small' />
    </Container>
  )
}

export default render(Plugin)
