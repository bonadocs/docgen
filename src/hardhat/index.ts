import * as path from 'path'

import { extendConfig, extendEnvironment, task } from 'hardhat/config'
import { BuildInfo } from 'hardhat/types'

import './type-extensions'
import { BonadocsTaggedFactory } from './deployer/factory'

extendConfig((config) => {
  config.docgen ??= {}
  config.docgen.root = config.paths.root
  config.docgen.sourcesDir = path
    .relative(config.paths.root, config.paths.sources)
    .split(path.sep)
    .join(path.posix.sep)
})

extendEnvironment((hre: any) => {
  if (hre.ethers) {
    hre.ethers = new Proxy(hre.ethers, {
      get: function (target, prop) {
        if (prop === 'getContractFactory') {
          return (...args: unknown[]) => {
            return target[prop](...args).then(
              (factory: any) => new BonadocsTaggedFactory(factory),
            )
          }
        } else {
          return target[prop]
        }
      },
    })
  }
})

task('docgen', async (_, hre) => {
  await hre.run('compile')

  const { promises: fs } = await import('fs')
  const { main } = await import('../lib')

  const buildInfoPaths = await hre.artifacts.getBuildInfoPaths()
  const builds = await Promise.all(
    buildInfoPaths.map(async (p) => ({
      mtime: (await fs.stat(p)).mtimeMs,
      data: JSON.parse(await fs.readFile(p, 'utf8')) as BuildInfo,
    })),
  )

  // Sort most recently modified first
  builds.sort((a, b) => b.mtime - a.mtime)

  await main(
    builds.map((b) => b.data),
    hre.config.docgen,
  )
})
