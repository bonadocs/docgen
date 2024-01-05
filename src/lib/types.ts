export type Deployment = {
  chainId: number
  address: string
}

export type WidgetConfig = {
  widgetUri: string
  contracts: Set<string>
}
