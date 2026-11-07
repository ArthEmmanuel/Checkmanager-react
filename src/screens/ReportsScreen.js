import { Button, MetricCard, ScreenTitle } from '../components/UIComponents';
import { ContentRow, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { formatCurrency } from '../utils/format';
import { colors } from '../theme';

export default function ReportsScreen({ inventory, onExportReportCsv, onExportPdf, onPrintReport }) {
  const { metrics } = inventory;
  return (
    <ScrollScreen>
      <ScreenTitle title="Relatórios" subtitle="Resumo financeiro, indicadores de operação e exportação dos dados." />
      <SectionCard title="Scorecard financeiro">
        <ContentRow>
          <MetricCard label="Total de produtos" value={metrics.totalProducts} />
          <MetricCard label="Custo do estoque" value={formatCurrency(metrics.stockCost)} />
          <MetricCard label="Valor de venda" value={formatCurrency(metrics.retailValue)} />
          <MetricCard label="Lucro potencial" value={formatCurrency(metrics.potentialProfit)} color={metrics.potentialProfit >= 0 ? colors.success : colors.danger} />
          <MetricCard label="Margem média" value={`${metrics.averageMargin.toFixed(1)}%`} />
        </ContentRow>
      </SectionCard>
      <SectionCard title="Indicadores de performance">
        <ContentRow>
          <MetricCard label="Itens em alerta" value={metrics.lowStock} color={metrics.lowStock ? colors.warning : colors.success} />
          <MetricCard label="Total de movimentações" value={metrics.movementCount} />
          <MetricCard label="Entradas (unidades)" value={metrics.entries} color={colors.success} />
          <MetricCard label="Saídas (unidades)" value={metrics.exits} color={colors.danger} />
        </ContentRow>
      </SectionCard>
      <SectionCard title="Exportar relatório">
        <Button title="Gerar PDF" onPress={onExportPdf} />
        <Button title="Exportar CSV completo" variant="outline" onPress={onExportReportCsv} />
        <Button title="Imprimir relatório" variant="outline" onPress={onPrintReport} />
      </SectionCard>
    </ScrollScreen>
  );
}
