import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Header } from "@/components/common/Header/Header";

describe("Header", () => {
  it("renders the brand logo linking home", () => {
    render(<Header />);

    expect(screen.getByRole("link", { name: /prosigliere/i })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("opens the account menu and links to the admin console", async () => {
    render(<Header />);

    await userEvent.click(screen.getByRole("button", { name: /account/i }));

    const adminLink = await screen.findByRole("menuitem", {
      name: /admin console/i,
    });
    expect(adminLink).toHaveAttribute("href", "/admin/products");
  });
});
