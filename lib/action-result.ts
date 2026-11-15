export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | {
      ok: false;
      reason: "unauthorized" | "invalid" | "not-found" | "error";
      message: string;
      errors?: Record<string, string>;
    };

export const NOT_FOUND = {
  ok: false as const,
  reason: "not-found" as const,
  message: "That item no longer exists. It may have been deleted in another tab.",
};

export const SERVER_ERROR = {
  ok: false as const,
  reason: "error" as const,
  message: "Something went wrong saving that. Check your connection and try again.",
};
