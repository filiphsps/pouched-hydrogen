import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import { IntersectionObserverMock } from "./mocks/intersection-observer";

vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

afterEach(() => {
    cleanup();
});

// Global mocks
vi.mock("~/components/swimlane", () => import("./mocks/swimlane"));

// Swiper mocks
vi.mock("swiper/react", () => import("./mocks/swiper"));
vi.mock("swiper/modules", () => import("./mocks/swiper"));
vi.mock("swiper/css", () => ({}));
vi.mock("swiper/css/navigation", () => ({}));
vi.mock("swiper/css/pagination", () => ({}));

// Other library mocks
vi.mock("react-i18next", () => import("./mocks/i18next"));
vi.mock("@weaverse/hydrogen", () => import("./mocks/weaverse"));
