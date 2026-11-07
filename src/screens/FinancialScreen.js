import { Text } from 'react-native';
import { MetricCard, ScreenTitle } from '../components/UIComponents';
import { ContentRow, ProgressRow, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

export default function FinancialScreen({ inventory }) {
  const { products, metrics } = inventory;
  const margins = products
    .filter((product) => product.preco > 0 && product.custo > 0)
    .map((product) => ({ name: product.nome, margin: ((product.preco - product.custo) / product.preco) * 100 }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);
  const categoryValues = Object.entries(metrics.categoryValues).sort((a, b) => b[1] - a[1]);
  const maxCategoryValue = Math.max(0, ...categoryValues.map(([, value]) => value));

  return (
    <ScrollScreen>
      <ScreenTitle title="Análise financeira" subtitle="Rentabilidade e valor de custo do estoque atual." />
      <ContentRow>
        <MetricCard label="Custo total do estoque" value={formatCurrency(metrics.stockCost)} />
        <MetricCard label="Valor total de venda" value={formatCurrency(metrics.retailValue)} />
        <MetricCard label="Lucro potencial" value={formatCurrency(metrics.potentialProfit)} color={metrics.potentialProfit >= 0 ? colors.success : colors.danger} />
        <MetricCard label="Margem média" value={`${metrics.averageMargin.toFixed(1)}%`} />
      </ContentRow>
      <SectionCard title="Margem de lucro por produto">
        {margins.length
          ? margins.map((item) => (
            <ProgressRow
              key={item.name}
              label={item.name}
              value={Math.max(item.margin, 0)}
              max={100}
              suffix="%"
              color={item.margin >= 20 ? colors.success : item.margin >= 10 ? colors.warning : colors.danger}
            />
          ))
          : <TextEmpty>Nenhum produto com preço e custo para calcular margem.</TextEmpty>}
      </SectionCard>
      <SectionCard title="Valor de custo por categoria">
        {categoryValues.length
          ? categoryValues.map(([category, value]) => (
            <ProgressRow
              key={category}
              label={category}
              value={value}
              max={maxCategoryValue}
              suffix=""
            />
          ))
          : <TextEmpty>Cadastre produtos com custo para visualizar o valor por categoria.</TextEmpty>}
        {categoryValues.map(([category, value]) => (
          <Text key={`${category}-value`} style={{ color: colors.muted, fontSize: 12 }}>
            {category}: {formatCurrency(value)}
          </Text>
        ))}
      </SectionCard>
    </ScrollScreen>
  );
}

function TextEmpty({ children }) {
  return <Text style={{ color: colors.muted, textAlign: 'center', lineHeight: 20 }}>{children}</Text>;
}
