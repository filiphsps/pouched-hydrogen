import type { Route } from "./+types/sitemap-page";

export async function loader({
    request,
    params,
    context: { storefront },
}: Route.LoaderArgs) {
    const response = await generateSitemap({
        storefront,
        request,
        params,
    });

    response.headers.set("Cache-Control", `max-age=${60 * 60 * 24}`);

    return response;
}

async function generateSitemap({
    storefront,
    request,
    params,
}: {
    storefront: any;
    request: Request;
    params: any;
}) {
    const { type } = params;
    const url = new URL(request.url);
    const baseUrl = url.origin;
    const limit = 250;

    const items: Array<{
        loc: string;
        lastmod: string;
        changefreq: string;
        priority: string;
    }> = [];

    try {
        if (type === "products") {
            const data = await storefront.query(PRODUCTS_QUERY, {
                variables: { first: limit },
            });

            for (const node of data.products.nodes) {
                items.push({
                    loc: `${baseUrl}/products/${node.handle}`,
                    lastmod: node.updatedAt,
                    changefreq: "daily",
                    priority: "0.8",
                });
            }
        } else if (type === "collections") {
            const data = await storefront.query(COLLECTIONS_QUERY, {
                variables: { first: limit },
            });
            for (const node of data.collections.nodes) {
                items.push({
                    loc: `${baseUrl}/collections/${node.handle}`,
                    lastmod: node.updatedAt,
                    changefreq: "daily",
                    priority: "0.8",
                });
            }
        } else if (type === "pages") {
            const data = await storefront.query(PAGES_QUERY, {
                variables: { first: limit },
            });
            for (const node of data.pages.nodes) {
                items.push({
                    loc: `${baseUrl}/pages/${node.handle}`,
                    lastmod: node.updatedAt,
                    changefreq: "weekly",
                    priority: "0.5",
                });
            }
        } else if (type === "blogs") {
            const data = await storefront.query(BLOGS_QUERY, {
                variables: { first: 10 },
            });

            for (const blog of data.blogs.nodes) {
                for (const article of blog.articles.nodes) {
                    items.push({
                        loc: `${baseUrl}/blogs/${blog.handle}/${article.handle}`,
                        lastmod: article.publishedAt,
                        changefreq: "weekly",
                        priority: "0.6",
                    });
                }
            }
        }
    } catch (error) {
        console.error(`Error generating sitemap for type ${type}:`, error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${items
      .map(
          (item) => `
  <url>
    <loc>${item.loc}</loc>
    <lastmod>${item.lastmod}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>
`,
      )
      .join("")}
</urlset>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}

const PRODUCTS_QUERY = `#graphql
  query SitemapProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;

const COLLECTIONS_QUERY = `#graphql
  query SitemapCollections($first: Int, $after: String) {
    collections(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;

const PAGES_QUERY = `#graphql
  query SitemapPages($first: Int, $after: String) {
    pages(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        handle
        updatedAt
      }
    }
  }
` as const;

const BLOGS_QUERY = `#graphql
  query SitemapBlogs($first: Int, $after: String) {
    blogs(first: $first, after: $after) {
      nodes {
        handle
        articles(first: 250) {
            nodes {
                handle
                publishedAt
            }
        }
      }
    }
  }
` as const;
