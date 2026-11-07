const PRODUCT_ENDPOINT = (
  process.env.EXPO_PUBLIC_API_URL
  || 'https://world.openfoodfacts.org/api/v3.6/product'
).replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 10000;
const PRODUCT_FIELDS = [
  'product_name',
  'product_name_pt',
  'generic_name',
  'generic_name_pt',
  'brands',
  'categories',
  'categories_tags',
  'quantity',
].join(',');

function firstText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim())?.trim() || '';
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function normalizeProduct(product) {
  const name = firstText(
    product.product_name_pt,
    product.product_name,
    product.generic_name_pt,
    product.generic_name,
  );
  const brand = firstText(product.brands?.split(',')[0]);
  const quantity = firstText(product.quantity);

  if (!name && !brand) return null;

  const productName = name || brand;
  const normalizedName = normalizeText(productName);
  const nameParts = [productName];
  if (brand && name && !normalizedName.includes(normalizeText(brand))) nameParts.push(brand);
  if (quantity && !normalizedName.includes(normalizeText(quantity))) nameParts.push(quantity);

  const categoryText = normalizeText([
    Array.isArray(product.categories_tags) ? product.categories_tags.join(' ') : '',
    product.categories,
    productName,
  ].join(' '));
  const isDrink = [
    'beverage', 'drink', 'bebida', 'water', 'agua', 'juice', 'suco',
    'refrigerante', 'soda', 'beer', 'cerveja', 'wine', 'vinho', 'alcoholic',
  ].some((term) => categoryText.includes(term));

  return {
    nome: nameParts.join(' - '),
    categoria: isDrink ? 'Bebidas' : 'Alimentos',
    preco: '',
    custo: '',
    origem: 'openfoodfacts',
  };
}

export async function fetchProductByBarcode(barcode) {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(
        `${PRODUCT_ENDPOINT}/${encodeURIComponent(barcode)}.json?fields=${PRODUCT_FIELDS}&lc=pt&cc=br`,
        {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        },
      );
    } catch (error) {
      if (timedOut || error.name === 'AbortError') {
        throw new Error('A consulta demorou demais. Verifique a conexão e tente novamente.');
      }
      throw new Error('Não foi possível conectar à API. Verifique sua conexão com a internet e tente novamente.');
    }

    if (!response.ok) {
      throw new Error(`Open Food Facts respondeu com status ${response.status}.`);
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      if (timedOut || error.name === 'AbortError') {
        throw new Error('A consulta demorou demais. Verifique a conexão e tente novamente.');
      }
      throw new Error('A API retornou uma resposta inválida. Tente novamente mais tarde.');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('A API retornou uma resposta inválida. Tente novamente mais tarde.');
    }

    const found = data.status === 'success' || data.status === 1 || data.result?.id === 'product_found';
    if (!found) {
      if (data.status === 0 || data.status === 'failure') return null;
      throw new Error('A API retornou uma resposta inválida. Tente novamente mais tarde.');
    }
    if (!data.product || typeof data.product !== 'object' || Array.isArray(data.product)) {
      throw new Error('A API retornou dados inválidos para este produto. Tente novamente mais tarde.');
    }
    return normalizeProduct(data.product);
  } finally {
    clearTimeout(timeoutId);
  }
}
