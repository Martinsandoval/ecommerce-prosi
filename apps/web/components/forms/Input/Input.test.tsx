import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@/components/forms/Input/Input";

describe("Input", () => {
  it("associates the label with the input via htmlFor/id", () => {
    render(<Input label="Name" />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows an error message and marks the input invalid", () => {
    render(<Input label="Name" error="Name is required" />);

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  it("forwards user input via onChange", async () => {
    const onChange = vi.fn();
    render(<Input label="Name" onChange={onChange} />);

    await userEvent.type(screen.getByLabelText("Name"), "Hi");

    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
