import type { DocItemContext } from 'solidity-docgen/dist/site'

import { getWidget } from '../../lib/widget'

export function widget({ item, contract }: DocItemContext): string | undefined {
  if (item.nodeType !== 'FunctionDefinition') {
    return
  }

  if (!contract) {
    return
  }

  const widget = getWidget()
  if (!widget?.contracts.has(contract.name)) {
    return
  }

  if (
    !item.implemented ||
    item.kind !== 'function' ||
    item.visibility === 'internal' ||
    item.visibility === 'private'
  ) {
    return
  }

  return `<BonadocsWidget widgetConfigUri="${widget.widgetUri}" contract="${contract.name}" functionKey="0x${item.functionSelector}" />`
}
