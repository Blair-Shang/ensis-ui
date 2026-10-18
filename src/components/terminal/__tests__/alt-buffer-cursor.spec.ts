import { Terminal } from '@xterm/xterm'
import { describe, expect, it } from 'vitest'
import { prepareTerminalForPtyWrite } from '../src/terminal-utils'

function writeSync(term: Terminal, data: string): Promise<void> {
  return new Promise((resolve) => {
    term.write(data, () => resolve())
  })
}

async function fillScreen(term: Terminal): Promise<void> {
  const lines = Array.from({ length: 400 }, (_, i) => `line ${i} ${'x'.repeat(40)}`).join('\r\n')
  await writeSync(term, `${lines}\r\n`)
}

describe('alt buffer cursor after long output', () => {
  it('keeps the prompt row when vim enter and clear share one chunk', async () => {
    const term = new Terminal({ cols: 80, rows: 24, scrollback: 5000 })
    await fillScreen(term)
    const cursorY = term.buffer.active.cursorY
    const baseY = term.buffer.active.baseY
    expect(cursorY).toBe(23)
    expect(term.buffer.active.viewportY).toBe(baseY)

    const enter = '\x1b[?1049h\x1b[22;0;0t\x1b[H\x1b[2J'
    prepareTerminalForPtyWrite(term, enter)
    await writeSync(term, enter)
    await writeSync(term, 'vim buffer')
    await writeSync(term, '\x1b[?1049l\x1b[23;0;0t')

    expect(term.buffer.active.type).toBe('normal')
    expect(term.buffer.active.cursorY).toBe(cursorY)
    expect(term.buffer.active.viewportY).toBe(term.buffer.active.baseY)
  })

  it('keeps the prompt row when clear arrives before the alt screen', async () => {
    const term = new Terminal({ cols: 80, rows: 24, scrollback: 5000 })
    await fillScreen(term)
    const cursorY = term.buffer.active.cursorY

    const clear = '\x1b[2J'
    prepareTerminalForPtyWrite(term, clear)
    await writeSync(term, clear)
    const enter = '\x1b[?1049h'
    prepareTerminalForPtyWrite(term, enter)
    await writeSync(term, enter)
    await writeSync(term, '\x1b[?1049l')

    expect(term.buffer.active.cursorY).toBe(cursorY)
    expect(term.buffer.active.viewportY).toBe(term.buffer.active.baseY)
  })
})
