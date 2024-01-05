import type { PageAssigner } from 'solidity-docgen/dist/site'

import { Deployment } from './types'

export type WebsiteConfig = {
  /**
   * Will generate the website if true, otherwise will only generate the
   * documentation markdown files. Defaults to true.
   */
  generate?: boolean

  /**
   * Will configure the website for GitHub Pages deployment if true.
   * Defaults to false.
   */
  configureGitHubPages?: boolean

  /**
   * The GitHub URL of the project (Optional)
   */
  projectGitHubUrl?: string

  /**
   * The GitHub organization that the documentation website is hosted
   * under (Required if `configureGitHubPages` is true)
   */
  docsGitHubOrganization?: string

  /**
   * The name of the GitHub repository that the documentation website is hosted
   * under (Required if `configureGitHubPages` is true)
   */
  docsGitHubRepo?: string
}

export type UserConfig = {
  /**
   * The name of your project (Optional)
   */
  projectName?: string

  /**
   * A description of your project (Optional)
   */
  projectDescription?: string

  /**
   * Configuration for generating your documentation website (Optional)
   */
  website?: WebsiteConfig

  /**
   * If no deployment addresses are provided, the widget will be disabled.
   *
   * An object mapping contract names to their deployment addresses.
   * Only deployed contracts will have widgets generated for them.
   */
  deploymentAddresses?: Record<string, Deployment[]>
} & DocgenUserConfig

/// Docgen types

export interface DocgenUserConfig {
  /**
   * The directory where the generated website or rendered pages will be written.
   * Defaults to 'docs'.
   */
  outputDir?: string

  /**
   * A directory of custom templates that should take precedence over the
   * theme's templates.
   */
  templates?: string

  /**
   * The name of the built-in templates that will be used by default.
   * Defaults to 'markdown'.
   */
  theme?: string

  /**
   * The way documentable items (contracts, functions, custom errors, etc.)
   * will be organized in pages. Built in options are:
   * - 'single': all items in one page
   * - 'items': one page per item
   * - 'files': one page per input Solidity file
   * More customization is possible by defining a function that returns a page
   * path given the AST node for the item and the source unit where it is
   * defined.
   * Defaults to 'items'.
   */
  pages?: 'single' | 'items' | 'files' | PageAssigner

  /**
   * An array of sources subdirectories that should be excluded from
   * documentation, relative to the contract sources directory.
   */
  exclude?: string[]

  /**
   * Clean up the output by collapsing 3 or more contiguous newlines into only 2.
   * Enabled by default.
   */
  collapseNewlines?: boolean

  /**
   * The extension for generated pages.
   * Defaults to '.md'.
   */
  pageExtension?: string
}

////////////////////////////////////////////////////////////////////////////////////////////////////

// Other config parameters that will be provided by the environment (e.g. Hardhat)
// rather than by the user manually, unless using the library directly.
export interface Config extends UserConfig {
  /**
   * The root directory relative to which 'outputDir', 'sourcesDir', and
   * 'templates' are specified. Defaults to the working directory.
   */
  root?: string

  /**
   * The Solidity sources directory.
   */
  sourcesDir?: string
}

export type FullConfig = Required<Config>

export const defaults: Omit<FullConfig, 'templates' | 'deploymentAddresses'> = {
  root: process.cwd(),
  sourcesDir: 'contracts',
  outputDir: 'docs',
  pages: 'items',
  exclude: [],
  theme: 'markdown',
  collapseNewlines: true,
  pageExtension: '.md',
  projectName: 'My Project',
  projectDescription: 'The next big thing.',
  website: {
    generate: true,
    configureGitHubPages: false,
  },
}
