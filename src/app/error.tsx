"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h2 className="text-xl font-semibold text-zinc-900">
          Something went wrong
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          The dashboard hit an unexpected error. You can try loading it again.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
