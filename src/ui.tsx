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
import { useCallback, useState } from 'preact/hooks'
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
  const handleUpdateDataButtonClick = useCallback(
    async function () {
      const result = await proceccer.parse(text)
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
      <VerticalSpace space='large' />
      <TextboxMultiline
        {...useInitialFocus()}
        onValueInput={setText}
        value={text}
        rows={15}
      />
      <VerticalSpace space='large' />
      <Button fullWidth onClick={handleUpdateDataButtonClick}>
        Update Data
      </Button>
      <VerticalSpace space='small' />
    </Container>
  )
}

export default render(Plugin)
