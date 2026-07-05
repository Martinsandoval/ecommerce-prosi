import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { List } from "@/components/common/List/List";

interface Item {
  id: string;
  label: string;
}

describe("List", () => {
  const items: Item[] = [
    { id: "1", label: "First" },
    { id: "2", label: "Second" },
  ];

  it("renders one item per entry, keyed by keyExtractor", () => {
    render(
      <List
        items={items}
        keyExtractor={(item) => item.id}
        renderItem={(item) => <span>{item.label}</span>}
      />,
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing when items is empty", () => {
    render(
      <List
        items={[]}
        keyExtractor={(item: Item) => item.id}
        renderItem={(item: Item) => <span>{item.label}</span>}
      />,
    );

    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });
});
