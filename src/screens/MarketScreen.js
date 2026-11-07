import { Text } from 'react-native';
import { MetricCard, ScreenTitle } from '../components/UIComponents';
import { ContentRow, ProgressRow, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { colors } from '../theme';

export default function MarketScreen({ inventory }) {
  const { metrics } = inventory;
  const categories = Object.entries(metrics.categories).sort((a, b) => b[1] - a[1]);
  const categoryMax = Math.max(0, ...categories.map(([, count]) => count));
  const status = [
    { label: 'Normal', count: metrics.normalCount, color: colors.success },
    { label: 'Estoque baixo', count: metrics.lowCount, color: colors.warning },
    { label: 'Estoque zerado', count: metrics.zeroCount, color: colors.danger },
  ];

  return (
    <ScrollScreen>
      <ScreenTitle title="Métricas de mercado" subtitle="Distribuição por categoria e situação dos produtos cadastrados." />
      <ContentRow>
        <MetricCard label="Categorias" value={categories.length} />
        <MetricCard label="Produtos ativos" value={metrics.normalCount} color={colors.success} />
        <MetricCard label="Itens que precisam de atenção" value={metrics.lowStock} color={metrics.lowStock ? colors.warning : colors.success} />
      </ContentRow>
      <SectionCard title="Distribuição por categoria">
        {categories.length
          ? categories.map(([category, count]) => <ProgressRow key={category} label={category} value={count} max={categoryMax} color={colors.blue} />)
          : <Text style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>Cadastre produtos para ver a distribuição.</Text>}
      </SectionCard>
      <SectionCard title="Status do estoque">
        {status.map((item) => (
          <ProgressRow key={item.label} label={item.label} value={item.count} max={metrics.totalProducts} color={item.color} />
        ))}
        <Text style={{ color: colors.muted, fontSize: 12 }}>
          Normal: {metrics.normalCount} · Baixo: {metrics.lowCount} · Zerado: {metrics.zeroCount}
        </Text>
      </SectionCard>
    </ScrollScreen>
  );
}
