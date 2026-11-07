import { useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button, ButtonRow, ScreenTitle, SelectField, TextField } from '../components/UIComponents';
import { ListScreen, MovementCard, SectionCard } from '../components/LayoutComponents';
import { colors } from '../theme';

const MOVEMENT_TYPES = ['Entrada', 'Saída'];

export default function MovementsScreen({ inventory, onExportMovements, onClearHistory, notify }) {
  const { products, history, registerMovement } = inventory;
  const [selectedProductId, setSelectedProductId] = useState('');
  const [type, setType] = useState('Entrada');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const productOptions = useMemo(() => products.map((product) => `${product.nome} · ${product.quantidade} un.`), [products]);
  const selectedProduct = products.find((product) => product.id === selectedProductId);
  const sortedHistory = useMemo(
    () => [...history].sort((a, b) => new Date(b.data) - new Date(a.data)),
    [history],
  );

  const submit = () => {
    if (!selectedProduct) {
      Alert.alert('Produto obrigatório', 'Selecione um produto para registrar a movimentação.');
      return;
    }
    try {
      registerMovement(selectedProduct.id, type === 'Entrada' ? 'entrada' : 'saida', quantity, reason);
      setQuantity('');
      setReason('');
      notify(`Movimentação de ${type.toLowerCase()} registrada.`);
    } catch (error) {
      Alert.alert('Não foi possível registrar', error.message);
    }
  };

  return (
    <ListScreen
      data={sortedHistory}
      keyExtractor={(movement, index) => `${movement.data}-${movement.nome}-${index}`}
      renderItem={({ item }) => <MovementCard movement={item} />}
      ListHeaderComponent={(
        <>
          <ScreenTitle title="Movimentações" subtitle="Registre entradas e saídas e consulte o histórico do estoque." />
          <SectionCard title="Registrar movimentação">
            {!products.length ? (
              <Text style={{ color: colors.muted }}>Cadastre um produto antes de registrar movimentações.</Text>
            ) : (
              <>
                <SelectField
                  label="Produto *"
                  value={selectedProduct ? `${selectedProduct.nome} · ${selectedProduct.quantidade} un.` : ''}
                  options={productOptions}
                  onChange={(label) => {
                    const product = products.find((item) => `${item.nome} · ${item.quantidade} un.` === label);
                    setSelectedProductId(product?.id || '');
                  }}
                  placeholder="Selecione um produto"
                />
                <SelectField label="Tipo *" value={type} options={MOVEMENT_TYPES} onChange={setType} />
                <TextField label="Quantidade *" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="1" />
                <TextField label="Motivo" value={reason} onChangeText={setReason} placeholder="Ex.: Compra, venda ou ajuste" />
                <Button title="Registrar movimentação" onPress={submit} />
              </>
            )}
          </SectionCard>
          <SectionCard title="Histórico de movimentações">
            <Text style={{ color: colors.muted, fontSize: 13 }}>{history.length} movimentação(ões)</Text>
          </SectionCard>
        </>
      )}
      ListEmptyComponent={(
        <Text style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>
          Nenhuma movimentação registrada.
        </Text>
      )}
      ListFooterComponent={(
        <ButtonRow>
          <Button title="Exportar movimentos" variant="outline" onPress={onExportMovements} />
          <Button title="Limpar histórico" variant="danger" onPress={onClearHistory} />
        </ButtonRow>
      )}
    />
  );
}
