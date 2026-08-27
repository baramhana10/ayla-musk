import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

const img = (name: string) => `/products/${name}`;
// Curated, brand-safe Unsplash editorial photography — reused here only as a
// placeholder for the Contact Lenses line, which has no real product
// photography yet (see CollectionPillars on the homepage for the same note).
const unsplash = (id: string, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=80`;

const categories = [
  { slug: "musk-oil", name: "Musk Oils", description: "Concentrated, alcohol-free musk attars — worn close to the skin.", image: img("musk-oil-trio.jpg") },
  { slug: "body-butter", name: "Body Butters", description: "Whipped shea and mango butter, scented to layer beneath your musk.", image: img("body-butter-strawberry.jpg") },
  { slug: "body-scrub", name: "Body Scrubs", description: "Polishing sugar scrubs infused with traditional Moroccan blends.", image: img("scrub-blue-nila.jpg") },
  { slug: "hair-body-care", name: "Hair & Body Care", description: "Everyday rituals — hair serum, body glow oil, and underarm care.", image: img("body-glow-oil.jpg") },
  { slug: "gift-sets", name: "Gift Sets", description: "Boxed collections, beautifully presented for gifting.", image: img("musk-collection-giftbox.jpg") },
];

const coupons = [
  { code: "AYLA10", label: "10% off your order", percentOff: 10, active: true },
  { code: "WELCOME15", label: "15% off for new clients", percentOff: 15, active: true },
];

type Department = "body-care" | "perfumes" | "lenses";

type SeedVariant = { label?: string; sizeMl?: number; price: number; compareAtPrice?: number; stock: number };

type SeedProduct = {
  slug: string; name: string; brandLine: string; department: Department; category?: string; accent: string;
  shortDescription: string; description: string;
  // perfumes
  scentFamily?: string; gender?: string; notes?: { top: string[]; heart: string[]; base: string[] };
  // body care
  benefits?: string[]; ingredients?: string[]; howToUse?: string; skinHairType?: string;
  // lenses
  lensType?: string; lensColor?: string; diameter?: string; baseCurve?: string; replacementDuration?: string;
  material?: string; waterContent?: string; prescriptionAvailable?: boolean;
  images: string[];
  variants: SeedVariant[];
  rating: number; reviewCount: number; featured?: boolean; bestseller?: boolean; isNew?: boolean;
};

const products: SeedProduct[] = [
  // ---------------------------------------------------------------- Perfumes
  { slug: "musk-oil-discovery-set", name: "Musk Oil Discovery Set", brandLine: "Perfume Oil", department: "perfumes", category: "musk-oil", accent: "#c76c8a",
    shortDescription: "Five signature musk shades in one elegant set.",
    description: "Five of our house musk attars, pressed into fine oil and presented together on marble — from soft floral to warm amber. Alcohol-free and long-wearing, this is the easiest way to discover your Ayla Musk match.",
    scentFamily: "Floral Musk", gender: "Women",
    notes: { top: ["Bergamot", "Rose Water"], heart: ["White Musk", "Jasmine"], base: ["Sandalwood", "Amber"] },
    images: [img("musk-oil-discovery-set.jpg")],
    variants: [{ sizeMl: 15, price: 3400, stock: 40 }], rating: 4.8, reviewCount: 0, bestseller: true, featured: true },
  { slug: "musk-oil-trio", name: "Roll-On Musk Oil Trio", brandLine: "Perfume Oil", department: "perfumes", category: "musk-oil", accent: "#9c5a63",
    shortDescription: "Three richly patterned roll-on musk oils.",
    description: "Three of our most-loved attars in hand-painted glass roll-ons — a cooling teal musk, a soft frosted white musk, and a deep red amber musk. Roll directly onto pulse points for scent that warms with your skin.",
    scentFamily: "Oriental Amber", gender: "Women",
    notes: { top: ["Cardamom"], heart: ["White Musk", "Rose"], base: ["Amber", "Sandalwood"] },
    images: [img("musk-oil-trio.jpg")],
    variants: [{ sizeMl: 18, price: 3800, compareAtPrice: 4400, stock: 26 }], rating: 4.9, reviewCount: 0, bestseller: true },
  { slug: "musk-collection-giftbox", name: "Musk Collection — 5 Piece Gift Set", brandLine: "Gift Set", department: "perfumes", category: "gift-sets", accent: "#c23b8a",
    shortDescription: "White, Roman, Powder, Mango & Strawberry Musk sprays, boxed.",
    description: "\"A Collection to Fall In Love With\" — five of our signature musk sprays (White Musk, Roman Musk, Powder Musk, Mango Musk, Strawberry Musk) at 30ml each, boxed in magenta and gold. Our most-gifted set.",
    scentFamily: "Floral Musk", gender: "Women",
    notes: { top: ["Mango", "Strawberry"], heart: ["Powder Musk", "Rose"], base: ["White Musk", "Roman Musk"] },
    images: [img("musk-collection-giftbox.jpg")],
    variants: [{ sizeMl: 150, price: 6200, compareAtPrice: 7400, stock: 24 }], rating: 4.9, reviewCount: 0, bestseller: true, featured: true },
  { slug: "be-a-queen-giftset", name: "Be a Queen — Mother's Day Collection", brandLine: "Limited Edition Gift Set", department: "perfumes", category: "gift-sets", accent: "#a8894a",
    shortDescription: "Six mini musk oils and a compact, in a keepsake box.",
    description: "A limited-edition keepsake box — six mini musk oil attars alongside a rose-gold compact, wrapped in a powder-blue box finished with gold foil Arabic calligraphy. Made to make someone feel like royalty.",
    scentFamily: "Oriental Amber", gender: "Women",
    notes: { top: ["Rose"], heart: ["Amber", "Musk"], base: ["Sandalwood"] },
    images: [img("queen-giftset-open.jpg"), img("queen-giftset-box.jpg")],
    variants: [{ sizeMl: 30, price: 7800, stock: 15 }], rating: 5.0, reviewCount: 0, featured: true },

  // -------------------------------------------------------------- Body Care
  { slug: "body-butter-woody-floral", name: "Woody Floral Body Butter", brandLine: "Body Butter", department: "body-care", category: "body-butter", accent: "#d99aa6",
    shortDescription: "Whipped shea butter in a warm, powdery floral musk.",
    description: "A rich shea and mango butter blend scented in a warm floral-woody musk — soft raspberry and jasmine over blonde woods and vanilla musk. Layer beneath your favourite Ayla Musk oil to make it last all day.",
    benefits: ["Deeply moisturises for up to 24 hours", "Softens and smooths rough, dry patches", "Leaves a subtle, long-wearing scent on skin"],
    ingredients: ["Shea Butter", "Mango Butter", "Sweet Almond Oil", "Vitamin E", "Fragrance"],
    howToUse: "Scoop a small amount and warm between palms, then massage into skin — ideal after a shower while skin is still slightly damp.",
    skinHairType: "Dry & normal skin",
    images: [img("body-butter-woody-floral.jpg")],
    variants: [{ sizeMl: 250, price: 2600, stock: 34 }], rating: 4.7, reviewCount: 0 },
  { slug: "body-butter-floral-gourmand", name: "Floral Gourmand Body Butter", brandLine: "Body Butter — Travel Size", department: "body-care", category: "body-butter", accent: "#e8b7c4",
    shortDescription: "A bright floral butter, inspired by a beloved designer bloom.",
    description: "Shea and coconut butter whipped into a bright, gourmand floral — inspired by the airy jasmine-and-pear character of a certain iconic designer bloom. A little jar for your bag or bedside table.",
    benefits: ["Lightweight, fast-absorbing formula", "Travel-friendly jar for on-the-go touch-ups", "Bright, long-lasting floral finish"],
    ingredients: ["Shea Butter", "Coconut Butter", "Jojoba Oil", "Vitamin E", "Fragrance"],
    howToUse: "Warm a small amount between fingertips and pat onto pulse points and arms for a light, fragrant layer.",
    skinHairType: "All skin types",
    images: [img("body-butter-floral-gourmand.jpg")],
    variants: [{ sizeMl: 30, price: 1400, stock: 52 }], rating: 4.6, reviewCount: 0, isNew: true },
  { slug: "body-butter-strawberry", name: "Strawberry Body Butter", brandLine: "Body Butter", department: "body-care", category: "body-butter", accent: "#c23b6b",
    shortDescription: "Whipped strawberry butter, sweet and juicy.",
    description: "A vividly whipped strawberry body butter — juicy, sweet, and deeply moisturising. A cult favourite for anyone who loves a gourmand, dessert-like scent on skin.",
    benefits: ["Whipped texture sinks in without greasiness", "Deeply nourishes dry, tired skin", "Sweet, dessert-like scent that lingers"],
    ingredients: ["Shea Butter", "Cocoa Butter", "Sweet Almond Oil", "Vitamin E", "Fragrance"],
    howToUse: "Apply generously after bathing, focusing on elbows, knees, and heels where skin is driest.",
    skinHairType: "Dry & normal skin",
    images: [img("body-butter-strawberry.jpg")],
    variants: [{ sizeMl: 250, price: 2400, stock: 45 }], rating: 4.8, reviewCount: 0, bestseller: true },
  { slug: "scrub-blue-nila", name: "Blue Nila Body Scrub", brandLine: "Body Scrub", department: "body-care", category: "body-scrub", accent: "#3f6fa8",
    shortDescription: "A polishing scrub with traditional Moroccan blue nila.",
    description: "A traditional Moroccan-inspired sugar scrub infused with blue nila powder — buffs away dullness while shea butter and sweet almond oil keep skin soft. Use 2–3 times a week for a lasting glow.",
    benefits: ["Buffs away dull, dry skin for an instant glow", "Sugar base dissolves gently, no harsh scratching", "Shea butter keeps skin soft after rinsing"],
    ingredients: ["Cane Sugar", "Blue Nila Powder", "Shea Butter", "Sweet Almond Oil"],
    howToUse: "Massage onto damp skin in circular motions 2–3 times a week, then rinse thoroughly.",
    skinHairType: "All skin types",
    images: [img("scrub-blue-nila.jpg")],
    variants: [{ sizeMl: 250, price: 2200, stock: 30 }], rating: 4.7, reviewCount: 0 },
  { slug: "scrub-fassi-amber", name: "Fassi Amber Body Scrub", brandLine: "Body Scrub", department: "body-care", category: "body-scrub", accent: "#b0432f",
    shortDescription: "A warm amber scrub inspired by traditional Fassi blends.",
    description: "A deep amber-scented sugar scrub inspired by traditional Fassi musk blends — warm, resinous, and grounding. Massage onto damp skin to polish and prep for your favourite Ayla Musk oil.",
    benefits: ["Polishes and preps skin before applying oil", "Warm amber scent lingers gently after rinsing", "Nourishing oils prevent post-scrub tightness"],
    ingredients: ["Cane Sugar", "Amber Resin Extract", "Shea Butter", "Argan Oil"],
    howToUse: "Massage onto damp skin, focusing on rougher areas, then rinse — follow with a musk oil for best results.",
    skinHairType: "Normal & oily skin",
    images: [img("scrub-fassi-amber.jpg")],
    variants: [{ sizeMl: 250, price: 2200, stock: 27 }], rating: 4.6, reviewCount: 0 },
  { slug: "hair-serum", name: "Keratin Smooth Hair Serum", brandLine: "Ayla Hair Care", department: "body-care", category: "hair-body-care", accent: "#c96a86",
    shortDescription: "A keratin protein serum for silky, detangled hair.",
    description: "A lightweight keratin deep-treatment serum that smooths, detangles, and adds silky shine — sulfate-free, sodium-free, and safe for colour-treated hair. A few pumps on damp or dry hair transforms texture instantly.",
    benefits: ["Instantly smooths frizz and flyaways", "Adds silky shine without weighing hair down", "Safe for colour-treated and chemically treated hair"],
    ingredients: ["Keratin Protein", "Silk Amino Acids", "Argan Oil", "Panthenol"],
    howToUse: "Apply 2–3 pumps to damp or dry hair, focusing on mid-lengths and ends, then style as usual.",
    skinHairType: "All hair types",
    images: [img("hair-serum.jpg")],
    variants: [{ sizeMl: 100, price: 2600, stock: 38 }], rating: 4.7, reviewCount: 0, bestseller: true },
  { slug: "body-glow-oil", name: "Body Glow Oil — Shining Stars", brandLine: "Ayla Hair Care", department: "body-care", category: "hair-body-care", accent: "#9c2a5e",
    shortDescription: "A shimmering argan body and hair oil.",
    description: "An argan-oil-based shimmer oil for body and hair — a fine, buildable shine with a soft golden shimmer, finished with a warm musk scent. Smooth over collarbones, legs, or hair ends for an instant glow.",
    benefits: ["Buildable, fine shimmer — never glittery or heavy", "Nourishes skin and hair ends in one step", "Warm musk scent layers beautifully under perfume"],
    ingredients: ["Argan Oil", "Mica Shimmer", "Vitamin E", "Fragrance"],
    howToUse: "Smooth a few drops over collarbones, shoulders, legs, or hair ends for a buildable glow.",
    skinHairType: "All skin & hair types",
    images: [img("body-glow-oil.jpg")],
    variants: [{ sizeMl: 40, price: 2800, stock: 22 }], rating: 4.8, reviewCount: 0, isNew: true },
  { slug: "underarm-cream", name: "Underarm Cream", brandLine: "Ayla Body Care", department: "body-care", category: "hair-body-care", accent: "#e3aeb4",
    shortDescription: "A gentle anti-perspirant cream for softness and freshness.",
    description: "A soothing anti-perspirant cream formulated for softness and freshness without harsh chemicals — gentle enough for daily use, leaving underarms smooth and comfortable.",
    benefits: ["Gentle daily formula, free of harsh chemicals", "Softens and smooths underarm skin over time", "Keeps skin feeling fresh, not just masked"],
    ingredients: ["Aloe Vera", "Chamomile Extract", "Shea Butter", "Vitamin E"],
    howToUse: "Apply a small amount to clean, dry underarms daily.",
    skinHairType: "Sensitive skin",
    images: [img("underarm-cream.jpg")],
    variants: [{ sizeMl: 30, price: 1500, stock: 60 }], rating: 4.5, reviewCount: 0 },

  // ------------------------------------------------------------ Contact Lenses
  { slug: "daily-sparkle-gray-lenses", name: "Daily Sparkle Gray Lenses", brandLine: "Ayla Contact Lenses", department: "lenses", accent: "#8a8f9c",
    shortDescription: "Soft daily-wear lenses in a natural sparkling gray.",
    description: "A natural-finish gray lens designed to brighten light and dark eyes alike, in a breathable daily-wear material. Fresh, comfortable, and effortless — no cleaning routine required.",
    lensType: "Daily Disposable", lensColor: "Gray", diameter: "14.2mm", baseCurve: "8.6mm",
    replacementDuration: "Daily", material: "Hydrogel", waterContent: "58%", prescriptionAvailable: true,
    images: [unsplash("1516575150278-77136aed6920")],
    variants: [
      { label: "Plano (0.00)", price: 8900, stock: 50 },
      { label: "-1.00", price: 8900, stock: 40 },
      { label: "-2.00", price: 8900, stock: 40 },
      { label: "-3.00", price: 8900, stock: 30 },
    ],
    rating: 4.6, reviewCount: 0, isNew: true, featured: true },
  { slug: "monthly-hazel-glow-lenses", name: "Monthly Hazel Glow Lenses", brandLine: "Ayla Contact Lenses", department: "lenses", accent: "#a9713a",
    shortDescription: "Warm hazel monthly lenses with a soft natural blend.",
    description: "A richly blended hazel tone that sits naturally over your own eye colour, in a monthly-wear lens built for all-day comfort. Includes a high water content for lasting freshness through long days.",
    lensType: "Monthly", lensColor: "Hazel", diameter: "14.2mm", baseCurve: "8.6mm",
    replacementDuration: "Monthly", material: "Silicone Hydrogel", waterContent: "42%", prescriptionAvailable: true,
    images: [unsplash("1583001931096-959e9a1a6223")],
    variants: [
      { label: "Plano (0.00)", price: 12900, stock: 35 },
      { label: "-1.50", price: 12900, stock: 28 },
      { label: "-2.50", price: 12900, stock: 28 },
    ],
    rating: 4.7, reviewCount: 0, bestseller: true },
  { slug: "honey-brown-colored-lenses", name: "Honey Brown Colored Lenses", brandLine: "Ayla Contact Lenses", department: "lenses", accent: "#b5793f",
    shortDescription: "Golden honey-brown lenses for a warm, sun-kissed look.",
    description: "A luminous honey-brown shade designed to enhance darker eyes with a warm, sun-kissed glow. Lightweight and breathable for comfortable all-day wear, prescription and non-prescription available.",
    lensType: "Monthly", lensColor: "Honey Brown", diameter: "14.5mm", baseCurve: "8.7mm",
    replacementDuration: "Monthly", material: "Silicone Hydrogel", waterContent: "45%", prescriptionAvailable: true,
    images: [unsplash("1487412947147-5cebf100ffc2")],
    variants: [
      { label: "Plano (0.00)", price: 12900, compareAtPrice: 14900, stock: 20 },
      { label: "-1.00", price: 12900, compareAtPrice: 14900, stock: 18 },
    ],
    rating: 4.5, reviewCount: 0 },
];

const reviewPool = [
  "My new signature scent", "Compliments every single time", "Rich but never overwhelming", "Worth every penny",
  "Smells like a warm hug", "Lasts from morning to night", "So many compliments", "Cosy and luxurious",
];

async function main() {
  console.log("Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  for (const c of categories) await prisma.category.create({ data: c });
  for (const c of coupons) await prisma.coupon.create({ data: c });

  // The only account this storefront has: guest/cash-on-delivery checkout
  // means there is no customer account system at all.
  const adminEmail = process.env.ADMIN_EMAIL || "admin@aylamusk.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.user.create({
    data: { email: adminEmail, name: "Ayla Admin", passwordHash: adminPasswordHash, role: "ADMIN" },
  });

  let seed = 0;
  for (const p of products) {
    seed += 1;
    const created = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        brandLine: p.brandLine,
        department: p.department,
        categorySlug: p.category,
        accent: p.accent,
        shortDescription: p.shortDescription,
        description: p.description,
        scentFamily: p.scentFamily,
        gender: p.gender,
        notesTop: p.notes ? JSON.stringify(p.notes.top) : "[]",
        notesHeart: p.notes ? JSON.stringify(p.notes.heart) : "[]",
        notesBase: p.notes ? JSON.stringify(p.notes.base) : "[]",
        benefits: JSON.stringify(p.benefits ?? []),
        ingredients: JSON.stringify(p.ingredients ?? []),
        howToUse: p.howToUse,
        skinHairType: p.skinHairType,
        lensType: p.lensType,
        lensColor: p.lensColor,
        diameter: p.diameter,
        baseCurve: p.baseCurve,
        replacementDuration: p.replacementDuration,
        material: p.material,
        waterContent: p.waterContent,
        prescriptionAvailable: p.prescriptionAvailable ?? false,
        imagesJson: JSON.stringify(p.images),
        rating: p.rating,
        reviewCount: 0,
        featured: p.featured ?? false,
        bestseller: p.bestseller ?? false,
        isNew: p.isNew ?? false,
        variants: { create: p.variants },
      },
    });

    const reviewCount = seed % 3 === 0 ? 1 : 2;
    for (let i = 0; i < reviewCount; i++) {
      await prisma.review.create({
        data: {
          productId: created.id,
          author: ["Amélie R.", "Sofia K.", "Layla H.", "Grace T.", "Noor A."][(seed + i) % 5],
          rating: i === reviewCount - 1 && reviewCount > 1 ? 4 : 5,
          title: reviewPool[(seed + i) % reviewPool.length],
          body: reviewPool[(seed + i + 1) % reviewPool.length] + " Wears beautifully all day.",
          verified: i !== 2,
        },
      });
    }

    const agg = await prisma.review.aggregate({ where: { productId: created.id }, _avg: { rating: true }, _count: true });
    await prisma.product.update({
      where: { id: created.id },
      data: { rating: agg._avg.rating ?? p.rating, reviewCount: agg._count },
    });
  }

  console.log(`Seeded ${products.length} products, ${categories.length} categories, ${coupons.length} coupons, 1 admin user.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
