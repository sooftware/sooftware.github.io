import { format } from 'date-fns';
import { graphql, Link } from 'gatsby';
import { GatsbyImage, getSrc, getImage } from 'gatsby-plugin-image';
import * as _ from 'lodash';
import React from 'react';
import { Helmet } from 'react-helmet';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { Comments } from '../components/Comments';
import { Footer } from '../components/Footer';
import SiteNav, { SiteNavMain } from '../components/header/SiteNav';
import PostContent from '../components/PostContent';
import { ReadNext } from '../components/ReadNext';
import { Subscribe } from '../components/subscribe/Subscribe';
import { Wrapper } from '../components/Wrapper';
import IndexLayout from '../layouts';
import { colors } from '../styles/colors';
import { inner, outer, SiteMain } from '../styles/shared';
import { jsonLd, person, website } from '../structured-data';
import config from '../website-config';

export interface Author {
  id: string;
  bio: string;
  avatar: any;
}

interface PageTemplateProps {
  location: Location;
  data: {
    logo: {
      childImageSharp: {
        fixed: any;
      };
    };
    markdownRemark: {
      html: string;
      htmlAst: any;
      excerpt: string;
      frontmatter: {
        title: string;
        date: string;
        userDate: string;
        image: any;
        excerpt: string;
        tags: string[];
        series?: string;
        author: Author[];
      };
      fields: {
        slug: string;
        readingTime: {
          text: string;
        };
      };
    };
    relatedPosts: {
      totalCount: number;
      edges: Array<{
        node: {
          timeToRead: number;
          frontmatter: {
            title: string;
            date: string;
          };
          fields: {
            slug: string;
          };
        };
      }>;
    };
  };
  pageContext: {
    prev: PageContext;
    next: PageContext;
  };
}

export interface PageContext {
  excerpt: string;
  fields: {
    slug: string;
    readingTime: {
      text: string;
    };
  };
  frontmatter: {
    image: any;
    excerpt: string;
    title: string;
    date: string;
    draft?: boolean;
    tags: string[];
    series?: string;
    author: Author[];
  };
}

