import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CountryPicker } from "./country-picker";

// Mock react-country-flag to avoid SVG rendering issues in tests
vi.mock("react-country-flag", () => ({
    default: ({ countryCode }: { countryCode: string }) => (
        <span data-testid={`flag-${countryCode}`}>{countryCode}</span>
    ),
}));

describe("CountryPicker", () => {
    describe("rendering", () => {
        it("should render with placeholder when no value selected", () => {
            render(
                <CountryPicker name="country" placeholder="Select a country" />,
            );
            expect(screen.getByRole("button")).toHaveTextContent(
                "Select a country",
            );
        });

        it("should render with selected country when defaultValue provided", () => {
            render(<CountryPicker name="country" defaultValue="DE" />);
            expect(screen.getByRole("button")).toHaveTextContent("Germany");
        });

        it("should render country flag when value selected", () => {
            render(<CountryPicker name="country" defaultValue="DE" />);
            expect(screen.getByTestId("flag-DE")).toBeInTheDocument();
        });

        it("should include hidden input with selected value", () => {
            const { container } = render(
                <CountryPicker name="territoryCode" defaultValue="DE" />,
            );
            const hiddenInput = container.querySelector('input[type="hidden"]');
            expect(hiddenInput).toHaveAttribute("name", "territoryCode");
            expect(hiddenInput).toHaveAttribute("value", "DE");
        });

        it("should render with custom id", () => {
            render(<CountryPicker name="country" id="custom-id" />);
            expect(screen.getByRole("button")).toHaveAttribute(
                "id",
                "custom-id",
            );
        });

        it("should be disabled when disabled prop is true", () => {
            render(<CountryPicker name="country" disabled />);
            expect(screen.getByRole("button")).toBeDisabled();
        });

        it("should include hidden input with required value", () => {
            const { container } = render(
                <CountryPicker name="country" required />,
            );
            // The required prop is passed but not used as aria-required (not valid for button)
            // The hidden input carries the form value
            const hiddenInput = container.querySelector('input[type="hidden"]');
            expect(hiddenInput).toHaveAttribute("name", "country");
        });
    });

    describe("dropdown behavior", () => {
        it("should open dropdown on click", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });
        });

        it("should show search input when dropdown opens", async () => {
            render(
                <CountryPicker name="country" searchPlaceholder="Search..." />,
            );

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                expect(
                    screen.getByPlaceholderText("Search..."),
                ).toBeInTheDocument();
            });
        });

        it("should show priority countries first", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                const options = screen.getAllByRole("option");
                // First three should be DE, AT, CH (priority countries)
                expect(options[0]).toHaveTextContent("Germany");
                expect(options[1]).toHaveTextContent("Austria");
                expect(options[2]).toHaveTextContent("Switzerland");
            });
        });
    });

    describe("search functionality", () => {
        it("should filter countries based on search input", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            const searchInput = screen.getByRole("textbox");
            fireEvent.change(searchInput, { target: { value: "france" } });

            await waitFor(() => {
                const options = screen.getAllByRole("option");
                expect(options.length).toBe(1);
                expect(options[0]).toHaveTextContent("France");
            });
        });

        it("should search by country code", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            const searchInput = screen.getByRole("textbox");
            fireEvent.change(searchInput, { target: { value: "FR" } });

            await waitFor(() => {
                const options = screen.getAllByRole("option");
                expect(options[0]).toHaveTextContent("France");
            });
        });

        it("should show no results message when search has no matches", async () => {
            render(
                <CountryPicker
                    name="country"
                    noResultsText="No countries found"
                />,
            );

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            const searchInput = screen.getByRole("textbox");
            fireEvent.change(searchInput, {
                target: { value: "xyznonexistent" },
            });

            await waitFor(() => {
                expect(
                    screen.getByText("No countries found"),
                ).toBeInTheDocument();
            });
        });
    });

    describe("selection", () => {
        it("should select country on click", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("France"));

            await waitFor(() => {
                expect(screen.getByRole("button")).toHaveTextContent("France");
            });
        });

        it("should call onChange when selection changes", async () => {
            const onChange = vi.fn();
            render(<CountryPicker name="country" onChange={onChange} />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("France"));

            expect(onChange).toHaveBeenCalledWith("FR");
        });

        it("should update hidden input value on selection", async () => {
            const { container } = render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("France"));

            const hiddenInput = container.querySelector('input[type="hidden"]');
            await waitFor(() => {
                expect(hiddenInput).toHaveAttribute("value", "FR");
            });
        });

        it("should close dropdown after selection", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("France"));

            await waitFor(() => {
                expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
            });
        });

        it("should show checkmark for selected country", async () => {
            render(<CountryPicker name="country" defaultValue="DE" />);

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                const germanyOption = screen.getByRole("option", {
                    name: /germany/i,
                });
                expect(germanyOption).toHaveAttribute("aria-selected", "true");
            });
        });
    });

    describe("controlled mode", () => {
        it("should use controlled value when provided", () => {
            render(<CountryPicker name="country" value="FR" />);
            expect(screen.getByRole("button")).toHaveTextContent("France");
        });

        it("should not update internal state in controlled mode", async () => {
            const onChange = vi.fn();
            render(
                <CountryPicker name="country" value="DE" onChange={onChange} />,
            );

            fireEvent.click(screen.getByRole("button"));
            await waitFor(() => {
                expect(screen.getByRole("listbox")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText("France"));

            // Value should still be DE since parent controls it
            expect(screen.getByRole("button")).toHaveTextContent("Germany");
            // But onChange should have been called
            expect(onChange).toHaveBeenCalledWith("FR");
        });
    });

    describe("translations", () => {
        it("should use translations for country names", () => {
            render(<CountryPicker name="country" defaultValue="DE" />);
            // The mock i18next returns translations from en/common.json
            expect(screen.getByRole("button")).toHaveTextContent("Germany");
        });

        it("should use translations for UI strings", () => {
            render(<CountryPicker name="country" />);
            // The placeholder should come from translations
            expect(screen.getByRole("button")).toHaveTextContent(
                "Select country",
            );
        });
    });

    describe("accessibility", () => {
        it("should have proper ARIA attributes on trigger", () => {
            render(
                <CountryPicker
                    name="country"
                    aria-label="Choose your country"
                />,
            );
            const trigger = screen.getByRole("button");
            expect(trigger).toHaveAttribute(
                "aria-label",
                "Choose your country",
            );
            expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
            expect(trigger).toHaveAttribute("aria-expanded", "false");
        });

        it("should update aria-expanded when opened", async () => {
            render(<CountryPicker name="country" />);

            const trigger = screen.getByRole("button");
            fireEvent.click(trigger);

            await waitFor(() => {
                expect(trigger).toHaveAttribute("aria-expanded", "true");
            });
        });

        it("should have proper role on options", async () => {
            render(<CountryPicker name="country" />);

            fireEvent.click(screen.getByRole("button"));

            await waitFor(() => {
                const options = screen.getAllByRole("option");
                expect(options.length).toBeGreaterThan(0);
            });
        });
    });
});
