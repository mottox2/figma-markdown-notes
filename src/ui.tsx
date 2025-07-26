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
import { Textbox } from './components/ui/textbox'
import { Tooltip } from './components/ui/tooltip'

declare global {
  interface Navigator {
    readonly userAgentData: any
  }
}

function parseMarkdownToAST(markdown: string) {
  return transformer.runSync(proceccer.parse(markdown))
}

function detectMacOS(navigator: Navigator): boolean {
  const platform: string = navigator?.userAgentData?.platform || navigator?.platform || 'unknown'
  return /mac|Mac/.test(platform)
}

function Plugin(props: { data: any }) {
  const [text, setText] = useState(props.data ? mdast2Md(props.data) : '')
  const isMac = detectMacOS(navigator)
  const shortcut = isMac ? '⌘↩' : "Ctrl+Enter"

  const handleUpdateDataButtonClick = useCallback(
    async function () {
      const result = parseMarkdownToAST(text)
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
          if ((isMac && e.metaKey) || (!isMac && e.ctrlKey)) {
            const result = parseMarkdownToAST(text)
            emit('UPDATE_DATA', {
              ast: result,
              inspect: inspect(result)
            })
          }
        }}
      />
      <VerticalSpace space='extraSmall' />
      <Tooltip label={`Update Content　${shortcut}`}>
        <Button fullWidth onClick={handleUpdateDataButtonClick}>
          Update
        </Button>
      </Tooltip>

      <VerticalSpace space='small' />
    </Container>
  )
}

export default render(Plugin)
