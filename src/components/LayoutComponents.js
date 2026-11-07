import { FlatList, ScrollView, Text, View } from 'react-native';
import { Button, ButtonRow, Card, SectionTitle } from './UIComponents';
import { colors } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';
import styles from './LayoutComponents.styles';

export function ScrollScreen({ children }) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

export function ListScreen({ data, renderItem, keyExtractor, ListHeaderComponent, ListFooterComponent, ListEmptyComponent }) {
  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.listContent}
      keyboardShouldPersistTaps="handled"
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ItemSeparatorComponent={ListSeparator}
      ListHeaderComponent={ListHeaderComponent}
      ListHeaderComponentStyle={styles.listHeader}
      ListFooterComponent={ListFooterComponent}
      ListFooterComponentStyle={styles.listFooter}
      ListEmptyComponent={ListEmptyComponent}
    />
  );
}

function ListSeparator() {
  return <View style={styles.listSeparator} />;
}

export function ContentRow({ children }) {
  return <View style={styles.row}>{children}</View>;
}

export function ProgressRow({ label, value, max, color = colors.accent, suffix = '' }) {
  const width = max > 0 ? `${Math.max(value > 0 ? 2 : 0, Math.min(100, (value / max) * 100))}%` : '0%';
  return (
    <View style={styles.progressRow}>
      <Text numberOfLines={1} style={styles.progressLabel}>{label}</Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width, backgroundColor: color }]} />
      </View>
      <Text style={styles.progressValue}>{Number(value || 0).toLocaleString('pt-BR')}{suffix}</Text>
    </View>
  );
}

export function SectionCard({ title, children }) {
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      {children}
    </Card>
  );
}

export function AlertCard({ item }) {
  const foreground = item.type === 'danger'
    ? colors.danger
    : item.type === 'warning'
      ? colors.warning
      : item.type === 'success'
        ? colors.success
        : colors.info;
  const background = item.type === 'danger'
    ? '#fff1f0'
    : item.type === 'warning'
      ? '#fff8e6'
      : item.type === 'success'
        ? '#eafaf5'
        : '#eff6ff';

  return (
    <View style={[styles.alert, { backgroundColor: background }]}>
      <Text style={[styles.alertMessage, { color: foreground }]}>{item.message}</Text>
      <Text style={styles.alertAction}>{item.action}</Text>
    </View>
  );
}

export function ProductCard({ product, onEdit, onDelete }) {
  const stockColor = product.quantidade === 0
    ? colors.danger
    : product.quantidade <= product.minimo
      ? colors.warning
      : colors.success;
  const margin = product.preco > 0
    ? `${(((product.preco - product.custo) / product.preco) * 100).toFixed(1)}%`
    : 'N/A';

  return (
    <Card>
      <View style={styles.itemLine}>
        <Text style={styles.productTitle}>{product.nome}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${stockColor}18` }]}>
          <Text style={[styles.statusText, { color: stockColor }]}>
            {product.quantidade === 0 ? 'ZERADO' : product.quantidade <= product.minimo ? 'BAIXO' : 'NORMAL'}
          </Text>
        </View>
      </View>
      <Text style={styles.productMeta}>
        {product.categoria} · {product.quantidade} un. (mín. {product.minimo})
      </Text>
      <Text style={styles.productMeta}>
        Venda {formatCurrency(product.preco)} · Custo {formatCurrency(product.custo)} · Margem {margin}
      </Text>
      {product.validade || product.codigoBarras ? (
        <Text style={styles.productMeta}>
          {product.validade ? `Validade: ${formatDate(product.validade)}` : ''}
          {product.validade && product.codigoBarras ? ' · ' : ''}
          {product.codigoBarras ? `EAN: ${product.codigoBarras}` : ''}
        </Text>
      ) : null}
      {product.fornecedor ? <Text style={styles.productMeta}>Fornecedor: {product.fornecedor}</Text> : null}
      {product.descricao ? <Text style={styles.productMeta}>{product.descricao}</Text> : null}
      {onEdit || onDelete ? (
        <ButtonRow>
          {onEdit ? <Button title="Editar" variant="outline" onPress={onEdit} /> : null}
          {onDelete ? <Button title="Excluir" variant="danger" onPress={onDelete} /> : null}
        </ButtonRow>
      ) : null}
    </Card>
  );
}

export function MovementCard({ movement }) {
  const isEntry = movement.tipo === 'entrada';
  return (
    <Card style={styles.movementCard}>
      <View style={styles.itemLine}>
        <Text style={styles.productTitle}>{movement.nome}</Text>
        <View style={[styles.statusBadge, { backgroundColor: isEntry ? '#eafaf5' : '#fff1f0' }]}>
          <Text style={[styles.statusText, { color: isEntry ? colors.success : colors.danger }]}>
            {isEntry ? 'ENTRADA' : 'SAÍDA'}
          </Text>
        </View>
      </View>
      <Text style={styles.productMeta}>{formatDate(movement.data)} · {movement.qtd} unidade(s)</Text>
      {movement.motivo ? <Text style={styles.productMeta}>Motivo: {movement.motivo}</Text> : null}
    </Card>
  );
}
