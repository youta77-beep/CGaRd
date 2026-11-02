// Product lookup for the legacy registry views.
// No product data lives here: brand, name, volume, actives and image all come from the
// Sheets DB (Products, ProductIngredients, Ingredients) via useSheetProducts().
// It only resolves legacy registry slugs (PRODUCT_ID_TO_SLUG) to Sheets product_ids.
import type { ProductSummary } from './sheetCards';
import { PRODUCT_ID_TO_SLUG } from './registryProducts';

export interface ProductPhotoInfo {
  slug: string;
  brand: string;
  product_name: string;
  image_url: string;
  volume: string;
  key_actives: string[];
}

const SLUG_TO_PRODUCT_ID: Record<string, string> = Object.fromEntries(
  Object.entries(PRODUCT_ID_TO_SLUG).map(([productId, slug]) => [slug, productId])
);

function findProduct(
  products: ReadonlyMap<string, ProductSummary>,
  slug?: string,
  brand?: string
): ProductSummary | undefined {
  if (slug) {
    const byId = products.get(slug) || products.get(SLUG_TO_PRODUCT_ID[slug] ?? '');
    if (byId) return byId;
  }
  if (brand) {
    const brandLower = brand.toLowerCase();
    for (const product of products.values()) {
      const productBrand = product.brand.toLowerCase();
      if (productBrand && (brandLower.includes(productBrand) || productBrand.includes(brandLower))) return product;
    }
  }
  return undefined;
}

/**
 * Display info for a legacy slug / Sheets product_id / brand, read from the Sheets DB.
 * Fields are empty when the DB has not loaded yet or has no matching product.
 */
export function getProductPhoto(
  slug?: string,
  brand?: string,
  products: ReadonlyMap<string, ProductSummary> = new Map()
): ProductPhotoInfo {
  const product = findProduct(products, slug, brand);
  if (!product) {
    return { slug: slug || '', brand: brand || '', product_name: '', image_url: '', volume: '', key_actives: [] };
  }
  return {
    slug: PRODUCT_ID_TO_SLUG[product.productId] || product.productId,
    brand: product.brand,
    product_name: product.name,
    image_url: product.imageUrl || '',
    volume: product.volumeMl ? `${product.volumeMl} ml` : '',
    key_actives: product.actives.map((active) => active.name),
  };
}
