// @ts-check
/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    { type: 'doc', id: 'intro' },
    {
      type: 'category',
      label: 'Packages',
      collapsed: false,
      link: { type: 'doc', id: 'packages/core' },
      items: [
        { type: 'doc', id: 'packages/core' },
        { type: 'doc', id: 'packages/infrastructure-react' },
        { type: 'doc', id: 'packages/infrastructure-vue' },
        { type: 'doc', id: 'packages/infrastructure-angular' },
        { type: 'doc', id: 'packages/validation' },
        { type: 'doc', id: 'packages/workflow' },
        { type: 'doc', id: 'packages/permission' },
        { type: 'doc', id: 'packages/i18n' },
        { type: 'doc', id: 'packages/devtools' },
        { type: 'doc', id: 'packages/testing' },
        { type: 'doc', id: 'packages/cli' },
      ],
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: { type: 'doc', id: 'getting-started' },
      items: [
        { type: 'doc', id: 'install' },
        { type: 'doc', id: 'quick-start' },
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        { type: 'doc', id: 'guides/best-practices' },
        { type: 'doc', id: 'guides/migration' },
        { type: 'doc', id: 'guides/troubleshooting' },
        { type: 'doc', id: 'guides/custom-routing' },
      ],
    },
    {
      type: 'category',
      label: 'Architecture',
      items: [
        { type: 'doc', id: 'architecture/decisions' },
        { type: 'doc', id: 'architecture/adr-001-folder-structure' },
        { type: 'doc', id: 'architecture/adr-002-pulse-vs-ploc' },
        { type: 'doc', id: 'architecture/adr-003-routing' },
        { type: 'doc', id: 'architecture/adr-004-packages' },
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        { type: 'doc', id: 'reference/api' },
        { type: 'doc', id: 'reference/packages' },
        { type: 'doc', id: 'reference/publishing' },
        { type: 'doc', id: 'reference/versioning' },
      ],
    },
  ],
};

module.exports = sidebars;
