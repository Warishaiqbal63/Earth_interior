"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { checkPassword } from "@/lib/auth/password";
import { clientIp, loginLockMinutes, recordLogin } from "@/lib/auth/rate-limit";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/auth/session";

export type LoginState = { error?: string; email?: string };

function safeNext(raw: FormDataEntryValue | null): string {
  const next = typeof raw === "string" ? raw : "";
  return next.startsWith("/admin") && !next.startsWith("//") && !next.startsWith("/admin/login") ? next : "/admin";
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let target: string;
  try {
    const ip = await clientIp();
    const locked = await loginLockMinutes(ip, email);
    if (locked) {
      return { error: `Too many attempts. Try again in ${locked} minute${locked === 1 ? "" : "s"}.`, email };
    }

    const rows = await db()`SELECT id, password_hash FROM admin_users WHERE email = ${email}`;
    const user = rows[0];
    const ok = await checkPassword(password, user ? String(user.password_hash) : null);
    await recordLogin(ip, email, ok);
    if (!ok) return { error: "Email or password is incorrect.", email };

    await db()`UPDATE admin_users SET last_login_at = now() WHERE id = ${user.id}`;
    const token = await signSession({ uid: Number(user.id), email });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    target = safeNext(formData.get("next"));
  } catch (error) {
    console.error("Sign-in failed", error);
    return { error: "We couldn't reach the database. Check your connection and try again.", email };
  }
  redirect(target);
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
