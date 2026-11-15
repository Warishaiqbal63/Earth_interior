import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <p className="eyebrow text-center">Earth Interior</p>
        <h1 className="mt-2 text-center text-3xl font-semibold">Admin sign in</h1>
        <p className="mt-2 text-center text-sm text-muted">Manage products, callback requests and business details.</p>
        <div className="card mt-8 p-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-muted underline-offset-4 hover:text-primary hover:underline">
            ← Back to the website
          </Link>
        </p>
      </div>
    </main>
  );
}
