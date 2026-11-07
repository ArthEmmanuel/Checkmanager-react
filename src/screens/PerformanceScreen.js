import { Text } from 'react-native';
import { ScreenTitle } from '../components/UIComponents';
import { ProgressRow, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { getRecentMovementTotals } from '../utils/analytics';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

export default function PerformanceScreen({ inventory }) {
  const { products, history } = inventory;
  const topProducts = [...products]
    .map((product) => ({ ...product, stockValue: product.quantidade * product.custo }))
    .sort((a, b) => b.stockValue - a.stockValue)
    .slice(0, 8);
  const maxValue = Math.max(0, ...topProducts.map((product) => product.stockValue));
  const movementTotals = getRecentMovementTotals(history);
  const maxMovement = Math.max(0, ...movementTotals.flatMap((item) => [item.entries, item.exits]));

  return (
    <ScrollScreen>
      <ScreenTitle title="Performance" subtitle="Produtos de maior valor em estoque e movimentações da última semana." />
      <SectionCard title="Top produtos por valor em estoque">
        {topProducts.length
          ? topProducts.map((product) => (
            <ProgressRow
              key={product.id}
              label={product.nome}
              value={product.stockValue}
              max={maxValue}
              color={colors.primary}
            />
          ))
          : <Text style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>Cadastre produtos para visualizar o desempenho.</Text>}
        {topProducts.map((product) => (
          <Text key={`${product.id}-value`} style={{ color: colors.muted, fontSize: 12 }}>
            {product.nome}: {formatCurrency(product.stockValue)}
          </Text>
        ))}
      </SectionCard>
      <SectionCard title="Movimentações nos últimos 7 dias">
        {movementTotals.map((day) => (
          <SectionCard key={day.label} title={day.label}>
            <ProgressRow label="Entradas" value={day.entries} max={maxMovement} color={colors.success} />
            <ProgressRow label="Saídas" value={day.exits} max={maxMovement} color={colors.danger} />
          </SectionCard>
        ))}
      </SectionCard>
    </ScrollScreen>
  );
}
