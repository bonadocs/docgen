import type { DocItemContext } from 'solidity-docgen/dist/site'

import { getWidget } from '../../lib/widget'

export function widget({ item, contract }: DocItemContext): string | undefined {
  if (item.nodeType !== 'FunctionDefinition') {
    return
  }

  if (!contract) {
    throw new Error(
      `FunctionDefinition Node ${item.name} (${item.id}) has no contract in context`,
    )
  }

  const widget = getWidget()
  if (!widget?.contracts.has(contract.name)) {
    return
  }

  return `<BonadocsWidget widgetConfigUri="${widget.widgetUri}" contract="${contract.name}" functionKey="0x${item.functionSelector}" />`
}
