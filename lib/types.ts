export const CATEGORIES = [
  "Living Room",
  "Bedroom",
  "Dining",
  "Office",
  "Wardrobes",
  "Kitchen",
  "Outdoor",
  "Kids",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ProductImage = { url: string; alt: string; width: number; height: number };

export type Product = {
  id: number;
  title: string;
  slug: string;
  category: Category;
  price: number | null;
  compareAtPrice: number | null;
  description: string;
  dimensions: string;
  features: string[];
  images: ProductImage[];
  sortOrder: number;
  published: boolean;
  isSample: boolean;
  updatedAt: string;
};

export type ProductInput = {
  title: string;
  slug: string;
  category: Category;
  price: number | null;
  compareAtPrice: number | null;
  description: string;
  dimensions: string;
  features: string[];
  images: ProductImage[];
  published: boolean;
};

export type Testimonial = { name: string; area: string; quote: string };
export type Faq = { q: string; a: string };

export type Settings = {
  businessName: string;
  tagline: string;
  city: string;
  phone: string;
  whatsapp: string;
  /** Optional second number, shown next to the main one. */
  altPhone: string;
  email: string;
  addressStreet: string;
  addressArea: string;
  addressCity: string;
  mapUrl: string;
  hours: string;
  trustPoints: string[];
  testimonials: Testimonial[];
  faqs: Faq[];
};

export type Lead = {
  id: number;
  name: string;
  phone: string;
  productId: number | null;
  productTitle: string | null;
  productSlug: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
};

export type LeadInput = { name: string; phone: string; message: string; productId: number | null };

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

/** Starting content. Every field is editable in Admin → Settings. */
export const DEFAULT_SETTINGS: Settings = {
  businessName: "Earth Interior",
  tagline: "Beautiful furniture. Fast delivery. Affordable prices.",
  city: "Karachi",
  phone: "+923333388646",
  whatsapp: "+923333388646",
  altPhone: "+923002788525",
  email: "",
  addressStreet: "Office 303, 3rd Floor, Building 1C, 7th Zamzama",
  addressArea: "DHA",
  addressCity: "Karachi",
  mapUrl: "https://maps.google.com/?q=7th+Zamzama+Commercial+Lane+DHA+Karachi",
  hours: "Monday to Saturday, 10am to 8pm",
  trustPoints: [
    "Custom furniture made to your size and budget",
    "Kitchens designed and installed in 10 to 15 days",
    "Premium finishes at an affordable price",
    "Professional workmanship, start to finish",
  ],
  testimonials: [
    {
      name: "Sample customer",
      area: "DHA, Karachi",
      quote: "Replace this with a real quote from a customer in Admin → Settings.",
    },
  ],
  faqs: [
    {
      q: "Do you make furniture to my measurements?",
      a: "Yes. Everything is made to order, so we can change size, wood, polish and fabric to fit your room.",
    },
    {
      q: "How long does an order take?",
      a: "Kitchens are usually designed and installed in 10 to 15 days once the design and quote are approved. For furniture, we confirm the delivery date in your quote, depending on the piece.",
    },
    {
      q: "Do you visit to take measurements?",
      a: "Yes. We visit homes in Karachi to measure and discuss the design before giving a final quote.",
    },
    {
      q: "How do I pay?",
      a: "An advance confirms the order and the balance is paid on delivery. We share a written quote first.",
    },
  ],
};