const PageTemplate = ({ data, pageContext, location }: PageTemplateProps) => {
  const post = data.markdownRemark;
  let width: number | undefined;
  let height: number | undefined;
  if (post.frontmatter.image) {
    width = getImage(post.frontmatter.image)?.width;
    height = getImage(post.frontmatter.image)?.height;
  }

  const series = config.series.find(item => item.name === post.frontmatter.series);

  const date = new Date(post.frontmatter.date);
  // 2018-08-20
  const datetime = format(date, 'yyyy-MM-dd');
  // 2018년 8월 20일
  const displayDatetime = format(date, 'yyyy년 M월 d일');

  return (
    <IndexLayout className="post-template">
      <Helmet>
        <html lang={config.lang} />
        <title>{post.frontmatter.title}</title>

        <meta name="description" content={post.frontmatter.excerpt || post.excerpt} />
        <meta property="og:site_name" content={config.title} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.frontmatter.title} />
        <meta property="og:description" content={post.frontmatter.excerpt || post.excerpt} />
        <meta property="og:url" content={config.siteUrl + location.pathname} />
        {post.frontmatter.image && (
          <meta
            property="og:image"
            content={`${config.siteUrl}${getSrc(post.frontmatter.image)}`}
          />
        )}
        <meta property="article:published_time" content={post.frontmatter.date} />
        {/* not sure if modified time possible */}
        {/* <meta property="article:modified_time" content="2018-08-20T15:12:00.000Z" /> */}
        {post.frontmatter.tags && (
          <meta property="article:tag" content={post.frontmatter.tags[0]} />
        )}

        {config.facebook && <meta property="article:publisher" content={config.facebook} />}
        {config.facebook && <meta property="article:author" content={config.facebook} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.frontmatter.title} />
        <meta name="twitter:description" content={post.frontmatter.excerpt || post.excerpt} />
        <meta name="twitter:url" content={config.siteUrl + location.pathname} />
        {post.frontmatter.image && (
          <meta
            name="twitter:image"
            content={`${config.siteUrl}${getSrc(post.frontmatter.image)}`}
          />
        )}
        <meta name="twitter:label1" content="Written by" />
        <meta name="twitter:data1" content={post.frontmatter.author[0].id} />
        <meta name="twitter:label2" content="Filed under" />
        {post.frontmatter.tags && <meta name="twitter:data2" content={post.frontmatter.tags[0]} />}
        {config.twitter && (
          <meta
            name="twitter:site"
            content={`@${config.twitter.split('https://twitter.com/')[1]}`}
          />
        )}
        {config.twitter && (
          <meta
            name="twitter:creator"
            content={`@${config.twitter.split('https://twitter.com/')[1]}`}
          />
        )}
        {width && <meta property="og:image:width" content={width?.toString()} />}
        {height && <meta property="og:image:height" content={height?.toString()} />}
        <script type="application/ld+json">
          {jsonLd({
            '@type': 'BlogPosting',
            headline: post.frontmatter.title,
            description: post.frontmatter.excerpt || post.excerpt,
            datePublished: post.frontmatter.date,
            dateModified: post.frontmatter.date,
            url: config.siteUrl + location.pathname,
            mainEntityOfPage: config.siteUrl + location.pathname,
            ...(post.frontmatter.image && {
              image: `${config.siteUrl}${getSrc(post.frontmatter.image)}`,
            }),
            ...(post.frontmatter.tags?.length && { keywords: post.frontmatter.tags.join(', ') }),
            inLanguage: config.lang,
            author: person,
            publisher: { '@id': person['@id'] },
            isPartOf: { '@id': website['@id'] },
          })}
        </script>
      </Helmet>
      <Wrapper css={PostTemplate}>
        <header className="site-header">
          <div css={[outer, SiteNavMain]}>
            <div css={inner}>
              <SiteNav isPost post={post.frontmatter} />
            </div>
          </div>
        </header>
        <main id="site-main" className="site-main" css={[SiteMain, outer]}>
          <div css={inner}>
            {/* TODO: no-image css tag? */}
            <article css={[PostFull, !post.frontmatter.image && NoImage]}>
              {post.frontmatter.image && (
                <PostFullImage>
                  <GatsbyImage
                    image={getImage(post.frontmatter.image)!}
                    style={{ height: '100%' }}
                    alt={post.frontmatter.title} />
                </PostFullImage>
              )}
              <PostFullHeader className="post-full-header">
                <PostFullTags className="post-full-tags">
                  {series && (
                    <Link className="primary" to={`/series/${series.slug}/`}>
                      {series.name}
                    </Link>
                  )}
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && config.showAllTags && (
                    post.frontmatter.tags.map(tag => (
                      <React.Fragment key={tag}>
                        <Link to={`/tags/${_.kebabCase(tag)}/`}>{tag}</Link>
                      </React.Fragment>
                    ))
                  )}
                  {post.frontmatter.tags && post.frontmatter.tags.length > 0 && !config.showAllTags && (
                    <Link to={`/tags/${_.kebabCase(post.frontmatter.tags[0])}/`}>
                      {post.frontmatter.tags[0]}
                    </Link>
                  )}
                </PostFullTags>
                <PostFullTitle className="post-full-title">{post.frontmatter.title}</PostFullTitle>
                {post.frontmatter.excerpt && (
                  <PostFullCustomExcerpt className="post-full-custom-excerpt">
                    {post.frontmatter.excerpt}
                  </PostFullCustomExcerpt>
                )}
                <PostFullByline className="post-full-byline">
                  {post.frontmatter.author.map(author => (
                    <Link key={author.id} to="/about/">
                      {author.id}
                    </Link>
                  ))}
                  <span className="bull">&middot;</span>
                  <time dateTime={datetime}>{displayDatetime}</time>
                  <span className="bull">&middot;</span>
                  <span>{post.fields.readingTime.text}</span>
                </PostFullByline>
              </PostFullHeader>

              <PostContent htmlAst={post.htmlAst} />

              {/* The big email subscribe modal content */}
              {config.showSubscribe && <Subscribe title={config.title} />}
            </article>

            {config.firebase && <Comments slug={post.fields.slug} />}
          </div>
        </main>

        <ReadNext
          currentPageSlug={location.pathname}
          tags={post.frontmatter.tags}
          relatedPosts={data.relatedPosts}
          pageContext={pageContext}
        />

        <Footer />
      </Wrapper>
    </IndexLayout>
  );
};

