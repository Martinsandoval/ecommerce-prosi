"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/common/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddProductForm } from "@/components/forms/AddProductForm/AddProductForm";

/**
 * "Add new Product" trigger and dialog with the create-product form,
 * self-contained so a parent can just render it without managing any
 * open state.
 *
 * @author Martin Sandoval
 */
export function AddNewProductDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="size-4" />
        Add new Product
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new product</DialogTitle>
          <DialogDescription>
            Create a new catalog entry. It will be active immediately.
          </DialogDescription>
        </DialogHeader>
        <AddProductForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
