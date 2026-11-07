import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchProductByBarcode } from '../src/services/api.js';

async function withMockedFetch(mockFetch, action) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = mockFetch;
  try {
    return await action();
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test('looks up a barcode and normalizes real product fields', async () => {
  const product = await withMockedFetch(async (url, options) => {
    assert.match(url, /3017620422003\.json/);
    assert.match(url, /fields=product_name/);
    assert.equal(options.headers.Accept, 'application/json');
    assert.ok(options.signal instanceof AbortSignal);
    return {
      ok: true,
      json: async () => ({
        status: 'success',
        product: {
          product_name: 'Creme de avelã',
          brands: 'Marca Exemplo',
          quantity: '350 g',
          categories: 'Chocolate spreads',
        },
      }),
    };
  }, () => fetchProductByBarcode('3017620422003'));

  assert.deepEqual(product, {
    nome: 'Creme de avelã - Marca Exemplo - 350 g',
    categoria: 'Alimentos',
    preco: '',
    custo: '',
    origem: 'openfoodfacts',
  });
});

test('returns null when the API reports an unknown barcode', async () => {
  const product = await withMockedFetch(async () => ({
    ok: true,
    json: async () => ({ status: 0 }),
  }), () => fetchProductByBarcode('0000000000000'));

  assert.equal(product, null);
});

test('reports HTTP failures from the product API', async () => {
  await withMockedFetch(async () => ({ ok: false, status: 503 }), async () => {
    await assert.rejects(
      fetchProductByBarcode('3017620422003'),
      /Open Food Facts respondeu com status 503/,
    );
  });
});

test('reports connection failures with a retryable message', async () => {
  await withMockedFetch(async () => {
    throw new TypeError('Network request failed');
  }, async () => {
    await assert.rejects(
      fetchProductByBarcode('3017620422003'),
      /Verifique sua conexão com a internet e tente novamente/,
    );
  });
});

test('reports malformed API responses', async () => {
  await withMockedFetch(async () => ({
    ok: true,
    json: async () => { throw new SyntaxError('Unexpected token'); },
  }), async () => {
    await assert.rejects(
      fetchProductByBarcode('3017620422003'),
      /A API retornou uma resposta inválida/,
    );
  });
});

test('rejects JSON values that do not match the API response shape', async () => {
  await withMockedFetch(async () => ({
    ok: true,
    json: async () => null,
  }), async () => {
    await assert.rejects(
      fetchProductByBarcode('3017620422003'),
      /A API retornou uma resposta inválida/,
    );
  });
});
