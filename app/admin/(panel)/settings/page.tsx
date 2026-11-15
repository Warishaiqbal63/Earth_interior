import type { Metadata } from "next";
import { readSettings } from "@/lib/data/settings";
import { displayPkPhone } from "@/lib/phone";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await readSettings();
  // Show phone numbers the way people type them.
  return (
    <>
      <h1 className="text-2xl font-semibold sm:text-3xl">Settings</h1>
      <p className="mt-1 text-muted">Business details shown across the website. Changes go live as soon as you save.</p>
      <SettingsForm initial={{ ...s, phone: displayPkPhone(s.phone), whatsapp: displayPkPhone(s.whatsapp) }} />
    </>
  );
}
