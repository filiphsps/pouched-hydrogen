import { describe, expect, it } from "vitest";
import { parseBadgeHtml, parseJudgemeWidgetHTML } from "./judgeme";

describe("parseJudgemeWidgetHTML", () => {
    describe("averageRating extraction", () => {
        it("should extract average rating from widget HTML", () => {
            const html = `<div class="jdgm-rev-widg" data-average-rating="4.5"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.averageRating).toBe(4.5);
        });

        it("should handle integer ratings", () => {
            const html = `<div class='jdgm-rev-widg' data-average-rating='5'></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.averageRating).toBe(5);
        });

        it("should return 0 when average rating is not found", () => {
            const html = `<div class="jdgm-rev-widg"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.averageRating).toBe(0);
        });

        it("should return 0 for empty HTML", () => {
            const html = "";
            const result = parseJudgemeWidgetHTML(html);
            expect(result.averageRating).toBe(0);
        });

        it("should handle rating with many decimal places", () => {
            const html = `<div class="jdgm-rev-widg" data-average-rating="4.567"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.averageRating).toBe(4.567);
        });
    });

    describe("totalReviews extraction", () => {
        it("should extract total reviews from widget HTML", () => {
            const html = `<div data-number-of-reviews="42"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.totalReviews).toBe(42);
        });

        it("should handle large review counts", () => {
            const html = `<div data-number-of-reviews='1234'></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.totalReviews).toBe(1234);
        });

        it("should return 0 when number of reviews is not found", () => {
            const html = `<div class="jdgm-rev-widg"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.totalReviews).toBe(0);
        });

        it("should return 0 for empty HTML", () => {
            const html = "";
            const result = parseJudgemeWidgetHTML(html);
            expect(result.totalReviews).toBe(0);
        });
    });

    describe("ratingDistribution extraction", () => {
        it("should extract single histogram row", () => {
            const html = `<div class="jdgm-histogram__row" data-rating="5" data-frequency="10" data-percentage="50"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.ratingDistribution).toHaveLength(1);
            expect(result.ratingDistribution[0]).toEqual({
                rating: 5,
                frequency: 10,
                percentage: 50,
            });
        });

        it("should extract multiple histogram rows", () => {
            const html = `
				<div class="jdgm-histogram__row" data-rating="5" data-frequency="10" data-percentage="50"></div>
				<div class="jdgm-histogram__row" data-rating="4" data-frequency="6" data-percentage="30"></div>
				<div class="jdgm-histogram__row" data-rating="3" data-frequency="4" data-percentage="20"></div>
			`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.ratingDistribution).toHaveLength(3);
        });

        it("should sort rating distribution by rating descending", () => {
            const html = `
				<div class="jdgm-histogram__row" data-rating="3" data-frequency="4" data-percentage="20"></div>
				<div class="jdgm-histogram__row" data-rating="5" data-frequency="10" data-percentage="50"></div>
				<div class="jdgm-histogram__row" data-rating="1" data-frequency="2" data-percentage="10"></div>
			`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.ratingDistribution[0].rating).toBe(5);
            expect(result.ratingDistribution[1].rating).toBe(3);
            expect(result.ratingDistribution[2].rating).toBe(1);
        });

        it("should return empty array when no histogram rows found", () => {
            const html = `<div class="jdgm-rev-widg"></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.ratingDistribution).toEqual([]);
        });

        it("should handle single-quoted attributes", () => {
            const html = `<div class='jdgm-histogram__row' data-rating='5' data-frequency='10' data-percentage='50'></div>`;
            const result = parseJudgemeWidgetHTML(html);
            expect(result.ratingDistribution).toHaveLength(1);
            expect(result.ratingDistribution[0].rating).toBe(5);
        });
    });

    describe("complete widget parsing", () => {
        it("should parse a complete widget with all data", () => {
            const html = `
				<div class="jdgm-rev-widg" data-average-rating="4.2" data-number-of-reviews="100">
					<div class="jdgm-histogram__row" data-rating="5" data-frequency="40" data-percentage="40"></div>
					<div class="jdgm-histogram__row" data-rating="4" data-frequency="30" data-percentage="30"></div>
					<div class="jdgm-histogram__row" data-rating="3" data-frequency="20" data-percentage="20"></div>
					<div class="jdgm-histogram__row" data-rating="2" data-frequency="5" data-percentage="5"></div>
					<div class="jdgm-histogram__row" data-rating="1" data-frequency="5" data-percentage="5"></div>
				</div>
			`;
            const result = parseJudgemeWidgetHTML(html);

            expect(result.averageRating).toBe(4.2);
            expect(result.totalReviews).toBe(100);
            expect(result.ratingDistribution).toHaveLength(5);
            expect(result.ratingDistribution[0].rating).toBe(5);
            expect(result.ratingDistribution[4].rating).toBe(1);
        });

        it("should handle widget with only rating data", () => {
            const html = `<div class="jdgm-rev-widg" data-average-rating="3.8" data-number-of-reviews="25"></div>`;
            const result = parseJudgemeWidgetHTML(html);

            expect(result.averageRating).toBe(3.8);
            expect(result.totalReviews).toBe(25);
            expect(result.ratingDistribution).toEqual([]);
        });
    });
});

describe("parseBadgeHtml", () => {
    describe("totalReviews extraction", () => {
        it("should extract total reviews from badge HTML", () => {
            const html = `<span data-number-of-reviews="15"></span>`;
            const result = parseBadgeHtml(html);
            expect(result.totalReviews).toBe(15);
        });

        it("should return 0 when number of reviews is not found", () => {
            const html = `<span></span>`;
            const result = parseBadgeHtml(html);
            expect(result.totalReviews).toBe(0);
        });

        it("should handle large review counts", () => {
            const html = `<span data-number-of-reviews="9999"></span>`;
            const result = parseBadgeHtml(html);
            expect(result.totalReviews).toBe(9999);
        });
    });

    describe("averageRating extraction", () => {
        it("should extract average rating from badge HTML", () => {
            const html = `<span data-average-rating="4.8"></span>`;
            const result = parseBadgeHtml(html);
            expect(result.averageRating).toBe(4.8);
        });

        it("should return 0 when average rating is not found", () => {
            const html = `<span></span>`;
            const result = parseBadgeHtml(html);
            expect(result.averageRating).toBe(0);
        });

        it("should handle integer ratings", () => {
            const html = `<span data-average-rating="5"></span>`;
            const result = parseBadgeHtml(html);
            expect(result.averageRating).toBe(5);
        });
    });

    describe("badge HTML preservation", () => {
        it("should preserve original badge HTML", () => {
            const html = `<span class="star-badge" data-average-rating="4.5" data-number-of-reviews="100">★★★★☆</span>`;
            const result = parseBadgeHtml(html);
            expect(result.badge).toBe(html);
        });

        it("should preserve empty HTML", () => {
            const html = "";
            const result = parseBadgeHtml(html);
            expect(result.badge).toBe("");
        });
    });

    describe("complete badge parsing", () => {
        it("should parse complete badge with all data", () => {
            const html = `<span class="jdgm-preview-badge" data-average-rating="4.3" data-number-of-reviews="75">Stars HTML here</span>`;
            const result = parseBadgeHtml(html);

            expect(result.totalReviews).toBe(75);
            expect(result.averageRating).toBe(4.3);
            expect(result.badge).toBe(html);
        });

        it("should handle single-quoted attributes", () => {
            const html = `<span data-average-rating='3.9' data-number-of-reviews='42'></span>`;
            const result = parseBadgeHtml(html);

            expect(result.totalReviews).toBe(42);
            expect(result.averageRating).toBe(3.9);
        });

        it("should handle mixed quote styles", () => {
            const html = `<span data-average-rating="4.1" data-number-of-reviews='33'></span>`;
            const result = parseBadgeHtml(html);

            expect(result.totalReviews).toBe(33);
            expect(result.averageRating).toBe(4.1);
        });
    });
});
