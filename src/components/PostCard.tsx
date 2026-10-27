import { format } from 'date-fns';
import { graphql, Link } from 'gatsby';
import { GatsbyImage, getImage } from 'gatsby-plugin-image';
import _ from 'lodash';
import { lighten } from 'polished';
import React from 'react';

import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { colors } from '../styles/colors';
import { PageContext } from '../templates/post';
import config from '../website-config';

export interface PostCardProps {
  post: PageContext;
  large?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, large = false }) => {
  const date = new Date(post.frontmatter.date);
  // 2018-08-20
  const datetime = format(date, 'yyyy-MM-dd');
  // 2018년 8월 20일
  const displayDatetime = format(date, 'yyyy년 M월 d일');
  const tags = post.frontmatter.tags
    ? config.showAllTags
      ? post.frontmatter.tags
      : post.frontmatter.tags.slice(0, 1)
    : [];
  const series = config.series.find(item => item.name === post.frontmatter.series);

  return (
    <article
      className={`post-card ${post.frontmatter.image ? '' : 'no-image'} ${
        large ? 'post-card-large' : ''
      }`}
      css={[PostCardStyles, large && PostCardLarge]}
    >
      <PostCardContent className="post-card-content">
        {(series || tags.length > 0) && (
          <PostCardTags className="post-card-primary-tag">
            {series && (
              <Link className="primary" to={`/series/${series.slug}/`}>
                {series.name}
              </Link>
            )}
            {tags.map(tag => (
              <Link key={tag} to={`/tags/${_.kebabCase(tag)}/`}>
                {tag}
              </Link>
            ))}
          </PostCardTags>
        )}
        <Link className="post-card-content-link" css={PostCardContentLink} to={post.fields.slug}>
          <PostCardTitle className="post-card-title">{post.frontmatter.title}</PostCardTitle>
          <PostCardExcerpt className="post-card-excerpt">
            {post.frontmatter.excerpt || post.excerpt}
          </PostCardExcerpt>
        </Link>
        <PostCardMeta className="post-card-meta">
          <time dateTime={datetime}>{displayDatetime}</time>
          <span>&middot;</span>
          <span>{post.fields.readingTime.text}</span>
        </PostCardMeta>
      </PostCardContent>
      {post.frontmatter.image && (
        <Link
          className="post-card-image-link"
          css={PostCardImageLink}
          to={post.fields.slug}
          tabIndex={-1}
        >
          <PostCardImage className="post-card-image">
            <GatsbyImage
              image={getImage(post.frontmatter.image)!}
              alt={`${post.frontmatter.title} cover image`}
              style={{ height: '100%' }}
            />
          </PostCardImage>
        </Link>
      )}
    </article>
  );
};

const PostCardStyles = css`
  position: relative;
  display: flex;
  align-items: center;
  gap: 32px;
  min-width: 0;

  :hover .post-card-title {
    color: ${colors.accentBright};
  }

  @media (prefers-color-scheme: dark) {
    :hover .post-card-title {
      color: ${colors.darkAccent};
    }
  }

  :hover .post-card-image img {
    transform: scale(1.04);
  }

  @media (max-width: 650px) {
    flex-direction: column-reverse;
    align-items: stretch;
    gap: 16px;
  }
`;

const PostCardLarge = css`
  gap: 56px;

  .post-card-title {
    font-size: 4rem;
    line-height: 1.35;
    -webkit-line-clamp: 3;
  }

  .post-card-excerpt {
    margin-top: 12px;
    font-size: 1.7rem;
    -webkit-line-clamp: 3;
  }

  .post-card-image-link {
    flex: 0 0 48%;
    border-radius: 16px;
  }

  .post-card-image {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }

  @media (max-width: 650px) {
    gap: 20px;

    .post-card-title {
      font-size: 2.6rem;
    }
  }
`;

const PostCardImageLink = css`
  position: relative;
  display: block;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 12px;
  transform: translateZ(0);
`;

const PostCardImage = styled.div`
  width: 228px;
  height: 128px;
  background: ${colors.surface};

  img {
    transition: transform 0.5s cubic-bezier(0.19, 1, 0.22, 1) !important;
  }

  @media (max-width: 650px) {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.darkSurface};
  }
`;

const PostCardContent = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const PostCardContentLink = css`
  display: block;

  :hover {
    text-decoration: none;
  }
`;

const PostCardTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 12px;

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

const PostCardTitle = styled.h2`
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: ${colors.text};
  font-size: 2rem;
  line-height: 1.45;
  font-weight: 700;
  letter-spacing: -0.02em;
  transition: color 0.2s ease;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkText};
  }
`;

const PostCardExcerpt = styled.p`
  display: -webkit-box;
  overflow: hidden;
  margin: 6px 0 0;
  color: ${colors.subtle};
  font-size: 1.7rem;
  line-height: 1.6;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};
  }
`;

const PostCardMeta = styled.footer`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  color: ${colors.faint};
  font-size: 1.4rem;
  font-variant-numeric: tabular-nums;

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};
  }
`;

export const StaticAvatar = css`
  display: block;
  overflow: hidden;
  margin: 0 0 0 -6px;
  width: 34px;
  height: 34px;
  border: #fff 2px solid;
  border-radius: 100%;

  @media (prefers-color-scheme: dark) {
    /* border-color: color(var(--darkgrey) l(+2%)); */
    border-color: ${lighten('0.02', colors.darkgrey)};
  }
`;

export const AuthorProfileImage = css`
  display: block;
  width: 100%;
  height: 100%;
  /* background: color(var(--lightgrey) l(+10%)); */
  background: ${lighten('0.1', colors.lightgrey)};
  border-radius: 100%;
  object-fit: cover;

  @media (prefers-color-scheme: dark) {
    background: ${colors.darkmode};
  }
`;

export const postCardFields = graphql`
  fragment PostCardFields on MarkdownRemark {
    excerpt
    frontmatter {
      title
      date
      tags
      series
      draft
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
          childImageSharp {
            gatsbyImageData(layout: FULL_WIDTH, breakpoints: [40, 80, 120])
          }
        }
      }
    }
    fields {
      readingTime {
        text
      }
      layout
      slug
    }
  }
`;
