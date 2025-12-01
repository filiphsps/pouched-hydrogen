// Structured data generators for SEO

export function generateProductSchema(product: any, variant: any, url: string) {
    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.title,
        description: product.seo?.description || product.description,
        image: product.featuredImage?.url,
        sku: variant?.sku || "",
        brand: {
            "@type": "Brand",
            name: product.vendor,
        },
    };

    // Add offers
    if (variant) {
        schema.offers = {
            "@type": "Offer",
            url,
            priceCurrency: variant.price.currencyCode,
            price: variant.price.amount,
            availability: variant.availableForSale
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
        };

        // Add compare at price if available
        if (variant.compareAtPrice?.amount) {
            schema.offers.priceSpecification = {
                "@type": "PriceSpecification",
                price: variant.price.amount,
                priceCurrency: variant.price.currencyCode,
            };
        }
    }

    return schema;
}

export function generateBreadcrumbSchema(
    breadcrumbs: Array<{ name: string; url: string }>,
) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.name,
            item: crumb.url,
        })),
    };
}

export function generateOrganizationSchema(shopName: string, shopUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: shopName,
        url: shopUrl,
        logo: `${shopUrl}/logo.png`, // Update with actual logo URL
        sameAs: [
            // Add social media URLs here
        ],
    };
}

export function generateWebsiteSchema(shopName: string, shopUrl: string) {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: shopName,
        url: shopUrl,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${shopUrl}/search?q={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };
}
