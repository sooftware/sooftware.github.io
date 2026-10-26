import { graphql } from 'gatsby';
import { getSrc, getImage } from 'gatsby-plugin-image';
import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';

import { Footer } from '../components/Footer';
import SiteNav from '../components/header/SiteNav';
import Pagination from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { SeriesCard, SeriesCards } from '../components/SeriesCards';
import { SeriesTabs } from '../components/SeriesTabs';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import { inner, outer, PostFeed, Posts, SectionTitle, SiteMain, SiteNavMain } from '../styles/shared';
import { jsonLd, person, website } from '../structured-data';
import config from '../website-config';
import { PageContext } from './post';

export interface IndexProps {
  pageContext: {
    currentPage: number;
    numPages: number;
    seriesCards: SeriesCard[];
  };
  data: {
    logo: any;
    header: any;
    allMarkdownRemark: {
      edges: Array<{
        node: PageContext;
      }>;
    };
    seriesCovers: {
      nodes: Array<{
        fields: { slug: string };
        frontmatter: { image: any };
      }>;
    };
  };
}

const IndexPage: React.FC<IndexProps> = props => {
  const width = getImage(props.data.header)?.width;
  const height = getImage(props.data.header)?.height;
  // filter out drafts in production
  const posts = props.data.allMarkdownRemark.edges.filter(
    post => post.node.frontmatter.draft !== true || process.env.NODE_ENV !== 'production',
  );
  // the newest post is shown large on the first page only
  const featured = props.pageContext.currentPage === 1 ? posts[0] : undefined;
  const rest = featured ? posts.slice(1) : posts;
  const covers = Object.fromEntries(
    props.data.seriesCovers.nodes.map(node => [node.fields.slug, node.frontmatter.image]),
  );

  return (
    <IndexLayout>
      <Helmet>
        <html lang={config.lang} />
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <meta property="og:site_name" content={config.title} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={config.title} />
        <meta property="og:description" content={config.description} />
        <meta property="og:url" content={config.siteUrl} />
        <meta property="og:image" content={`${config.siteUrl}${getSrc(props.data.header)}`} />
        {config.facebook && <meta property="article:publisher" content={config.facebook} />}
        {config.googleSiteVerification && (
          <meta name="google-site-verification" content={config.googleSiteVerification} />
        )}
        {config.naverSiteVerification && (
          <meta name="naver-site-verification" content={config.naverSiteVerification} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={config.title} />
        <meta name="twitter:description" content={config.description} />
        <meta name="twitter:url" content={config.siteUrl} />
        <meta name="twitter:image" content={`${config.siteUrl}${getSrc(props.data.header)}`} />
        {config.twitter && (
          <meta
            name="twitter:site"
            content={`@${config.twitter.split('https://twitter.com/')[1]}`}
          />
        )}
        <meta property="og:image:width" content={width?.toString()} />
        <meta property="og:image:height" content={height?.toString()} />
        <script type="application/ld+json">
          {jsonLd({ '@graph': [website, person] })}
        </script>
      </Helmet>
      <Wrapper>
        <header css={[outer, SiteNavMain]}>
          <div css={inner}>
            <SiteNav isHome />
          </div>
        </header>
        <main id="site-main" css={[SiteMain, outer]}>
          <div css={[inner, Posts]}>
            {featured && (
              <section css={Hero}>
                <PostCard post={featured.node} large />
              </section>
            )}
            <SectionTitle>전체 글</SectionTitle>
            <SeriesTabs />
            <div css={[PostFeed]}>
              {rest.map(post => (
                <PostCard key={post.node.fields.slug} post={post.node} />
              ))}
            </div>
            {props.pageContext.numPages > 1 && (
              <Pagination
                currentPage={props.pageContext.currentPage}
                numPages={props.pageContext.numPages}
              />
            )}
            {featured && (
              <section css={SeriesSection}>
                <SeriesCards title="시리즈" cards={props.pageContext.seriesCards} covers={covers} />
              </section>
            )}
          </div>
        </main>
        {props.children}
        <Footer />
      </Wrapper>
    </IndexLayout>
  );
};

export const pageQuery = graphql`
  query blogPageQuery($skip: Int!, $limit: Int!, $coverSlugs: [String]) {
    logo: file(relativePath: { eq: "img/ghost-logo.png" }) {
      childImageSharp {
        gatsbyImageData(layout: FIXED)
      }
    }
    header: file(relativePath: { eq: "img/site/banner4.png" }) {
      childImageSharp {
        gatsbyImageData(width: 2000, quality: 100, layout: FIXED)
      }
    }
    seriesCovers: allMarkdownRemark(filter: { fields: { slug: { in: $coverSlugs } } }) {
      nodes {
        fields {
          slug
        }
        frontmatter {
          image {
            childImageSharp {
              gatsbyImageData(width: 400, height: 400, layout: CONSTRAINED)
            }
          }
        }
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { ne: true }, layout: { ne: "page" } } }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          ...PostCardFields
        }
      }
    }
  }
`;

const SeriesSection = css`
  padding-bottom: 120px;

  @media (max-width: 650px) {
    padding-bottom: 80px;
  }
`;

const Hero = css`
  padding: 120px 0 96px;

  @media (max-width: 650px) {
    padding: 88px 0 56px;
  }
`;

export default IndexPage;
