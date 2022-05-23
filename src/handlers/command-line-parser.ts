/**
 * parse text to command line
 */

import { program } from 'commander'

export default (text: string, commandLineConfigs: any []): any => {
  const arr = text.split(' ')
  const cmd: any = arr[0]
  if (!cmd) {
    return {}
  }
  const conf: any = commandLineConfigs.find(c => c.command === cmd)
  if (!conf) {
    return {}
  }
  const rest = arr.slice(1)
  const res: any = {
    command: cmd,
    rest: rest.join(' ')
  }
  if (conf.options && rest.length) {
    for (const opt of conf.options) {
      (program.option as any)(...opt)
    }
    program.parse(rest, { from: 'user' })
    const options = program.opts()
    res.options = options
  }
  return res
}