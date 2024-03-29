import 'hardhat/types/config'
import 'hardhat/types/runtime'

import type { Config, UserConfig } from '../lib/config'

declare module 'hardhat/types/config' {
  export interface HardhatUserConfig {
    docgen?: UserConfig
  }

  export interface HardhatConfig {
    docgen: Config
  }
}
