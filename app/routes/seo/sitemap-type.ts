import type { Route } from "./+types/sitemap-type";

export async function loader({
    request,
    params,
    context: { storefront },
}: Route.LoaderArgs) {
    const type = params.type;

    if (!type) {
        throw new Response("No type provided", { status: 404 });
    }

    // Get counts based on type
    let count = 0;

    try {
        switch (type) {
            case "products": {
                const data = await storefront.query(PRODUCTS_COUNT_QUERY);
                count = data.search.totalCount;
                break;
            }
            case "collections": {
                const data = await storefront.query(COLLECTIONS_COUNT_QUERY);
                count = data.collections.totalCount;
                break;
            }
            case "pages": {
                const data = await storefront.query(PAGES_QUERY);
                count = data.pages.nodes.length;
                break;
            }
            case "blogs": {
                const data = await storefront.query(BLOGS_COUNT_QUERY);
                count = data.blogs.nodes.length;
                break;
            }
            default:
                throw new Response("Invalid type", { status: 404 });
        }
    } catch (error) {
        console.error(`Error fetching count for ${type}:`, error);
        // Fallback or 404
        count = 0;
    }

    const PAGE_SIZE = 250;
    const pages = Math.ceil(count / PAGE_SIZE) || 1;
    const url = new URL(request.url);
    const baseUrl = url.origin;

    let sitemapLines = "";
    for (let i = 1; i <= pages; i++) {
        sitemapLines += `
  <sitemap>
    <loc>${baseUrl}/sitemap/${type}/${i}.xml</loc>
  </sitemap>`;
    }

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapLines}
</sitemapindex>`;

    return new Response(body, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": `max-age=${60 * 60 * 24}`,
        },
    });
}

const PRODUCTS_COUNT_QUERY = `#graphql
  query ProductsCount {
    search(first: 0, query: "*", types: PRODUCT) {
      totalCount
    }
  }
` as const;

const COLLECTIONS_COUNT_QUERY = `#graphql
  query CollectionsCount {
    collections(first: 0) {
      totalCount
    }
  }
` as const;

const PAGES_QUERY = `#graphql
  query PagesCount {
    pages(first: 250) {
      nodes {
        id
      }
    }
  }
` as const;

const BLOGS_COUNT_QUERY = `#graphql
  query BlogsCount {
     blogs(first: 50) {
      nodes {
        id
      }
    }
  }
` as const;
