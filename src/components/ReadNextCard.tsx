import { Link } from 'gatsby';
import React from 'react';
import styled from '@emotion/styled';
import * as _ from 'lodash';

import { colors } from '../styles/colors';
import { format } from 'date-fns';

export interface ReadNextProps {
  tags: string[];
  currentPageSlug: string;
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
          readingTime?: {
            text: string;
          };
        };
      };
    }>;
  };
}

export const ReadNextCard: React.FC<ReadNextProps> = props => {
  // filter out current post and limit to 3 related posts
  const relatedPosts = props.relatedPosts.edges
    .filter(post => post.node.fields.slug !== props.currentPageSlug)
    .slice(0, 3);

  return (
    <ReadNextCardArticle className="read-next-card">
      <header className="read-next-card-header">
        <ReadNextCardHeaderTitle>
          <span>More in</span>{' '}
          <Link to={`/tags/${_.kebabCase(props.tags[0])}/`}>{props.tags[0]}</Link>
        </ReadNextCardHeaderTitle>
      </header>
      <ReadNextCardContent className="read-next-card-content">
        <ul>
          {relatedPosts.map(n => {
            const date = new Date(n.node.frontmatter.date);
            // 2018-08-20
            const datetime = format(date, 'yyyy-MM-dd');
            // 20 AUG 2018
            const displayDatetime = format(date, 'yyyy년 M월 d일');
            return (
              <li key={n.node.frontmatter.title}>
                <h4>
                  <Link to={n.node.fields.slug}>{n.node.frontmatter.title}</Link>
                </h4>
                <ReadNextCardMeta className="read-next-card-meta">
                  <p>
                    <time dateTime={datetime}>{displayDatetime}</time> &middot; {n.node.fields.readingTime?.text}
                  </p>
                </ReadNextCardMeta>
              </li>
            );
          })}
        </ul>
      </ReadNextCardContent>
      <ReadNextCardFooter className="read-next-card-footer">
        <Link to={`/tags/${_.kebabCase(props.tags[0])}/`}>
          {props.relatedPosts.totalCount > 1 && `See all ${props.relatedPosts.totalCount} posts`}
          {props.relatedPosts.totalCount === 1 && '1 post'}
          {props.relatedPosts.totalCount === 0 && 'No posts'} →
        </Link>
      </ReadNextCardFooter>
    </ReadNextCardArticle>
  );
};

const ReadNextCardArticle = styled.article`
  padding: 24px;
  background: ${colors.surface};
  border-radius: 16px;

  a:hover {
    text-decoration: none;
  }

  @media (prefers-color-scheme: dark) {
    background: ${colors.darkSurface};
  }
`;

const ReadNextCardHeaderTitle = styled.h3`
  margin: 0;
  color: ${colors.subtle};
  font-size: 1.5rem;
  line-height: 1.5;
  font-weight: 500;

  a {
    color: ${colors.accent};
    font-weight: 600;
  }

  @media (prefers-color-scheme: dark) {
    color: ${colors.darkSubtle};
  }
`;

const ReadNextCardContent = styled.div`
  ul {
    margin: 12px 0 0;
    padding: 0;
    list-style: none;
  }

  li {
    margin: 0;
    padding: 10px 0;
  }

  h4 {
    margin: 0;
    font-size: 1.6rem;
    line-height: 1.5;
    font-weight: 600;
  }

  li a {
    color: ${colors.body};
  }

  li a:hover {
    color: ${colors.accentBright};
  }

  @media (prefers-color-scheme: dark) {
    li a {
      color: ${colors.darkText};
    }

    li a:hover {
      color: ${colors.darkAccent};
    }
  }
`;

const ReadNextCardMeta = styled.div`
  margin-top: 2px;
  font-size: 1.3rem;

  p {
    margin: 0;
    color: ${colors.faint};
  }
`;

const ReadNextCardFooter = styled.footer`
  margin-top: 12px;

  a {
    color: ${colors.subtle};
    font-size: 1.4rem;
    font-weight: 600;
  }

  a:hover {
    color: ${colors.accentBright};
  }

  @media (prefers-color-scheme: dark) {
    a:hover {
      color: ${colors.darkAccent};
    }
  }
`;
