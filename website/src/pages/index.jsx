import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <span className={styles.badge}>Framework-agnostic · TypeScript</span>
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--primary button--lg"
            to="/docs/getting-started"
          >
            Get started
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro"
          >
            Documentation
          </Link>
        </div>
      </div>
    </header>
  );
}

const FEATURES = [
  {
    icon: '◇',
    title: 'Framework-agnostic',
    description:
      'Write business logic once with UseCase, Ploc, and Pulse. Use the same code in React, Vue, Angular, or future frameworks by swapping adapters.',
  },
  {
    icon: '▣',
    title: 'Clean Architecture',
    description:
      'Clear separation: domain, application, and infrastructure. Keep the caf/ folder consistent and dependency direction enforced.',
  },
  {
    icon: '◈',
    title: 'Type-safe',
    description:
      'Full TypeScript support. UseCase, RequestResult, and Ploc are fully typed so you get autocomplete and safe refactors.',
  },
];

function FeatureCard({ icon, title, description }) {
  return (
    <div className={styles.featureCard}>
      <div className={styles.featureIcon} aria-hidden>
        {icon}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <HomepageHeader />
      <main className={styles.features}>
        <div className="container">
          <h2 className={styles.featuresHeadline}>Why CAF?</h2>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <FeatureCard
                key={f.title}
                icon={f.icon}
                title={f.title}
                description={f.description}
              />
            ))}
          </div>
        </div>
      </main>
    </Layout>
  );
}
