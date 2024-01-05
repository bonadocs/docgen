import * as fs from 'fs/promises'

import { Config } from '../config'

export async function addDocusaurusConfig(config: Config, siteDir: string) {
  const docusaurusConfig = generateDocusaurusConfig(config)
  const docusaurusConfigPath = `${siteDir}/docusaurus.config.js`
  await fs.writeFile(docusaurusConfigPath, docusaurusConfig)
}

function generateDocusaurusConfig(config: Config) {
  const websiteConfig = config.website!
  const docusaurusConfig = {
    title: config.projectName,
    tagline: 'Generated with Bonadocs',
    favicon: 'img/favicon.ico',
    url: 'https://your-documentation-site.com',

    ...(websiteConfig.configureGitHubPages && {
      baseUrl: `/${websiteConfig.docsGitHubRepo}`,
      organizationName: websiteConfig.docsGitHubOrganization,
      projectName: websiteConfig.docsGitHubRepo,
    }),
    ...(!websiteConfig.configureGitHubPages && {
      baseUrl: '/',
    }),
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    i18n: {
      defaultLocale: 'en',
      locales: ['en'],
    },

    presets: [
      [
        'classic',
        {
          docs: {
            routeBasePath: '/',
            sidebarPath: './sidebars.js',
            editUrl: `https://github.com/${websiteConfig.docsGitHubOrganization}/${websiteConfig.docsGitHubRepo}/tree/main/`,
          },
          theme: {
            customCss: './src/css/custom.css',
          },
        },
      ],
    ],

    themeConfig: {
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: config.projectName,
        logo: {
          alt: `${config.projectName} Logo`,
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'contractSidebar',
            position: 'left',
            label: 'Contracts',
          },
          ...(websiteConfig.projectGitHubUrl
            ? [
                {
                  href: websiteConfig.projectGitHubUrl,
                  label: 'GitHub',
                  position: 'right',
                },
              ]
            : []),
        ],
      },
      prism: {
        theme: '{{{prismThemes.github}}}',
        darkTheme: '{{{prismThemes.dracula}}}',
      },
    },
  }

  const jsonString = JSON.stringify(docusaurusConfig, null, 2).replace(
    /"\{\{\{([^}]+)}}}"/g,
    '$1',
  )

  return `${header}
export default ${jsonString};`
}

const header = `// @ts-check

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */`
