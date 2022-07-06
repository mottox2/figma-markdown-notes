import {
  Button,
  Container,
  render,
  VerticalSpace
} from '@create-figma-plugin/ui'
import { emit } from '@create-figma-plugin/utilities'
import { h } from 'preact'
import { useCallback, useState } from 'preact/hooks'
import { inspect } from "unist-util-inspect"
import { proceccer, transformer, mdast2Md } from './proceccer'
import { Textbox } from './textbox'

const md2Ast = (md: string) => {
  return transformer.runSync(proceccer.parse(md))
}

function Plugin(props: { data: any }) {
  const [text, setText] = useState(props.data ? mdast2Md(props.data) : '')

  const handleUpdateDataButtonClick = useCallback(
    async function () {
      const result = md2Ast(text)
      emit('UPDATE_DATA', {
        ast: result,
        inspect: inspect(result)
      })
    },
    [text]
  )

  return (
    <Container space="small" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <VerticalSpace space='small' />
      <Textbox
        value={text}
        style={{ flex: 1 }}
        onInput={(e) => {
          setText(e.currentTarget.value)
        }}
        placeholder="# Your Idea"
        handleReturn={(e) => {
          if (e.metaKey) {
            const result = md2Ast(text)
            emit('UPDATE_DATA', {
              ast: result,
              inspect: inspect(result)
            })
          }
        }}
      />
      <VerticalSpace space='extraSmall' />
      <Button fullWidth onClick={handleUpdateDataButtonClick}>
        Update
      </Button>
      <VerticalSpace space='small' />
    </Container>
  )
}

export default render(Plugin)
