/* eslint-disable @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-var-requires */
const path = require('path');
const _ = require('lodash');
const seriesList = require('./src/series.json');

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  // Sometimes, optional fields tend to get not picked up by the GraphQL
  // interpreter if not a single content uses it. Therefore, we're putting them
  // through `createNodeField` so that the fields still exist and GraphQL won't
  // trip up. An empty string is still required in replacement to `null`.
  // eslint-disable-next-line default-case
  switch (node.internal.type) {
    case 'MarkdownRemark': {
      const { permalink, layout, primaryTag } = node.frontmatter;
      const { relativePath } = getNode(node.parent);

      let slug = permalink;

      if (!slug) {
        slug = `/${relativePath.replace('.md', '')}/`;
      }

      // Used to generate URL to view this content.
      createNodeField({
        node,
        name: 'slug',
        value: slug || '',
      });

      // Used to determine a page layout.
      createNodeField({
        node,
        name: 'layout',
        value: layout || '',
      });

      createNodeField({
        node,
        name: 'primaryTag',
        value: primaryTag || '',
      });
    }
  }
};

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const result = await graphql(`{
  allMarkdownRemark(
    limit: 2000
    sort: {fields: [frontmatter___date], order: ASC}
    filter: {frontmatter: {draft: {ne: true}}}
  ) {
    edges {
      node {
        excerpt
        frontmatter {
          title
          tags
          date
          draft
          excerpt
          series
          image {
            childImageSharp {
              gatsbyImageData(placeholder: BLURRED, layout: FULL_WIDTH)
            }
          }
          author {
            id
            bio
            avatar {
              childImageSharp {
                gatsbyImageData(placeholder: BLURRED, layout: FULL_WIDTH)
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
    }
  }
  allAuthorYaml {
    edges {
      node {
        id
      }
    }
  }
}
`);

  if (result.errors) {
    console.error(result.errors);
    throw new Error(result.errors);
  }

  // Create post pages
  // Markdown with `layout: page` (e.g. about.md) becomes a standalone page,
  // not a blog post — keep it out of the post list and prev/next links.
  const isPage = ({ node }) => node.fields.layout === 'page';
  const posts = result.data.allMarkdownRemark.edges.filter(edge => !isPage(edge));

  result.data.allMarkdownRemark.edges.filter(isPage).forEach(({ node }) => {
    createPage({
      path: node.fields.slug,
      component: path.resolve('./src/templates/page.tsx'),
      context: { slug: node.fields.slug },
    });
  });

  // Create paginated index
  const postsPerPage = 10;
  const numPages = Math.ceil(posts.length / postsPerPage);

  // Series cards on the home page: post count + the newest post with a cover image
  const newestFirst = [...posts].reverse();
  const seriesCards = seriesList.map(({ name, slug }) => {
    const inSeries = newestFirst.filter(({ node }) => node.frontmatter.series === name);
    const cover = inSeries.find(({ node }) => node.frontmatter.image);
    return { slug, count: inSeries.length, coverSlug: cover ? cover.node.fields.slug : '' };
  });
  const coverSlugs = seriesCards.map(card => card.coverSlug).filter(Boolean);

  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: i === 0 ? '/' : `/${i + 1}/`,
      component: path.resolve('./src/templates/index.tsx'),
      context: {
        limit: postsPerPage,
        skip: i * postsPerPage,
        numPages,
        currentPage: i + 1,
        seriesCards,
        coverSlugs,
      },
    });
  });

  // Create paginated series pages (series list: src/series.json)
  seriesList.forEach(({ name: series, slug }) => {
    const count = posts.filter(({ node }) => node.frontmatter.series === series).length;
    const seriesPages = Math.max(1, Math.ceil(count / postsPerPage));
    Array.from({ length: seriesPages }).forEach((_, i) => {
      createPage({
        path: i === 0 ? `/series/${slug}/` : `/series/${slug}/${i + 1}/`,
        component: path.resolve('./src/templates/series.tsx'),
        context: {
          series,
          slug,
          limit: postsPerPage,
          skip: i * postsPerPage,
          numPages: seriesPages,
          currentPage: i + 1,
        },
      });
    });
  });

  posts.forEach(({ node }, index) => {
    const { slug, layout } = node.fields;
    const prev = index === 0 ? null : posts[index - 1].node;
    const next = index === posts.length - 1 ? null : posts[index + 1].node;

    createPage({
      path: slug,
      // This will automatically resolve the template to a corresponding
      // `layout` frontmatter in the Markdown.
      //
      // Feel free to set any `layout` as you'd like in the frontmatter, as
      // Feel free to set any `layout` as you'd like in the frontmatter, as
      // long as the corresponding template file exists in src/templates.
      // If no template is set, it will fall back to the default `post`
      // template.
      //
      // Note that the template has to exist first, or else the build will fail.
      component: path.resolve(`./src/templates/${layout || 'post'}.tsx`),
      context: {
        // Data passed to context is available in page queries as GraphQL variables.
        slug,
        prev,
        next,
        primaryTag: node.frontmatter.tags ? node.frontmatter.tags[0] : '',
      },
    });
  });

  // Create tag pages
  const tagTemplate = path.resolve('./src/templates/tags.tsx');
  const tags = _.uniq(
    _.flatten(
      result.data.allMarkdownRemark.edges.map(edge => _.castArray(_.get(edge, 'node.frontmatter.tags', []))),
    ),
  );
  tags.forEach(tag => {
    createPage({
      path: `/tags/${_.kebabCase(tag)}/`,
      component: tagTemplate,
      context: {
        tag,
      },
    });
  });

  // Create author pages
  const authorTemplate = path.resolve('./src/templates/author.tsx');
  result.data.allAuthorYaml.edges.forEach(edge => {
    createPage({
      path: `/author/${_.kebabCase(edge.node.id)}/`,
      component: authorTemplate,
      context: {
        author: edge.node.id,
      },
    });
  });
};

