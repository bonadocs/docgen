import { exec } from '../subprocess'

export async function clone(repo: string, dir: string) {
  await exec(`git clone ${repo} ${dir}`)
  await exec(`cd ${dir} && git remote rm origin`)
}
