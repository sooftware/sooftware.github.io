import config from './website-config';

/**
 * schema.org JSON-LD shared by the page templates (search rich results + AI answer engines).
 */
export const person = {
  '@type': 'Person',
  '@id': `${config.siteUrl}/#person`,
  name: 'Soohwan Kim',
  alternateName: ['김수환', 'Kaki', 'sooftware'],
  jobTitle: 'ML Engineer',
  worksFor: { '@type': 'Organization', name: 'Karrot (당근)', url: 'https://about.daangn.com' },
  url: `${config.siteUrl}/about/`,
  sameAs: [config.github, config.linkedin, config.facebook].filter(Boolean),
};

export const website = {
  '@type': 'WebSite',
  '@id': `${config.siteUrl}/#website`,
  url: config.siteUrl,
  name: config.title,
  description: config.description,
  inLanguage: config.lang,
  author: { '@id': person['@id'] },
};

export const jsonLd = (data: Record<string, unknown>) =>
  JSON.stringify({ '@context': 'https://schema.org', ...data });
