import type { Route } from "./+types/sitemap";

export async function loader({ request }: Route.LoaderArgs) {
    const url = new URL(request.url);
    const baseUrl = url.origin;

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap/products.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap/collections.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap/pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap/blogs.xml</loc>
  </sitemap>
</sitemapindex>`;

    return new Response(body, {
        headers: {
            "Content-Type": "application/xml",
            "Cache-Control": `max-age=${60 * 60 * 24}`,
        },
    });
}
