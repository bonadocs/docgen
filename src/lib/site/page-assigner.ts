import { PageAssigner } from 'solidity-docgen/dist/site'

export const pageAssigner: PageAssigner = (docItem) => {
  if (docItem.nodeType === 'ContractDefinition' && docItem.fullyImplemented) {
    return docItem.name + '.md'
  }

  return '_reference.md'
}
