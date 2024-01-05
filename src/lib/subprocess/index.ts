import * as childProcess from 'child_process'

export function exec(command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, (err, stdout) => {
      if (err) {
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}
