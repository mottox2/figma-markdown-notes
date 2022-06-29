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

function Plugin (props: { text: string }) {
  const [text, setText] = useState(props.text)
  const handleUpdateDataButtonClick = useCallback(
    async function () {
      const result = await proceccer.parse(text)
      console.log(inspect(result))
      emit('UPDATE_TEXT', text)
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
