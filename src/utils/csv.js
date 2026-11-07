const PRODUCT_COLUMNS = [
  'Nome', 'Categoria', 'Quantidade', 'Estoque Mínimo', 'Preço', 'Custo',
  'Validade', 'Fornecedor', 'Descrição',
];

function escapeCsv(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

export function productsToCsv(products) {
  return [
    PRODUCT_COLUMNS.join(';'),
    ...products.map((product) => [
      product.nome,
      product.categoria,
      product.quantidade,
      product.minimo,
      product.preco,
      product.custo,
      product.validade,
      product.fornecedor,
      product.descricao,
    ].map(escapeCsv).join(';')),
  ].join('\r\n');
}

export function movementsToCsv(history) {
  return [
    ['Data', 'Produto', 'Tipo', 'Quantidade', 'Motivo'].join(';'),
    ...history.map((item) => [item.data, item.nome, item.tipo, item.qtd, item.motivo].map(escapeCsv).join(';')),
  ].join('\r\n');
}

function parseCsvRow(row, delimiter) {
  const cells = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];
    if (character === '"' && quoted && row[index + 1] === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === delimiter && !quoted) {
      cells.push(value.trim());
      value = '';
    } else {
      value += character;
    }
  }
  if (quoted) throw new Error('Uma linha contém aspas sem fechamento.');
  cells.push(value.trim());
  return cells;
}

function normalizeHeader(header) {
  return header.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function parseDate(value) {
  const match = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (match) return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  const brMatch = value.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);
  if (brMatch) {
    const year = brMatch[3].length === 2 ? `20${brMatch[3]}` : brMatch[3];
    return `${year}-${brMatch[2].padStart(2, '0')}-${brMatch[1].padStart(2, '0')}`;
  }
  return value;
}

export function importProductsFromCsv(content, existingProducts) {
  const lines = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error('O arquivo CSV está vazio ou não contém produtos.');

  const header = lines[0];
  const delimiter = [';', ',', '\t'].sort((a, b) => header.split(b).length - header.split(a).length)[0];
  const columns = parseCsvRow(header, delimiter).map(normalizeHeader);
  const findColumn = (...terms) => columns.findIndex((column) => terms.some((term) => column.includes(term)));
  const indexes = {
    nome: findColumn('nome', 'produto'),
    categoria: findColumn('categoria'),
    quantidade: findColumn('quantidade', 'qtd', 'estoque'),
    minimo: findColumn('minimo'),
    preco: findColumn('preco'),
    custo: findColumn('custo'),
    validade: findColumn('validade'),
    fornecedor: findColumn('fornecedor'),
    descricao: findColumn('descricao'),
  };
  if (indexes.nome < 0 || indexes.quantidade < 0) {
    throw new Error('O CSV precisa conter as colunas Nome/Produto e Quantidade/Estoque.');
  }

  const products = [...existingProducts];
  const result = { products, imported: 0, updated: 0, ignored: 0, errors: [] };
  lines.slice(1).forEach((line, index) => {
    try {
      const cells = parseCsvRow(line, delimiter);
      const name = cells[indexes.nome]?.trim();
      if (!name) {
        result.ignored += 1;
        return;
      }
      const valueAt = (key) => indexes[key] >= 0 ? cells[indexes[key]] || '' : '';
      const parseNumber = (value) => {
        const normalized = String(value).trim().replace(/\s/g, '').replace(/\.(?=\d{3}(?:\D|$))/g, '').replace(',', '.');
        const parsed = Number.parseFloat(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const product = {
        id: `CSV-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
        nome: name,
        categoria: valueAt('categoria') || 'Outros',
        quantidade: Number.parseInt(valueAt('quantidade'), 10) || 0,
        minimo: Number.parseInt(valueAt('minimo'), 10) || 0,
        preco: parseNumber(valueAt('preco')),
        custo: parseNumber(valueAt('custo')),
        validade: parseDate(valueAt('validade')),
        fornecedor: valueAt('fornecedor'),
        descricao: valueAt('descricao'),
        dataCadastro: new Date().toISOString(),
      };
      const existingIndex = products.findIndex((item) => item.nome.toLowerCase() === name.toLowerCase());
      if (existingIndex >= 0) {
        product.id = products[existingIndex].id;
        products[existingIndex] = { ...products[existingIndex], ...product };
        result.updated += 1;
      } else {
        products.push(product);
        result.imported += 1;
      }
    } catch (error) {
      result.errors.push(`Linha ${index + 2}: ${error.message}`);
    }
  });
  return result;
}

export function fullReportToCsv(products, history, metrics) {
  return [
    'RELATÓRIO COMPLETO - CHECKMANAGER',
    `Data do Relatório;${new Date().toLocaleDateString('pt-BR')}`,
    '',
    'RESUMO FINANCEIRO',
    `Total de Produtos;${products.length}`,
    `Custo Total do Estoque;${metrics.stockCost.toFixed(2)}`,
    `Valor Total de Venda;${metrics.retailValue.toFixed(2)}`,
    `Lucro Potencial;${metrics.potentialProfit.toFixed(2)}`,
    '',
    productsToCsv(products),
    '',
    'MOVIMENTAÇÕES',
    movementsToCsv(history),
  ].join('\r\n');
}
