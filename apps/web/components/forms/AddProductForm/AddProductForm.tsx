"use client";

import {
  MAX_PRODUCT_ATTRIBUTES,
  MIN_PRODUCT_PRICE,
  PRODUCT_NAME_MAX_LENGTH,
} from "@ecommerce/shared";
import { isAxiosError } from "axios";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Button } from "@/components/common/Button/Button";
import { Input } from "@/components/forms/Input/Input";
import { useCreateProduct } from "@/hooks/product";
import { toast } from "@/lib/toast";
import type { ApiErrorResponse, CreateProductInput } from "@/types/product";

interface AddProductFormValues {
  name: string;
  pictureUrl: string;
  price: number;
  attributes: { name: string; value: string }[];
}

interface AddProductFormProps {
  onSuccess: () => void;
}

function extractErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error) && error.response?.data) {
    const { message } = error.response.data;
    return Array.isArray(message) ? message.join(" ") : message;
  }
  return "Something went wrong creating the product. Please try again.";
}

/**
 * Form for creating a new product, with validation for required
 * fields and an optional, dynamic list of attributes (max 10).
 *
 * @author Martin Sandoval
 */
export function AddProductForm({ onSuccess }: AddProductFormProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddProductFormValues>({
    defaultValues: { name: "", pictureUrl: "", price: 0, attributes: [] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "attributes",
  });
  const createProduct = useCreateProduct();

  async function onSubmit(form: AddProductFormValues) {
    const input: CreateProductInput = {
      name: form.name.trim(),
      pictureUrl: form.pictureUrl.trim(),
      price: Number(form.price),
      attributes: form.attributes
        .filter((attribute) => attribute.name.trim() && attribute.value.trim())
        .map((attribute) => ({
          name: attribute.name.trim(),
          value: attribute.value.trim(),
        })),
    };

    try {
      await createProduct.mutateAsync(input);
      toast.success("Product created", {
        description: `"${input.name}" was added to the catalog.`,
      });
      reset();
      onSuccess();
    } catch (error) {
      // A missing `response` means the axios interceptor already
      // showed a network-error toast for this request.
      if (isAxiosError<ApiErrorResponse>(error) && error.response) {
        toast.error("Couldn't create the product", {
          description: extractErrorMessage(error),
        });
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-4"
    >
      <Input
        label="Name"
        placeholder="Classic Cotton T-Shirt"
        error={errors.name?.message}
        {...register("name", {
          required: "Name is required",
          maxLength: {
            value: PRODUCT_NAME_MAX_LENGTH,
            message: `Name must be ${PRODUCT_NAME_MAX_LENGTH} characters or fewer`,
          },
        })}
      />
      <Input
        label="Picture URL"
        placeholder="https://example.com/images/t-shirt.png"
        error={errors.pictureUrl?.message}
        {...register("pictureUrl", {
          required: "Picture URL is required",
          pattern: {
            value: /^https?:\/\/.+/i,
            message: "Must be a valid URL",
          },
        })}
      />
      <Input
        label="Price"
        type="number"
        step="0.01"
        min={MIN_PRODUCT_PRICE}
        placeholder="19.99"
        error={errors.price?.message}
        {...register("price", {
          required: "Price is required",
          valueAsNumber: true,
          min: {
            value: MIN_PRODUCT_PRICE,
            message: "Price must be greater than 0",
          },
        })}
      />

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Attributes
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: "", value: "" })}
            disabled={fields.length >= MAX_PRODUCT_ATTRIBUTES}
          >
            <Plus className="size-3.5" />
            Add attribute
          </Button>
        </div>
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">
            No attributes added yet.
          </p>
        )}
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <Input
              label={index === 0 ? "Attribute name" : undefined}
              placeholder="Color"
              className="flex-1"
              {...register(`attributes.${index}.name` as const)}
            />
            <Input
              label={index === 0 ? "Value" : undefined}
              placeholder="Red"
              className="flex-1"
              {...register(`attributes.${index}.value` as const)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Remove attribute"
              onClick={() => remove(index)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        loading={createProduct.isPending}
        loadingText="Creating…"
        className="mt-2"
      >
        Create product
      </Button>
    </form>
  );
}
