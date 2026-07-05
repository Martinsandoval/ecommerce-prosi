import axios, { type AxiosError } from "axios";
import { toast } from "@/lib/toast";

const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

// Server-rendered requests run inside the Next.js server process, which in
// Docker Compose is a separate container from the api service and cannot
// reach it via the browser-facing URL (e.g. localhost). INTERNAL_API_URL
// lets the server reach the api container directly (e.g. http://api:3000/api)
// while the browser keeps using the publicly published URL.
const baseURL =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? PUBLIC_API_URL)
    : PUBLIC_API_URL;

export const apiClient = axios.create({ baseURL });

// A fixed toast id means a request that fails repeatedly (e.g. retried
// by react-query) refreshes the same toast instead of stacking
// duplicates. Only errors with no `response` are genuine network
// failures - anything with a response is a server-returned error and
// is left for the calling code to show a more specific message for.
export function handleResponseError(error: AxiosError): Promise<never> {
  if (typeof window !== "undefined" && !error.response) {
    toast.error("Network error", {
      description:
        "Couldn't reach the server. Check your connection and try again.",
      id: "network-error",
    });
  }
  return Promise.reject(error);
}

apiClient.interceptors.response.use((response) => response, handleResponseError);
