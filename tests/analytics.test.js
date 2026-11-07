import test from 'node:test';
import assert from 'node:assert/strict';
import { getInventoryMetrics } from '../src/utils/analytics.js';

test('calculates stock value, retail value, margins and stock status', () => {
  const products = [
    { nome: 'Arroz', categoria: 'Alimentos', quantidade: 10, minimo: 3, preco: 12, custo: 8, validade: '' },
    { nome: 'Suco', categoria: 'Bebidas', quantidade: 2, minimo: 5, preco: 10, custo: 6, validade: '' },
    { nome: 'Farinha', categoria: 'Alimentos', quantidade: 0, minimo: 2, preco: 5, custo: 3, validade: '' },
  ];
  const history = [
    { tipo: 'entrada', qtd: 4 },
    { tipo: 'saida', qtd: 2 },
  ];
  const result = getInventoryMetrics(products, history);

  assert.equal(result.totalProducts, 3);
  assert.equal(result.stockCost, 92);
  assert.equal(result.retailValue, 140);
  assert.equal(result.potentialProfit, 48);
  assert.ok(Math.abs(result.averageMargin - 37.7777777778) < 0.000001);
  assert.equal(result.normalCount, 1);
  assert.equal(result.lowCount, 1);
  assert.equal(result.zeroCount, 1);
  assert.equal(result.entries, 4);
  assert.equal(result.exits, 2);
  assert.equal(result.categories.Alimentos, 2);
});