exports.onCreateWebpackConfig = ({ stage, actions, loaders }) => {
  // adds sourcemaps for tsx in dev mode
  if (stage === 'develop' || stage === 'develop-html') {
    actions.setWebpackConfig({
      devtool: 'eval-source-map',
    });
  }

  // firebase is only used in the browser (comments); keep its node build out of the SSR bundle
  if (stage === 'build-html' || stage === 'develop-html') {
    actions.setWebpackConfig({
      module: {
        rules: [{ test: /[\\/]node_modules[\\/](firebase|@firebase)[\\/]/, use: loaders.null() }],
      },
    });
  }
};

// llms.txt (https://llmstxt.org): a plain-text map of the blog for AI answer engines.
exports.onPostBuild = async ({ graphql }) => {
  const fs = require('fs');
  const { data } = await graphql(`{
    site { siteMetadata { title description siteUrl } }
    allMarkdownRemark(
      filter: {frontmatter: {draft: {ne: true}, layout: {ne: "page"}}}
      sort: {fields: [frontmatter___date], order: DESC}
    ) {
      nodes {
        excerpt(pruneLength: 140)
        fields { slug }
        frontmatter { title excerpt series }
      }
    }
  }`);
  const { title, description, siteUrl } = data.site.siteMetadata;
  const line = node => {
    const summary = (node.frontmatter.excerpt || node.excerpt).replace(/\s+/g, ' ').trim();
    return `- [${node.frontmatter.title}](${siteUrl}${node.fields.slug}): ${summary}`;
  };

  const sections = seriesList
    .map(series => {
      const posts = data.allMarkdownRemark.nodes.filter(node => node.frontmatter.series === series.name);
      return posts.length ? `## ${series.name}\n\n${series.description}\n\n${posts.map(line).join('\n')}` : '';
    })
    .filter(Boolean);
  const others = data.allMarkdownRemark.nodes.filter(
    node => !seriesList.some(series => series.name === node.frontmatter.series),
  );
  if (others.length) {
    sections.push(`## 기타\n\n${others.map(line).join('\n')}`);
  }

  const text = [
    `# ${title}`,
    `> ${description}. 당근(Karrot) ML Engineer 김수환(Soohwan Kim, sooftware)의 블로그로, 음성인식·자연어처리·LLM·AI 에이전트에 대한 글을 한국어로 씁니다.`,
    `## 저자\n\n- [About](${siteUrl}/about/): 경력과 프로젝트 소개 (English: ${siteUrl}/about/en/)\n- [GitHub](https://github.com/sooftware)`,
    ...sections,
  ].join('\n\n');
  fs.writeFileSync(path.join(__dirname, 'public', 'llms.txt'), `${text}\n`);
};
