import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fullReportToCsv,
  importProductsFromCsv,
  movementsToCsv,
  productsToCsv,
} from '../src/utils/csv.js';

test('imports quoted semicolon CSV values and updates products by name', () => {
  const csv = [
    'Nome;Categoria;Quantidade;Estoque Mínimo;Preço;Custo;Validade;Fornecedor;Descrição',
    '"Arroz; Integral";Alimentos;10;2;12,50;8,20;31/12/2027;Fornecedor;"Grão ""premium"""',
    'Feijão;Alimentos;5;1;9.90;6.10;;;;',
  ].join('\r\n');
  const existing = [{ id: 'existing', nome: 'Feijão', quantidade: 1 }];
  const result = importProductsFromCsv(csv, existing);

  assert.equal(result.imported, 1);
  assert.equal(result.updated, 1);
  assert.equal(result.products[0].nome, 'Feijão');
  assert.equal(result.products[0].id, 'existing');
  assert.equal(result.products[0].preco, 9.9);
  assert.equal(result.products[1].nome, 'Arroz; Integral');
  assert.equal(result.products[1].custo, 8.2);
  assert.equal(result.products[1].validade, '2027-12-31');
  assert.equal(result.products[1].descricao, 'Grão "premium"');
});

test('rejects CSV without the required identifying columns', () => {
  assert.throws(
    () => importProductsFromCsv('Categoria;Preço\nAlimentos;10', []),
    /Nome\/Produto e Quantidade\/Estoque/,
  );
});

test('exports product and movement values using quoted CSV cells', () => {
  const products = [{
    nome: 'Arroz; integral',
    categoria: 'Alimentos',
    quantidade: 3,
    minimo: 1,
    preco: 4,
    custo: 2,
    validade: '',
    fornecedor: '',
    descricao: 'Tipo "A"',
  }];
  const history = [{ data: '2026-01-01', nome: 'Arroz', tipo: 'entrada', qtd: 2, motivo: 'Compra' }];

  assert.match(productsToCsv(products), /"Arroz; integral"/);
  assert.match(productsToCsv(products), /"Tipo ""A"""/);
  assert.match(movementsToCsv(history), /"Compra"/);
  assert.match(fullReportToCsv(products, history, { stockCost: 6, retailValue: 12, potentialProfit: 6 }), /RELATÓRIO COMPLETO/);
});
