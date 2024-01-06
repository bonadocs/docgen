import * as path from 'path'

import shell from 'shelljs'

import { Config } from '../config'

import { addDocusaurusConfig } from './docusaurus'
import * as git from './git'
import { generateDocIndexPage } from './pageUpdates'

/**
 * This function generates the website for the given configuration and copies
 * the generated docs from the docs directory to the website directory.
 * @param config
 * @param docsDir
 */
export async function generateWebsite(config: Config, docsDir: string) {
  const siteDir = path.resolve(config.outputDir!)
  const templateRepo = getTemplateRepo(config)
  await cloneStarterTemplate(templateRepo, siteDir)
  await moveContractsToSiteDir(docsDir, siteDir)
  await generateDocIndexPage(config, siteDir)
  await addDocusaurusConfig(config, siteDir)
}

async function cloneStarterTemplate(templateUrl: string, siteDir: string) {
  if (
    shell.test('-d', siteDir) &&
    shell.test('-e', `${siteDir}/docusaurus.config.js`)
  ) {
    console.warn('Website directory already exists, skipping clone')
  } else {
    await git.clone(templateUrl, siteDir)
  }

  // ensure the contracts directory exists
  shell.mkdir('-p', `${siteDir}/docs/contracts`)
}

function getTemplateRepo(config: Config) {
  if (!config.website?.template) {
    throw new Error('No website template specified')
  }

  switch (config.website.template) {
    case 'js':
    case 'ts':
      return `https://github.com/bonadocs/docgen-template-${config.website.template}.git`
  }

  try {
    new URL(config.website.template)
    return config.website.template
  } catch {
    throw new Error(
      `Invalid website template: ${config.website.template}. Templates must be a URL or one of 'js' or 'ts'`,
    )
  }
}

async function moveContractsToSiteDir(docsDir: string, siteDir: string) {
  const contractsDir = path.join(siteDir, 'docs/contracts')
  shell.mv(`${docsDir}${path.sep}*`, contractsDir)
}
