import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Box, ChevronDown, Clock, Layers, MapPin, MessageSquareText, Ruler, Truck } from "lucide-react";
import { ContactButtons } from "./ContactButtons";
import { CallbackForm } from "./CallbackForm";
import { displayPkPhone } from "@/lib/phone";
import { CATEGORIES, type Product, type Settings } from "@/lib/types";

const HERO_PHOTOS = [
  { src: "/portfolio/dark-grey-kitchen-marble-backsplash.webp", alt: "Finished grey matte kitchen with black marble backsplash installed by Earth Interior" },
  { src: "/portfolio/grey-kitchen-3d-design.webp", alt: "3D design of a grey and marble kitchen" },
  { src: "/portfolio/curved-three-seater-sofa.webp", alt: "Curved three-seater sofa in light grey fabric" },
];

export function Hero({ settings }: { settings: Settings }) {
  return (
    <section className="relative overflow-hidden">
      <div className="container-page grid items-center gap-10 py-12 md:py-20 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <p className="eyebrow">Kitchens and furniture in {settings.city}</p>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Modern kitchens, designed and installed in 10 to 15 days.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">
            We design and install kitchens, wardrobes and custom furniture for homes in {settings.city}. See your kitchen in
            3D first, choose your finishes, and get a price that fits your budget.
          </p>
          <ContactButtons settings={settings} className="mt-8" showNumber />
          <ul className="mt-8 grid gap-3 text-sm sm:grid-cols-2">
            {settings.trustPoints.slice(0, 4).map((point) => (
              <li key={point} className="flex items-start gap-2">
                <BadgeCheck size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="relative row-span-2 aspect-[3/4] overflow-hidden rounded-2xl bg-accent-soft sm:aspect-auto">
            <Image src={HERO_PHOTOS[0].src} alt={HERO_PHOTOS[0].alt} fill priority sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
          </div>
          {HERO_PHOTOS.slice(1).map((p) => (
            <div key={p.src} className="relative aspect-square overflow-hidden rounded-2xl bg-accent-soft">
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1024px) 20vw, 45vw" className="object-cover" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const PROMISES = [
  { icon: Clock, title: "Fast delivery", text: "Most kitchens are designed and installed in 10 to 15 days." },
  { icon: Layers, title: "Premium finishes", text: "Branded boards, quality hardware and stone counters." },
  { icon: Box, title: "See it in 3D first", text: "We share a 3D design of your kitchen before we build." },
  { icon: BadgeCheck, title: "Affordable prices", text: "A clear written quote that fits your budget." },
];

export function TrustBar() {
  return (
    <section aria-label="Why customers choose us" className="border-y border-line bg-surface">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {PROMISES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon size={20} aria-hidden />
            </span>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-sm text-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CategoryGrid({ products }: { products: Product[] }) {
  const cats = CATEGORIES.map((c) => ({ name: c, items: products.filter((p) => p.category === c) })).filter(
    (c) => c.items.length > 0,
  );
  if (cats.length === 0) return null;
  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Browse by room</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">What would you like made?</h2>
        </div>
        <Link href="/furniture" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:underline sm:flex">
          All furniture <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {cats.map(({ name, items }) => {
          const cover = items.find((p) => p.images[0])?.images[0];
          return (
            <Link
              key={name}
              href={`/furniture?category=${encodeURIComponent(name)}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-accent-soft"
            >
              {cover && (
                <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 text-white">
                <span className="block font-semibold">{name}</span>
                <span className="text-xs text-white/85">
                  {items.length} design{items.length === 1 ? "" : "s"}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: MessageSquareText,
    title: "Share your idea",
    text: "Send a photo, a sketch or a design from our catalog on WhatsApp. Tell us the room and the size.",
  },
  {
    icon: Ruler,
    title: "Measure and quote",
    text: "We visit to measure, show wood and fabric samples, and give you a written price and delivery date.",
  },
  {
    icon: Truck,
    title: "Built and delivered",
    text: "We build it in our workshop, send you progress photos, then deliver and fit it at your home.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-28 bg-primary text-white">
      <div className="container-page py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">How it works</p>
        <h2 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Three simple steps, no surprises</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="rounded-xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
                  <Icon size={20} aria-hidden />
                </span>
                <span className="text-sm text-white/70">Step {i + 1}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
              <p className="mt-2 text-white/80">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Testimonials({ settings }: { settings: Settings }) {
  if (settings.testimonials.length === 0) return null;
  return (
    <section className="container-page py-16">
      <p className="eyebrow">Customer words</p>
      <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">What our customers say</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settings.testimonials.map((t, i) => (
          <figure key={i} className="card flex flex-col p-6">
            <blockquote className="text-ink">“{t.quote}”</blockquote>
            <figcaption className="mt-4 text-sm text-muted">
              <span className="font-semibold text-ink">{t.name}</span>
              {t.area && <> · {t.area}</>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

export function Faq({ settings }: { settings: Settings }) {
  if (settings.faqs.length === 0) return null;
  return (
    <section id="faq" className="scroll-mt-28 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Before you order</h2>
          <p className="mt-3 text-muted">Can't find your answer? Ask us on WhatsApp. We usually reply within an hour during working hours.</p>
          <ContactButtons settings={settings} size="sm" className="mt-6" />
        </div>
        <div className="divide-y divide-line border-y border-line">
          {settings.faqs.map((f, i) => (
            <details key={i} className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="mt-3 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function VisitUs({ settings }: { settings: Settings }) {
  const address = [settings.addressStreet, settings.addressArea, settings.addressCity].filter(Boolean).join(", ");
  return (
    <section id="visit" className="scroll-mt-28 container-page py-16">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <p className="eyebrow">Visit our office</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">Come and see the finishes</h2>
          <p className="mt-3 max-w-lg text-muted">
            Visit our office to see finish samples and talk through your kitchen design. Call ahead so the right person is
            there to help you.
          </p>
          <ul className="mt-6 space-y-4">
            <li className="flex gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Address</p>
                <address className="not-italic text-muted">{address}</address>
                {settings.mapUrl && (
                  <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-sm font-semibold text-primary hover:underline">
                    Get directions →
                  </a>
                )}
              </div>
            </li>
            <li className="flex gap-3">
              <Clock size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold">Opening hours</p>
                <p className="text-muted">{settings.hours}</p>
              </div>
            </li>
          </ul>
          <ContactButtons settings={settings} className="mt-8" showNumber />
        </div>
        <div className="card p-6 sm:p-8">
          <h3 className="text-2xl font-semibold">Prefer a call back?</h3>
          <p className="mt-1 text-muted">
            Leave your number and we'll call you during working hours. Or call {displayPkPhone(settings.phone)}{settings.altPhone ? ` or ${displayPkPhone(settings.altPhone)}` : ""}.
          </p>
          <CallbackForm className="mt-6" />
        </div>
      </div>
    </section>
  );
}
