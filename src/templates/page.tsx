import { graphql, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Footer } from '../components/Footer';
import SiteNav from '../components/header/SiteNav';
import PostContent from '../components/PostContent';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import { colors } from '../styles/colors';
import { inner, outer, SiteMain, SiteNavMain } from '../styles/shared';
import { jsonLd, person } from '../structured-data';
import config from '../website-config';
import { PostFullHeader, PostFullTitle } from './post';

interface PageTemplateProps {
  data: {
    markdownRemark: {
      htmlAst: any;
      excerpt: string;
      fields: {
        slug: string;
      };
      frontmatter: {
        title: string;
        image?: any;
        lang?: string;
        translation?: string;
      };
    };
  };
}

const PageTemplate = ({ data }: PageTemplateProps) => {
  const page = data.markdownRemark;
  const { lang, translation } = page.frontmatter;
  const isEnglish = lang === 'en';

  return (
    <IndexLayout>
      <Helmet>
        <html lang={isEnglish ? 'en' : 'ko'} />
        <title>
          {page.frontmatter.title} - {config.title}
        </title>
        <meta name="description" content={page.excerpt} />
        {translation && (
          <link rel="alternate" hrefLang={isEnglish ? 'en' : 'ko'} href={config.siteUrl + page.fields.slug} />
        )}
        {translation && (
          <link rel="alternate" hrefLang={isEnglish ? 'ko' : 'en'} href={config.siteUrl + translation} />
        )}
        {translation && (
          <script type="application/ld+json">
            {jsonLd({ '@type': 'ProfilePage', url: config.siteUrl + page.fields.slug, mainEntity: person })}
          </script>
        )}
      </Helmet>
      <Wrapper css={PageStyles}>
        <header css={[outer, SiteNavMain]}>
          <div css={inner}>
            <SiteNav />
          </div>
        </header>
        <main id="site-main" className="site-main" css={[SiteMain, outer]}>
          <div css={inner}>
            <article>
              <PostFullHeader className="post-full-header">
                {page.frontmatter.image && (
                  <GatsbyImage
                    css={Avatar}
                    image={getImage(page.frontmatter.image)!}
                    alt={page.frontmatter.title}
                  />
                )}
                <TitleRow>
                  <PostFullTitle>{page.frontmatter.title}</PostFullTitle>
                  {translation && (
                    <LangLink to={translation}>{isEnglish ? '한국어' : 'English'}</LangLink>
                  )}
                </TitleRow>
                <PageActions>
                  <a className="primary" href={config.cv} download={config.cvFileName}>
                    {isEnglish ? 'Download CV' : 'CV 다운로드'}
                  </a>
                  {config.github && (
                    <a href={config.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  )}
                  {config.linkedin && (
                    <a href={config.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  )}
                </PageActions>
              </PostFullHeader>
              <PostContent htmlAst={page.htmlAst} />
            </article>
          </div>
        </main>
        <Footer />
      </Wrapper>
    </IndexLayout>
  );
};

const PageStyles = css`
  .site-main {
    margin-top: 60px;
    padding-bottom: 120px;
  }

  .post-full-header {
    padding-top: 80px;
  }
`;

const Avatar = css`
  display: block;
  margin-bottom: 28px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  transform: translateZ(0);
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;

// Korean is the default; this only links to the other language
const LangLink = styled(Link)`
  padding: 7px 14px;
  color: ${colors.subtle};
  font-size: 1.4rem;
  font-weight: 600;
  line-height: 1.4;
  border: 1px solid ${colors.line};
  border-radius: 999px;
  transition: color 0.2s ease, border-color 0.2s ease;

  :hover {
    color: ${colors.text};
    border-color: ${colors.subtle};
  }

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};
    border-color: ${colors.darkLine};

    :hover {
      color: ${colors.darkText};
    }
  }
`;

const PageActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 24px;

  a {
    padding: 9px 14px;
    color: ${colors.body};
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.4;
    background: ${colors.surface};
    border-radius: 10px;
    transition: background 0.2s ease;
  }

  a:hover {
    background: ${colors.line};
  }

  a.primary {
    color: #fff;
    background: ${colors.accent};
  }

  a.primary:hover {
    background: ${colors.accentHover};
  }

  @media (prefers-color-scheme: dark) {
    a {
      color: ${colors.darkText};
      background: ${colors.darkSurface};
    }
  }
`;

export const query = graphql`
  query ($slug: String) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      htmlAst
      excerpt
      fields {
        slug
      }
      frontmatter {
        title
        lang
        translation
        image {
          childImageSharp {
            gatsbyImageData(width: 240, height: 240, layout: CONSTRAINED)
          }
        }
      }
    }
  }
`;

export default PageTemplate;
