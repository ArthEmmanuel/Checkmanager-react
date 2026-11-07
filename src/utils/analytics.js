export function getInventoryMetrics(products, history) {
  const stockCost = products.reduce((sum, product) => sum + product.quantidade * product.custo, 0);
  const retailValue = products.reduce((sum, product) => sum + product.quantidade * product.preco, 0);
  const pricedProducts = products.filter((product) => product.preco > 0 && product.custo > 0);
  const lowStock = products.filter((product) => product.quantidade <= product.minimo);
  const nearExpiry = products.filter((product) => {
    if (!product.validade) return false;
    const days = (new Date(`${product.validade}T12:00:00`) - new Date(new Date().setHours(12, 0, 0, 0))) / 86400000;
    return days >= 0 && days <= 30;
  });
  const categories = products.reduce((result, product) => {
    result[product.categoria || 'Sem Categoria'] = (result[product.categoria || 'Sem Categoria'] || 0) + 1;
    return result;
  }, {});
  const categoryValues = products.reduce((result, product) => {
    const category = product.categoria || 'Sem Categoria';
    result[category] = (result[category] || 0) + product.quantidade * product.custo;
    return result;
  }, {});
  const entries = history.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + item.qtd, 0);
  const exits = history.filter((item) => item.tipo === 'saida').reduce((sum, item) => sum + item.qtd, 0);
  const alerts = [];

  products.forEach((product) => {
    if (product.quantidade === 0) {
      alerts.push({ type: 'danger', message: `Estoque zerado: ${product.nome}`, action: 'Repor urgente', target: 'movements' });
    } else if (product.quantidade <= product.minimo) {
      alerts.push({ type: 'warning', message: `Estoque baixo: ${product.nome} (${product.quantidade} unidades)`, action: 'Repor estoque', target: 'movements' });
    }

    if (product.validade) {
      const days = Math.ceil((new Date(`${product.validade}T12:00:00`) - new Date(new Date().setHours(12, 0, 0, 0))) / 86400000);
      if (days < 0) {
        alerts.push({ type: 'danger', message: `Produto vencido: ${product.nome}`, action: 'Verificar produto', target: 'inventory' });
      } else if (days <= 7) {
        alerts.push({ type: 'danger', message: `Validade crítica (${days} dias): ${product.nome}`, action: 'Verificar urgente', target: 'inventory' });
      } else if (days <= 30) {
        alerts.push({ type: 'warning', message: `Validade próxima (${days} dias): ${product.nome}`, action: 'Verificar validade', target: 'inventory' });
      }
    }
  });

  const withoutExpiry = products.filter((product) => !product.validade).length;
  if (withoutExpiry) {
    alerts.push({
      type: 'info',
      message: `${withoutExpiry} produto(s) sem data de validade definida`,
      action: 'Definir validades',
      target: 'inventory',
    });
  }

  return {
    totalProducts: products.length,
    lowStock: lowStock.length,
    nearExpiry: nearExpiry.length,
    stockCost,
    retailValue,
    potentialProfit: retailValue - stockCost,
    averageMargin: pricedProducts.length
      ? pricedProducts.reduce((sum, product) => sum + ((product.preco - product.custo) / product.preco) * 100, 0) / pricedProducts.length
      : 0,
    normalCount: products.filter((product) => product.quantidade > product.minimo).length,
    lowCount: products.filter((product) => product.quantidade <= product.minimo && product.quantidade > 0).length,
    zeroCount: products.filter((product) => product.quantidade === 0).length,
    categories,
    categoryValues,
    entries,
    exits,
    movementCount: history.length,
    alerts,
  };
}

export function getRecentMovementTotals(history, days = 7) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (days - index - 1));
    const dateKey = date.toLocaleDateString('pt-BR');
    const dayItems = history.filter((item) => {
      const movementDate = new Date(item.data);
      return !Number.isNaN(movementDate.getTime()) && movementDate.toLocaleDateString('pt-BR') === dateKey;
    });
    return {
      label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      entries: dayItems.filter((item) => item.tipo === 'entrada').reduce((sum, item) => sum + item.qtd, 0),
      exits: dayItems.filter((item) => item.tipo === 'saida').reduce((sum, item) => sum + item.qtd, 0),
    };
  });
}
