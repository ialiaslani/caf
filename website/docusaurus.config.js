// @ts-check
// https://docusaurus.io/docs/configuration

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'CAF',
  tagline: 'Clean Architecture Frontend — framework-agnostic primitives for frontend apps',
  favicon: 'img/image.png',
  url: 'https://your-docs-site.com',
  baseUrl: '/',
  organizationName: 'ialiaslani',
  projectName: 'caf',
  onBrokenLinks: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          routeBasePath: 'docs',
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/ialiaslani/caf/tree/main/website/',
          showLastUpdateAuthor: false,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
  ],
  themeConfig: {
    navbar: {
      title: 'CAF',
      logo: {
        alt: 'CAF',
        src: 'img/image.png',
      },
      items: [
        { to: '/docs/intro', label: 'Introduction', position: 'left' },
        { to: '/docs/packages/core', label: 'Packages', position: 'left' },
        { to: '/docs/getting-started', label: 'Getting Started', position: 'left' },
        { to: '/docs/guides/best-practices', label: 'Guides', position: 'left' },
        { to: '/docs/architecture/decisions', label: 'Architecture', position: 'left' },
        { href: 'https://github.com/ialiaslani/caf', label: 'GitHub', position: 'right' },
        { href: 'https://www.npmjs.com/org/c-a-f', label: 'npm', position: 'right' },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Introduction', to: '/docs/intro' },
            { label: 'Getting Started', to: '/docs/getting-started' },
            { label: 'Best Practices', to: '/docs/guides/best-practices' },
            { label: 'API Reference', to: '/docs/reference/api' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/ialiaslani/caf' },
            { label: 'npm', href: 'https://www.npmjs.com/org/c-a-f' },
          ],
        },
        {
          title: 'Legal',
          items: [
            { label: 'MIT License', href: 'https://github.com/ialiaslani/caf/blob/main/LICENSE' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CAF — Clean Architecture Frontend.`,
    },
    prism: {
      additionalLanguages: ['bash', 'json', 'typescript'],
    },
    docs: {
      sidebar: {
        hideable: false,
        autoCollapseCategories: false,
      },
    },
  },
};

module.exports = config;
