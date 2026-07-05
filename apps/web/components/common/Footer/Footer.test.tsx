import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/common/Footer/Footer";

describe("Footer", () => {
  it("renders the brand name and the current year in the copyright line", () => {
    render(<Footer />);

    expect(screen.getByText("Prósi")).toBeInTheDocument();
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });
});
