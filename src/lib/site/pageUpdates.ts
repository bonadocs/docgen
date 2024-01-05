import * as fs from 'fs/promises'
import * as path from 'path'

import { supportedChains } from '@bonadocs/core'

import { Config } from '../config'

export async function generateDocIndexPage(config: Config, siteDir: string) {
  const deploymentAddressesTable = getDeploymentAddressesTable(config)
  const indexPageContents = await fs.readFile(
    path.join(siteDir, 'docs/index.md'),
    'utf-8',
  )

  const updatedIndexPageContents = indexPageContents
    .replace('DEPLOYMENT_ADDRESSES_PLACEHOLDER', deploymentAddressesTable)
    .replace('PROTOCOL_NAME_PLACEHOLDER', config.projectName!)
    .replace(
      'PROTOCOL_DESCRIPTION_PLACEHOLDER',
      config.projectDescription + '\n\n' || '',
    )

  await fs.writeFile(
    path.join(siteDir, 'docs/index.md'),
    updatedIndexPageContents,
  )
}

function getDeploymentAddressesTable(config: Config) {
  if (!config.deploymentAddresses) {
    return ''
  }

  const table = []
  const networks = [
    ...new Set(
      Object.values(config.deploymentAddresses).flatMap((d) =>
        d.map((d) => d.chainId),
      ),
    ),
  ]

  table.push([
    'Contract Name',
    ...networks.map(
      (chainId) =>
        supportedChains.get(chainId)?.name || `EVM Chain #${chainId}`,
    ),
  ])
  table.push(Array(networks.length + 1).fill('--------------'))

  for (const [contractName, deployments] of Object.entries(
    config.deploymentAddresses,
  )) {
    table.push([
      contractName,
      ...networks.map((chainId) => {
        const deployment = deployments.find((d) => d.chainId === chainId)
        return deployment ? deployment.address : ''
      }),
    ])
  }

  return table.map((row) => `| ${row.join(' | ')} |`).join('\n')
}
