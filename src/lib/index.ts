import { mkdtemp, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

import { templatesRoot } from '../templates'

import { Config, defaults } from './config'
import { generateWebsite } from './site'
import { initializeWidget } from './widget'
import type { Build, ContractABI } from './widget/deployer'

export async function main(
  builds: Build[],
  config?: Config,
  abis?: ContractABI[],
): Promise<void> {
  config = { ...defaults, ...config }
  validateConfig(config)

  if (config.deploymentAddresses) {
    await initializeWidget(builds, abis || getAbis(builds), config)
  }
  await runDocgen(builds, config)
}

function validateConfig(config: Config) {
  if (config.website!.configureGitHubPages) {
    if (!config.website!.docsGitHubOrganization) {
      throw new Error(
        'docsGitHubOrganization must be set when configureGitHubPages is true',
      )
    }
    if (!config.website!.docsGitHubRepo) {
      throw new Error(
        'docsGitHubRepo must be set when configureGitHubPages is true',
      )
    }
  }

  if (config.deploymentAddresses) {
    for (const [contractName, deployments] of Object.entries(
      config.deploymentAddresses,
    )) {
      if (deployments.length === 0) {
        throw new Error(`No deployments found for ${contractName}`)
      }
    }
  }
}

async function runDocgen(builds: Build[], config: Config) {
  const { main: docgen } = await import('solidity-docgen/dist/main')

  config.templates ??= templatesRoot
  if (!config.website!.generate) {
    await docgen(builds, config)
    return
  }

  const tempDir = await getTempDir()
  try {
    await docgen(builds, {
      ...config,
      outputDir: tempDir,
    })
    await generateWebsite(config, tempDir)
  } finally {
    await rm(tempDir, { recursive: true, force: true })
  }
}

function getTempDir() {
  return mkdtemp(join(tmpdir(), 'bonadocs-docgen-'))
}

function getAbis(builds: Build[]) {
  const abis = new Map<string, unknown[]>()
  for (const build of builds) {
    if (!build.output.contracts) {
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    for (const [_, contracts] of Object.entries(build.output.contracts)) {
      for (const [contract, contractInfo] of Object.entries(contracts)) {
        if (!abis.has(contract)) {
          abis.set(contract, [])
        }
        const contractAbis = abis.get(contract)!
        if (!Array.isArray(contractInfo.abi)) {
          continue
        }
        contractAbis.push(...contractInfo.abi)
      }
    }
  }

  const abisArray = []
  for (const [contract, abi] of abis) {
    abisArray.push({
      contractName: contract,
      abi: JSON.stringify(abi),
    })
  }
  return abisArray
}
