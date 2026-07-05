import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Table } from "@/components/common/Table/Table";

interface Row {
  id: string;
  name: string;
  age: number;
}

const columns: ColumnDef<Row>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "age", header: "Age" },
];

const data: Row[] = [
  { id: "1", name: "Charlie", age: 40 },
  { id: "2", name: "Alice", age: 30 },
  { id: "3", name: "Bob", age: 20 },
];

describe("Table", () => {
  it("renders a header row and one row per data entry", () => {
    render(<Table columns={columns} data={data} getRowId={(row) => row.id} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("sorts rows when a sortable header is clicked", async () => {
    render(<Table columns={columns} data={data} getRowId={(row) => row.id} />);

    await userEvent.click(screen.getByRole("button", { name: /name/i }));

    const rows = screen.getAllByRole("row").slice(1);
    expect(rows[0]).toHaveTextContent("Alice");
    expect(rows[1]).toHaveTextContent("Bob");
    expect(rows[2]).toHaveTextContent("Charlie");
  });
});
