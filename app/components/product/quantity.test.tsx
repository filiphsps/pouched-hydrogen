import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Quantity } from "./quantity";

// Mock dependencies
vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../button", () => ({
    Button: (props: any) => (
        <button {...props} onClick={props.disabled ? undefined : props.onClick}>
            {props.children}
        </button>
    ),
}));

describe("Quantity", () => {
    it("renders with initial value", () => {
        render(<Quantity value={1} onChange={vi.fn()} />);
        expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    });

    it("increments value", () => {
        const onChange = vi.fn();
        render(<Quantity value={1} onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /increase/i }));
        expect(onChange).toHaveBeenCalledWith(2);
    });

    it("decrements value", () => {
        const onChange = vi.fn();
        render(<Quantity value={2} onChange={onChange} />);

        fireEvent.click(screen.getByRole("button", { name: /decrease/i }));
        expect(onChange).toHaveBeenCalledWith(1);
    });

    it("respects min value for disabling decrement", () => {
        const onChange = vi.fn();
        // Min default is 1
        render(<Quantity value={1} onChange={onChange} />);

        const decreaseBtn = screen.getByRole("button", { name: /decrease/i });
        expect(decreaseBtn).toBeDisabled();

        fireEvent.click(decreaseBtn);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("allows value to reach 0 when min is 0", () => {
        const onChange = vi.fn();
        render(<Quantity value={1} min={0} onChange={onChange} />);

        const decreaseBtn = screen.getByRole("button", { name: /decrease/i });
        expect(decreaseBtn).not.toBeDisabled();

        fireEvent.click(decreaseBtn);
        expect(onChange).toHaveBeenCalledWith(0);
    });

    it("updates via input", () => {
        const onChange = vi.fn();
        render(<Quantity value={1} onChange={onChange} />);

        const input = screen.getByDisplayValue("1");
        fireEvent.change(input, { target: { value: "5" } });
        fireEvent.blur(input);

        expect(onChange).toHaveBeenCalledWith(5);
    });
});
