import {
    FacebookLogoIcon,
    PinterestLogoIcon,
    XLogoIcon,
} from "@phosphor-icons/react";
import { createSchema, isBrowser } from "@weaverse/hydrogen";
import { useLoaderData, useRouteLoaderData } from "react-router";
import {
    FacebookShareButton,
    PinterestShareButton,
    TwitterShareButton,
} from "react-share";
import type { ArticleQuery } from "storefront-api.generated";
import { Image } from "~/components/image";
import { layoutInputs, Section, type SectionProps } from "~/components/section";
import { Title } from "~/components/title";
import type { RootLoader } from "~/root";

const baseArticleStyles = /* css */ `
    h1, h2, h3, h4, h5, h6, p, img {
        margin-top: 0;
        margin-bottom: 0;
    }

    h2, h3, h4, h5, h6 {
        padding-top: 1rem;
        padding-bottom: 0.5rem;
    }

    p {
        padding-bottom: 0.5rem;
        line-height: 1.5;
    }
    p:empty {
        display: none;
    }
`;

interface BlogPostProps extends SectionProps {
    ref: React.Ref<HTMLElement>;
    showTags: boolean;
    showShareButtons: boolean;
    showAuthor: boolean;
}

export default function BlogPost(props: BlogPostProps) {
    const { ref, showTags, showShareButtons, showAuthor, ...rest } = props;
    const rootData = useRouteLoaderData<RootLoader>("root");
    const { article, blog, formattedDate } = useLoaderData<{
        article: NonNullable<ArticleQuery["blog"]>["articleByHandle"];
        blog: ArticleQuery["blog"];
        formattedDate: string;
    }>();

    if (!article) {
        return <Section ref={ref} {...rest} />;
    }

    const { title, handle, image, contentHtml, author, tags } = article;
    let domain = rootData?.layout?.shop?.primaryDomain?.url;
    if (isBrowser) {
        const origin = window.location.origin;
        if (!origin.includes("localhost")) {
            domain = origin;
        }
    }
    const blogHandle = blog?.handle;
    const articleUrl = `${domain}/blogs/${blogHandle}/${handle}`;

    return (
        <Section ref={ref} {...rest}>
            {image && (
                <div className="h-[520px]">
                    <Image data={image} sizes="90vw" />
                </div>
            )}
            <div className="prose mx-auto space-y-6 pt-4 text-left lg:max-w-4xl lg:pt-16">
                <Title as="div" variant="muted" size="base">
                    {formattedDate}
                </Title>
                <Title
                    as="h1"
                    variant="primary"
                    size="4xl"
                    className="leading-snug"
                >
                    {title}
                </Title>

                {showAuthor && author?.name && (
                    <Title as="div" size="base" className="uppercase">
                        by <span>{author.name}</span>
                    </Title>
                )}

                <div className="mr-auto w-1/3 border-line-subtle border-t" />
            </div>

            <article className="prose mx-auto py-6 lg:max-w-4xl lg:py-8 lg:pb-10">
                <style> {baseArticleStyles}</style>

                <div id="article-content" className="mx-auto">
                    <div
                        suppressHydrationWarning
                        dangerouslySetInnerHTML={{ __html: contentHtml }}
                    />
                    <div className="mx-auto w-1/3 border-line-subtle border-t" />
                    <div className="flex flex-col items-center justify-between gap-2 md:flex-row">
                        <div>
                            {showTags && tags.length > 0 && (
                                <>
                                    <strong>Tags:</strong>
                                    <span className="ml-2">
                                        {tags.join(", ")}
                                    </span>
                                </>
                            )}
                        </div>
                        {showShareButtons && (
                            <div className="flex items-center gap-2">
                                <strong>Share:</strong>
                                <FacebookShareButton url={articleUrl}>
                                    <FacebookLogoIcon size={24} />
                                </FacebookShareButton>
                                {image ? (
                                    <PinterestShareButton
                                        url={articleUrl}
                                        media={image?.url}
                                    >
                                        <PinterestLogoIcon size={24} />
                                    </PinterestShareButton>
                                ) : null}
                                <TwitterShareButton
                                    url={articleUrl}
                                    title={title}
                                >
                                    <XLogoIcon size={24} />
                                </TwitterShareButton>
                            </div>
                        )}
                    </div>
                </div>
            </article>
        </Section>
    );
}

export const schema = createSchema({
    type: "blog-post",
    title: "Blog post",
    limit: 1,
    enabledOn: {
        pages: ["ARTICLE"],
    },
    settings: [
        {
            group: "Layout",
            inputs: layoutInputs.filter(
                (input) => input.name !== "borderRadius",
            ),
        },
        {
            group: "Article",
            inputs: [
                {
                    type: "switch",
                    label: "Show tags",
                    name: "showTags",
                    defaultValue: true,
                },
                {
                    type: "switch",
                    label: "Show share buttons",
                    name: "showShareButtons",
                    defaultValue: true,
                },
                {
                    type: "switch",
                    label: "Show author",
                    name: "showAuthor",
                    defaultValue: true,
                },
            ],
        },
    ],
});
