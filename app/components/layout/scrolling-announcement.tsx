import { useThemeSettings } from "@weaverse/hydrogen";
import { useEffect } from "react";

const MAX_DURATION = 20;

export function ScrollingAnnouncement() {
    const themeSettings = useThemeSettings();
    const {
        topbarText,
        topbarHeight,
        topbarTextColor,
        topbarBgColor,
        topbarScrollingGap,
        topbarScrollingSpeed,
    } = themeSettings;

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
    useEffect(() => {
        // Initialize the variable once
        document.body.style.setProperty("--topbar-height", `${topbarHeight}px`);
    }, [topbarHeight, topbarText]);

    if (topbarText?.replace(/<[^>]*>/g, "").trim() === "") {
        return null;
    }

    return (
        <div
            id="announcement-bar"
            className="relative flex items-center overflow-hidden whitespace-nowrap text-center"
            style={
                {
                    height: `${topbarHeight}px`,
                    backgroundColor: topbarBgColor,
                    color: topbarTextColor,
                    "--marquee-duration": `${MAX_DURATION / topbarScrollingSpeed}s`,
                    "--gap": `${topbarScrollingGap}px`,
                } as React.CSSProperties
            }
        >
            {new Array(10).fill("").map((_, idx) => (
                <div
                    className="animate-marquee px-[calc(var(--gap)/2)] [animation-duration:var(--marquee-duration)]"
                    key={idx}
                >
                    <div
                        className="flex items-center gap-(--gap) whitespace-nowrap [&_p]:flex [&_p]:items-center [&_p]:gap-2"
                        dangerouslySetInnerHTML={{ __html: topbarText }}
                    />
                </div>
            ))}
        </div>
    );
}
