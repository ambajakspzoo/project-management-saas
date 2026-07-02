import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Project Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Sign in to manage your projects.
          </p>
        </div>

        <Suspense
          fallback={<p className="text-sm text-zinc-500">Loading...</p>}
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
