import { ContractFactory } from 'ethers'

import { BonadocsTaggedFactory } from './factory'

/**
 * Create a new factory such that deployments made by the provided factory
 * are tagged in the contract metadata
 * @param factory
 */
export function getTaggedFactory(factory: ContractFactory) {
  return new BonadocsTaggedFactory(factory)
}
