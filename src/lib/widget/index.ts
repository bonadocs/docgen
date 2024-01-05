import type { Config } from '../config'
import type { WidgetConfig } from '../types'

import { Build, ContractABI, deployWidget } from './deployer'

let widget: WidgetConfig | undefined

export async function initializeWidget(
  builds: Build[],
  contractABIS: ContractABI[],
  config: Config,
) {
  if (!widget) {
    widget = await deployWidget(builds, contractABIS, config)
  }
}

export function getWidget() {
  return widget
}
