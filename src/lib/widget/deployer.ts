import {
  Collection,
  CollectionDataManager,
  deleteCollectionName,
  getCollectionStore,
} from '@bonadocs/core'
import type { SolcInput, SolcOutput } from 'solidity-ast/solc'

import type { Config } from '../config'
import type { WidgetConfig } from '../types'

export type Build = {
  input: SolcInput
  output: SolcOutput & {
    contracts?: {
      [sourceName: string]: {
        [contractName: string]: {
          abi: unknown
        }
      }
    }
  }
}

export type ContractABI = {
  contractName: string
  abi: string
}

export async function deployWidget(
  builds: Build[],
  contractABIS: ContractABI[],
  config: Config,
): Promise<WidgetConfig> {
  const manager = Collection.createBlankCollection(
    config.projectName!,
    config.projectDescription || config.projectName!,
  ).manager

  try {
    const contracts = new Set<string>()
    const abis = await addABIs(manager, contractABIS)
    for (const build of builds) {
      await configureManagerFromBuild(manager, build, abis, config, contracts)
    }

    contracts.clear()
    for (const contract of manager.contractManagerView.contracts) {
      contracts.add(contract.name)
    }

    const widgetUri = await manager.workflowManagerView.generateWidget()
    return { widgetUri, contracts }
  } finally {
    await deleteCollection(manager.id)
  }
}

async function addABIs(
  manager: CollectionDataManager,
  contractABIS: ContractABI[],
) {
  const abis: Record<string, string> = {}
  for (const abi of contractABIS) {
    abis[abi.contractName] =
      await manager.contractManagerView.addContractInterface(
        abi.contractName,
        abi.abi,
      )
  }
  return abis
}

async function configureManagerFromBuild(
  manager: CollectionDataManager,
  build: Build,
  abis: Record<string, string>,
  config: Config,
  contracts: Set<string>,
) {
  const { output } = build

  for (const source of Object.values(output.sources)) {
    const { ast } = source
    const { nodes } = ast

    for (const node of nodes) {
      if (node.nodeType === 'ContractDefinition') {
        const { name } = node
        if (contracts.has(name)) {
          continue
        }

        contracts.add(name)
        const deployments = config.deploymentAddresses![name]
        if (!deployments) {
          continue
        }

        if (!abis[name]) {
          throw new Error(`No ABI found for contract ${name}`)
        }

        await manager.contractManagerView.addContract(
          {
            id: '',
            name,
            interfaceHash: abis[name],
            instances: deployments.map((deployment) => ({
              address: deployment.address,
              chainId: deployment.chainId,
            })),
          },
          deployments[0].chainId,
          deployments[0].address,
        )
      }
    }
  }
}

async function deleteCollection(id: string) {
  const store = await getCollectionStore(id)
  await store.remove(id)
  await deleteCollectionName(id)
}
