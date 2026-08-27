import { notFound } from "next/navigation";
import { getProductBySlugServer, getAllProductsServer, getRelatedProductsServer } from "@/lib/serverApi";
import ProductPageContent from "./ProductPageContent";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugServer(slug);
  if (!product) notFound();

  const allProducts = await getAllProductsServer();
  const related = getRelatedProductsServer(product, allProducts);

  return <ProductPageContent product={product} related={related} />;
}
