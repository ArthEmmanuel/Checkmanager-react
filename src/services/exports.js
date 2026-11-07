import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export async function shareTextFile(filename, content, mimeType = 'text/csv') {
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  if (!await Sharing.isAvailableAsync()) {
    throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  }
  await Sharing.shareAsync(uri, { mimeType, dialogTitle: filename });
}

export function buildReportHtml(products, history, metrics) {
  const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[character]));
  const productRows = products.map((product) => `
    <tr><td>${escapeHtml(product.nome)}</td><td>${escapeHtml(product.categoria)}</td>
    <td>${product.quantidade}</td><td>${escapeHtml(product.validade || 'Não definida')}</td>
    <td>R$ ${product.custo.toFixed(2)}</td><td>R$ ${product.preco.toFixed(2)}</td></tr>
  `).join('');
  const movementRows = history.map((item) => `
    <tr><td>${escapeHtml(item.data)}</td><td>${escapeHtml(item.nome)}</td>
    <td>${escapeHtml(item.tipo)}</td><td>${item.qtd}</td><td>${escapeHtml(item.motivo || '-')}</td></tr>
  `).join('');
  return `<!doctype html><html lang="pt-br"><meta charset="utf-8"><style>
    body{font-family:Arial,sans-serif;color:#2d3748;padding:28px}h1,h2{color:#1a365d}
    .metrics{display:flex;gap:24px;margin:20px 0}table{width:100%;border-collapse:collapse;margin:12px 0 28px}
    th,td{border:1px solid #dce3eb;padding:8px;text-align:left;font-size:11px}th{background:#1a365d;color:white}
  </style><body><h1>CheckManager — Relatório de estoque</h1>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    <h2>Resumo financeiro</h2><p>Produtos: ${products.length} · Custo do estoque: R$ ${metrics.stockCost.toFixed(2)}
    · Valor de venda: R$ ${metrics.retailValue.toFixed(2)} · Lucro potencial: R$ ${metrics.potentialProfit.toFixed(2)}</p>
    <h2>Produtos</h2><table><thead><tr><th>Nome</th><th>Categoria</th><th>Qtd.</th><th>Validade</th><th>Custo</th><th>Preço</th></tr></thead>
    <tbody>${productRows || '<tr><td colspan="6">Nenhum produto cadastrado.</td></tr>'}</tbody></table>
    <h2>Movimentações</h2><table><thead><tr><th>Data</th><th>Produto</th><th>Tipo</th><th>Qtd.</th><th>Motivo</th></tr></thead>
    <tbody>${movementRows || '<tr><td colspan="5">Nenhuma movimentação registrada.</td></tr>'}</tbody></table>
  </body></html>`;
}

export async function createReportPdf(html) {
  const file = await Print.printToFileAsync({ html });
  if (!await Sharing.isAvailableAsync()) {
    throw new Error('O compartilhamento de arquivos não está disponível neste aparelho.');
  }
  await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: 'Relatório CheckManager' });
}

export async function printReport(html) {
  await Print.printAsync({ html });
}
