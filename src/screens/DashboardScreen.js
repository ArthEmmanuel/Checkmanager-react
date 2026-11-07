import { Button, MetricCard, ScreenTitle } from '../components/UIComponents';
import { AlertCard, ContentRow, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

export default function DashboardScreen({ inventory, navigate, notify }) {
  const { metrics } = inventory;
  return (
    <ScrollScreen>
      <ScreenTitle title="Visão geral do estoque" subtitle="Acompanhe os indicadores e alertas da sua operação." />
      <ContentRow>
        <MetricCard label="Produtos cadastrados" value={metrics.totalProducts} />
        <MetricCard label="Itens em alerta" value={metrics.lowStock} color={metrics.lowStock ? colors.danger : colors.success} />
        <MetricCard label="Validades em até 30 dias" value={metrics.nearExpiry} color={metrics.nearExpiry ? colors.warning : colors.success} />
        <MetricCard label="Custo total do estoque" value={formatCurrency(metrics.stockCost)} />
      </ContentRow>
      <SectionCard title="Alertas e ações necessárias">
        {metrics.alerts.length
          ? metrics.alerts.map((alert, index) => (
            <AlertCard key={`${alert.message}-${index}`} item={alert} />
          ))
          : <AlertCard item={{ type: 'success', message: 'Tudo sob controle!', action: 'Nenhum alerta no momento.' }} />}
      </SectionCard>
      <SectionCard title="Acesso rápido">
        <Button title="Cadastrar produto" onPress={() => navigate('inventory')} />
        <Button title="Ler código de barras" variant="secondary" onPress={() => navigate('quick')} />
        <Button title="Registrar movimentação" variant="outline" onPress={() => {
          if (!metrics.totalProducts) {
            notify('Cadastre um produto antes de registrar movimentações.');
            navigate('inventory');
            return;
          }
          navigate('movements');
        }} />
      </SectionCard>
    </ScrollScreen>
  );
}
