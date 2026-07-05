import type { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { handleResponseError } from "@/lib/api-client";
import { toast } from "@/lib/toast";

vi.mock("@/lib/toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function createError(response?: AxiosError["response"]): AxiosError {
  return { isAxiosError: true, response } as AxiosError;
}

describe("handleResponseError", () => {
  it("shows a network-error toast when there is no response", async () => {
    const error = createError(undefined);

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(toast.error).toHaveBeenCalledWith(
      "Network error",
      expect.objectContaining({ id: "network-error" }),
    );
  });

  it("does not show a toast when the server returned a response", async () => {
    const error = createError({
      status: 404,
      statusText: "Not Found",
      headers: {},
      config: {} as never,
      data: { message: "Not found" },
    });

    await expect(handleResponseError(error)).rejects.toBe(error);

    expect(toast.error).not.toHaveBeenCalled();
  });
});
