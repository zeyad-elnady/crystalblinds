import { supabase } from '../src/lib/supabase';
import { getProducts, getProductBySlugOrId } from '../src/lib/products';
import { slugify, getProductSlug } from '../src/lib/slugs';

async function main() {
  const products = await getProducts();
  console.log(`Loaded ${products.length} products:`);
  for (const p of products) {
    console.log(`ID: ${p.id} | Slug: ${p.slug} | LabelEn: ${p.labelEn} | LabelAr: ${p.labelAr}`);
    const testResult = await getProductBySlugOrId(p.slug || p.id);
    console.log(`  -> Lookup by slug (${p.slug}): found = ${!!testResult.product}`);
    const testResultId = await getProductBySlugOrId(p.id);
    console.log(`  -> Lookup by id (${p.id}): found = ${!!testResultId.product}`);
  }
}

main().catch(console.error);
