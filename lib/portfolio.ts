/**
 * Real project photos and videos, served from /public. To add one: put the file in
 * public/portfolio (photos, WebP ~1600px) or public/videos (MP4 + a .webp cover), then add an entry here.
 */
export type PortfolioKind = "Completed" | "Installation" | "3D design";

export type PortfolioItem =
  | { type: "image"; src: string; alt: string; caption: string; kind: PortfolioKind; width: number; height: number }
  | { type: "video"; src: string; poster: string; caption: string; kind: PortfolioKind; width: number; height: number };

export const PORTFOLIO: PortfolioItem[] = [
  { type: "image", src: "/portfolio/curved-three-seater-sofa.webp", alt: "Curved three-seater sofa in light grey fabric with quilted side panel", caption: "Curved three-seater sofa", kind: "Completed", width: 1600, height: 1200 },
  { type: "image", src: "/portfolio/wooden-coffered-ceiling.webp", alt: "Wooden coffered ceiling with pendant lamps", caption: "Wooden coffered ceiling", kind: "Completed", width: 736, height: 981 },
  { type: "video", src: "/videos/dark-kitchen-walkthrough.mp4", poster: "/videos/dark-kitchen-walkthrough.webp", caption: "Charcoal kitchen walkthrough", kind: "Completed", width: 480, height: 856 },
  { type: "image", src: "/portfolio/brown-armchairs-wooden-frame.webp", alt: "Pair of brown fabric tub armchairs with solid wood side frames", caption: "Armchairs with solid wood frames", kind: "Completed", width: 1600, height: 1200 },
  { type: "image", src: "/portfolio/dark-grey-kitchen-marble-backsplash.webp", alt: "Finished U-shaped kitchen with grey matte cabinets, black handles and a black marble backsplash", caption: "Grey matte kitchen with marble backsplash", kind: "Completed", width: 1600, height: 1200 },
  { type: "image", src: "/portfolio/grey-kitchen-3d-design.webp", alt: "3D design of a grey U-shaped kitchen with white marble counters and gold trim", caption: "Grey and marble kitchen", kind: "3D design", width: 1600, height: 900 },
  { type: "video", src: "/videos/yellow-kitchen.mp4", poster: "/videos/yellow-kitchen.webp", caption: "Yellow kitchen", kind: "Completed", width: 478, height: 850 },
  { type: "image", src: "/portfolio/sage-oak-kitchen-3d-design.webp", alt: "3D design of a sage green and oak kitchen with black marble backsplash and built-in ovens", caption: "Sage and oak kitchen", kind: "3D design", width: 1080, height: 611 },
  { type: "video", src: "/videos/u-kitchen-installation.mp4", poster: "/videos/u-kitchen-installation.webp", caption: "U-shaped kitchen during installation", kind: "Installation", width: 848, height: 478 },
  { type: "image", src: "/portfolio/l-shaped-kitchen-3d-design.webp", alt: "3D design of an L-shaped kitchen in sage gloss and oak with tall oven unit", caption: "L-shaped gloss kitchen", kind: "3D design", width: 1080, height: 605 },
  { type: "image", src: "/portfolio/oak-galley-kitchen-3d-design.webp", alt: "3D design of a straight oak kitchen with black marble backsplash and washing machine space", caption: "Oak galley kitchen", kind: "3D design", width: 1080, height: 607 },
  { type: "image", src: "/portfolio/u-shaped-kitchen-installation.webp", alt: "U-shaped kitchen with tall units and lit glass cabinet, protective film still on the panels", caption: "U-shaped kitchen, protective film still on", kind: "Installation", width: 1280, height: 960 },
  { type: "image", src: "/portfolio/matte-kitchen-installation.webp", alt: "Straight kitchen with chimney hood and smoky marble backsplash during installation", caption: "Matte kitchen with smoky marble backsplash", kind: "Installation", width: 1600, height: 1200 },
  { type: "video", src: "/videos/kitchen-installation-tour.mp4", poster: "/videos/kitchen-installation-tour.webp", caption: "Kitchen installation tour", kind: "Installation", width: 478, height: 850 },
  { type: "image", src: "/portfolio/u-shaped-kitchen-installation-2.webp", alt: "U-shaped kitchen with green tile backsplash, cabinets wrapped in protective film", caption: "Kitchen with green tile backsplash", kind: "Installation", width: 1280, height: 960 },
  { type: "image", src: "/portfolio/granite-counter-installation.webp", alt: "Close-up of a black granite counter edge over gloss cabinet doors", caption: "Granite counter and gloss doors", kind: "Installation", width: 900, height: 1600 },
];

export const PORTFOLIO_KINDS: PortfolioKind[] = ["Completed", "Installation", "3D design"];
