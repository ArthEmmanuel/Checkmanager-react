import { useEffect, useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button, ButtonRow, MetricCard, ScreenTitle, SelectField, TextField } from '../components/UIComponents';
import { ContentRow, ListScreen, ProductCard, SectionCard } from '../components/LayoutComponents';
import { colors } from '../theme';

const CATEGORIES = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Eletrônicos', 'Vestuário', 'Outros', 'Sem Categoria'];
const STOCK_FILTERS = ['Todos', 'Normal', 'Estoque baixo', 'Sem estoque'];

function emptyForm() {
  return {
    nome: '',
    categoria: '',
    quantidade: '0',
    minimo: '0',
    preco: '',
    custo: '',
    validade: '',
    fornecedor: '',
    descricao: '',
  };
}

export default function InventoryScreen({ inventory, onImportProducts, onExportProducts, onClearProducts, notify }) {
  const { products, metrics, editingProduct, setEditingProduct, saveProduct, deleteProduct } = inventory;
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas as categorias');
  const [stockFilter, setStockFilter] = useState('Todos');

  useEffect(() => {
    if (!editingProduct) {
      setForm(emptyForm());
      return;
    }
    setForm({
      ...editingProduct,
      quantidade: String(editingProduct.quantidade),
      minimo: String(editingProduct.minimo),
      preco: String(editingProduct.preco || ''),
      custo: String(editingProduct.custo || ''),
    });
  }, [editingProduct]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    if (search && !`${product.nome} ${product.codigoBarras || ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'Todas as categorias' && product.categoria !== categoryFilter) return false;
    if (stockFilter === 'Normal' && product.quantidade <= product.minimo) return false;
    if (stockFilter === 'Estoque baixo' && !(product.quantidade > 0 && product.quantidade <= product.minimo)) return false;
    if (stockFilter === 'Sem estoque' && product.quantidade !== 0) return false;
    return true;
  }), [products, search, categoryFilter, stockFilter]);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const submit = () => {
    try {
      const quantity = Number(form.quantidade);
      const minimum = Number(form.minimo);
      const price = Number(String(form.preco).replace(',', '.')) || 0;
      const cost = Number(String(form.custo).replace(',', '.')) || 0;
      if (!Number.isInteger(quantity) || quantity < 0) throw new Error('A quantidade deve ser um número inteiro igual ou maior que zero.');
      if (!Number.isInteger(minimum) || minimum < 0) throw new Error('O estoque mínimo deve ser um número inteiro igual ou maior que zero.');
      if (!Number.isFinite(price) || !Number.isFinite(cost) || price < 0 || cost < 0) {
        throw new Error('Informe valores válidos e não negativos para preço e custo.');
      }
      saveProduct({
        ...form,
        id: editingProduct?.id || String(Date.now()),
        nome: form.nome.trim(),
        categoria: form.categoria || 'Sem Categoria',
        quantidade: quantity,
        minimo: minimum,
        preco: price,
        custo: cost,
        dataCadastro: editingProduct?.dataCadastro || new Date().toISOString(),
      });
      setForm(emptyForm());
      notify(editingProduct ? 'Produto atualizado.' : 'Produto cadastrado.');
    } catch (error) {
      Alert.alert('Não foi possível salvar', error.message);
    }
  };
  const startEditing = (product) => {
    setEditingProduct(product);
  };
  const confirmDelete = (product) => Alert.alert('Excluir produto', `Deseja excluir "${product.nome}"?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: () => deleteProduct(product.id) },
  ]);
  const clearForm = () => {
    setEditingProduct(null);
    setForm(emptyForm());
  };

  return (
    <ListScreen
      data={filteredProducts}
      keyExtractor={(product) => product.id}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onEdit={() => startEditing(item)}
          onDelete={() => confirmDelete(item)}
        />
      )}
      ListHeaderComponent={(
        <>
          <ScreenTitle title="Cadastro de produtos" subtitle="Gerencie os produtos, o estoque mínimo e os dados financeiros." />
          <ContentRow>
            <MetricCard label="Total" value={products.length} />
            <MetricCard label="Normal" value={metrics.normalCount} color={colors.success} />
            <MetricCard label="Estoque baixo" value={metrics.lowCount} color={colors.warning} />
            <MetricCard label="Sem estoque" value={metrics.zeroCount} color={colors.danger} />
          </ContentRow>
          <SectionCard title={editingProduct ? 'Editar produto' : 'Cadastrar produto manualmente'}>
            <TextField label="Nome do produto *" value={form.nome} onChangeText={(value) => updateForm('nome', value)} placeholder="Ex.: Café em pó" />
            <SelectField
              label="Categoria"
              value={form.categoria}
              options={CATEGORIES}
              onChange={(value) => updateForm('categoria', value)}
              placeholder="Selecione uma categoria"
            />
            <TextField label="Quantidade *" value={form.quantidade} onChangeText={(value) => updateForm('quantidade', value)} keyboardType="number-pad" />
            <TextField label="Estoque mínimo" value={form.minimo} onChangeText={(value) => updateForm('minimo', value)} keyboardType="number-pad" />
            <TextField label="Preço unitário (R$)" value={form.preco} onChangeText={(value) => updateForm('preco', value)} keyboardType="decimal-pad" />
            <TextField label="Custo unitário (R$)" value={form.custo} onChangeText={(value) => updateForm('custo', value)} keyboardType="decimal-pad" />
            <TextField label="Validade" value={form.validade} onChangeText={(value) => updateForm('validade', value)} placeholder="AAAA-MM-DD" autoCapitalize="none" />
            <TextField label="Fornecedor" value={form.fornecedor} onChangeText={(value) => updateForm('fornecedor', value)} />
            <TextField label="Descrição" value={form.descricao} onChangeText={(value) => updateForm('descricao', value)} multiline />
            <ButtonRow>
              <Button title={editingProduct ? 'Salvar alterações' : 'Salvar produto'} onPress={submit} />
              {editingProduct ? <Button title="Cancelar edição" variant="outline" onPress={clearForm} /> : null}
            </ButtonRow>
          </SectionCard>
          <SectionCard title="Produtos cadastrados">
            <Text style={{ color: colors.muted, fontSize: 13 }}>Total: {products.length} produtos</Text>
            <TextField label="Buscar produto ou código de barras" value={search} onChangeText={setSearch} placeholder="Digite para buscar" />
            <SelectField label="Filtrar categoria" value={categoryFilter} options={['Todas as categorias', ...CATEGORIES]} onChange={setCategoryFilter} />
            <SelectField label="Filtrar estoque" value={stockFilter} options={STOCK_FILTERS} onChange={setStockFilter} />
          </SectionCard>
        </>
      )}
      ListEmptyComponent={(
        <Text style={{ color: colors.muted, textAlign: 'center', padding: 12 }}>
          {products.length ? 'Nenhum produto corresponde aos filtros.' : 'Nenhum produto cadastrado ainda.'}
        </Text>
      )}
      ListFooterComponent={(
        <SectionCard title="Ações">
          <ButtonRow>
            <Button title="Importar CSV" variant="outline" onPress={onImportProducts} />
            <Button title="Exportar produtos" variant="outline" onPress={onExportProducts} />
          </ButtonRow>
          <Button title="Limpar todos os produtos" variant="danger" onPress={onClearProducts} />
        </SectionCard>
      )}
    />
  );
}