const PostTemplate = css`
  .site-main {
    margin-top: 60px;
    background: #fff;
    padding-bottom: 120px;
  }

  @media (prefers-color-scheme: dark) {
    .site-main {
      background: ${colors.darkmode};
    }
  }
`;

export const PostFull = css`
  position: relative;
  z-index: 50;
`;

export const NoImage = css`
  .post-full-content {
    padding-top: 0;
  }
`;

export const PostFullHeader = styled.header`
  position: relative;
  margin: 0 auto;
  padding: 36px 0 48px;
  max-width: 700px;

  @media (max-width: 500px) {
    padding: 28px 0 32px;
  }
`;

const PostFullTags = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;

  a {
    padding: 2px 10px;
    color: ${colors.subtle};
    font-size: 1.3rem;
    font-weight: 600;
    line-height: 1.6;
    background: ${colors.surface};
    border-radius: 8px;
  }

  a.primary {
    color: ${colors.accentInk};
    background: ${colors.accentSoft};
  }

  a:empty {
    display: none;
  }

  @media (prefers-color-scheme: dark) {
    a {
      color: ${colors.darkSubtle};
      background: ${colors.darkSurface};
    }
    a.primary {
      color: ${colors.darkAccent};
      background: ${colors.darkAccentSoft};
    }
  }
`;

const PostFullCustomExcerpt = styled.p`
  margin: 16px 0 0;
  color: ${colors.subtle};
  font-size: 1.9rem;
  line-height: 1.6;

  @media (max-width: 500px) {
    font-size: 1.7rem;
  }

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};
  }
`;

const PostFullByline = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 28px 0 0;
  color: ${colors.faint};
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;

  a {
    color: ${colors.body};
    font-weight: 600;
  }

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};

    a {
      color: ${colors.darkText};
    }
  }
`;

export const PostFullTitle = styled.h1`
  margin: 0;
  color: ${colors.body};
  font-size: 4.8rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;

  @media (max-width: 500px) {
    font-size: 3.2rem;
  }

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkText};
  }
`;

const PostFullImage = styled.figure`
  overflow: hidden;
  margin: 40px auto 0;
  max-width: 700px;
  aspect-ratio: 16 / 9;
  background: ${colors.surface};
  border-radius: 16px;

  @media (max-width: 500px) {
    margin-top: 24px;
    border-radius: 12px;
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.darkSurface};
  }
`;

export const query = graphql`query ($slug: String, $primaryTag: String) {
  logo: file(relativePath: {eq: "img/ghost-logo.png"}) {
    childImageSharp {
      gatsbyImageData(layout: FIXED)
    }
  }
  markdownRemark(fields: {slug: {eq: $slug}}) {
    html
    htmlAst
    excerpt
    fields {
      slug
      readingTime {
        text
      }
    }
    frontmatter {
      title
      userDate: date(formatString: "D MMMM YYYY")
      date
      tags
      series
      excerpt
      image {
        childImageSharp {
          gatsbyImageData(layout: FULL_WIDTH)
        }
      }
      author {
        id
        bio
        avatar {
          children {
            ... on ImageSharp {
              gatsbyImageData(layout: FULL_WIDTH, breakpoints: [40, 80, 120])
            }
          }
        }
      }
    }
  }
  relatedPosts: allMarkdownRemark(
    filter: {frontmatter: {tags: {in: [$primaryTag]}, draft: {ne: true}}}
    limit: 5
    sort: {fields: [frontmatter___date], order: DESC}
  ) {
    totalCount
    edges {
      node {
        id
        excerpt
        frontmatter {
          title
          date
        }
        fields {
          readingTime {
            text
          }
          slug
        }
      }
    }
  }
}
`;

export default PageTemplate;
