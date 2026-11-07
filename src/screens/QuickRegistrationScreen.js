import { useRef, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, ButtonRow, ScreenTitle, SelectField, TextField } from '../components/UIComponents';
import { ContentRow, ProductCard, ScrollScreen, SectionCard } from '../components/LayoutComponents';
import { fetchProductByBarcode } from '../services/api';
import { colors } from '../theme';

const CATEGORIES = ['Alimentos', 'Bebidas', 'Limpeza', 'Higiene', 'Eletrônicos', 'Vestuário', 'Outros'];

const emptyQuickForm = () => ({
  codigoBarras: '',
  nome: '',
  categoria: '',
  quantidade: '1',
  minimo: '5',
  preco: '',
  custo: '',
});

export default function QuickRegistrationScreen({ inventory, notify }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyQuickForm);
  const [lookupMessage, setLookupMessage] = useState('Digite um EAN/UPC ou use a câmera para consultar o Open Food Facts.');
  const lookupInProgress = useRef(false);

  const updateForm = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const lookupBarcode = async (rawValue) => {
    const barcode = String(rawValue || '').replace(/\D/g, '');
    updateForm('codigoBarras', barcode);
    setScanning(false);
    setScanned(true);
    if (lookupInProgress.current) return;
    if (barcode.length < 7) {
      setLookupMessage('Informe um código de barras EAN/UPC válido (mínimo de 7 dígitos).');
      return;
    }
    const existing = inventory.products.find((product) => product.codigoBarras === barcode);
    if (existing) {
      Alert.alert('Produto já cadastrado', existing.nome);
      setLookupMessage(`Este código já pertence a ${existing.nome}.`);
      return;
    }
    lookupInProgress.current = true;
    setLoading(true);
    setLookupMessage('Consultando o Open Food Facts...');
    try {
      const result = await fetchProductByBarcode(barcode);
      if (result) {
        setForm((current) => ({
          ...current,
          nome: result.nome,
          categoria: result.categoria,
          preco: result.preco || '',
          custo: result.custo || '',
        }));
        setLookupMessage('Produto encontrado no Open Food Facts. Confira os dados e informe preço e custo.');
      } else {
        setLookupMessage('Produto não encontrado na API. Preencha os dados manualmente para continuar.');
      }
    } catch (error) {
      setLookupMessage(`${error.message} Você ainda pode preencher os dados manualmente.`);
      notify('Não foi possível consultar o Open Food Facts.');
    } finally {
      setLoading(false);
      lookupInProgress.current = false;
    }
  };
  const handleBarcodeScanned = ({ data }) => {
    if (scanned || loading) return;
    lookupBarcode(data);
  };
  const startCamera = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          Alert.alert('Acesso à câmera', 'Permita o acesso à câmera nas configurações do aparelho para ler códigos de barras.');
          return;
        }
      }
      setScanned(false);
      setScanning(true);
    } catch (error) {
      Alert.alert('Não foi possível acessar a câmera', error.message || 'Verifique as permissões e tente novamente.');
    }
  };
  const submit = () => {
    const barcode = form.codigoBarras.trim();
    const name = form.nome.trim();
    const quantity = Number.parseInt(form.quantidade, 10);
    const price = Number(String(form.preco).replace(',', '.'));
    const cost = Number(String(form.custo).replace(',', '.')) || 0;
    if (!barcode) return Alert.alert('Código obrigatório', 'Informe o código de barras do produto.');
    if (!name) return Alert.alert('Nome obrigatório', 'Informe o nome do produto.');
    if (!form.categoria) return Alert.alert('Categoria obrigatória', 'Selecione uma categoria.');
    if (!Number.isInteger(quantity) || quantity < 1) return Alert.alert('Quantidade inválida', 'A quantidade deve ser maior que zero.');
    if (!Number.isFinite(price) || price <= 0) return Alert.alert('Preço inválido', 'Informe um preço maior que zero.');
    if (cost < 0) return Alert.alert('Custo inválido', 'O custo não pode ser negativo.');
    if (inventory.products.some((product) => product.codigoBarras === barcode)) {
      return Alert.alert('Código já cadastrado', 'Este código de barras já pertence a um produto.');
    }
    try {
      inventory.saveProduct({
        id: `CB-${Date.now()}`,
        codigoBarras: barcode,
        nome: name,
        categoria: form.categoria,
        quantidade: quantity,
        minimo: Number.parseInt(form.minimo, 10) || 5,
        preco: price,
        custo,
        validade: '',
        fornecedor: '',
        descricao: `Cadastrado via código de barras: ${barcode}`,
        dataCadastro: new Date().toISOString(),
      });
      setForm(emptyQuickForm());
      setScanned(false);
      setLookupMessage('Produto cadastrado. Pronto para uma nova leitura.');
      notify(`${name} cadastrado com sucesso.`);
    } catch (error) {
      Alert.alert('Não foi possível cadastrar', error.message);
    }
  };
  const cancel = () => {
    setForm(emptyQuickForm());
    setScanned(false);
    setScanning(false);
    setLookupMessage('Digite um EAN/UPC ou use a câmera para consultar o Open Food Facts.');
  };

  return (
    <ScrollScreen>
      <ScreenTitle title="Cadastro rápido" subtitle="Leia um código de barras e consulte os dados do produto na API." />
      <SectionCard title="Leitor de código de barras">
        {scanning ? (
          <View style={{ height: 230, overflow: 'hidden', borderRadius: 14 }}>
            <CameraView
              style={{ flex: 1 }}
              facing="back"
              onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
              barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'itf14'] }}
            />
          </View>
        ) : null}
        <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, lineHeight: 20 }}>{lookupMessage}</Text>
        {loading ? <ActivityIndicator color={colors.accent} /> : null}
        <TextField
          label="Código de barras *"
          value={form.codigoBarras}
          onChangeText={(value) => updateForm('codigoBarras', value.replace(/\D/g, ''))}
          placeholder="EAN/UPC"
          keyboardType="number-pad"
          autoCapitalize="none"
          onSubmitEditing={() => lookupBarcode(form.codigoBarras)}
          returnKeyType="search"
        />
        <ButtonRow>
          <Button title={scanning ? 'Parar câmera' : 'Usar câmera'} onPress={() => scanning ? setScanning(false) : startCamera()} />
          <Button title="Consultar código" variant="outline" disabled={loading} onPress={() => lookupBarcode(form.codigoBarras)} />
        </ButtonRow>
      </SectionCard>
      <SectionCard title="Dados do produto">
        <TextField label="Nome do produto *" value={form.nome} onChangeText={(value) => updateForm('nome', value)} />
        <SelectField label="Categoria *" value={form.categoria} options={CATEGORIES} onChange={(value) => updateForm('categoria', value)} />
        <ContentRow>
          <View style={{ flexGrow: 1, flexBasis: '46%' }}>
            <TextField label="Quantidade *" value={form.quantidade} onChangeText={(value) => updateForm('quantidade', value)} keyboardType="number-pad" />
          </View>
          <View style={{ flexGrow: 1, flexBasis: '46%' }}>
            <TextField label="Estoque mínimo" value={form.minimo} onChangeText={(value) => updateForm('minimo', value)} keyboardType="number-pad" />
          </View>
        </ContentRow>
        <TextField
          label="Preço unitário (R$) *"
          value={form.preco}
          onChangeText={(value) => updateForm('preco', value)}
          keyboardType="decimal-pad"
        />
        <TextField label="Custo unitário (R$)" value={form.custo} onChangeText={(value) => {
          setForm((current) => ({
            ...current,
            custo: value,
            ...(!current.preco && Number(value) > 0 ? { preco: (Number(value) * 1.3).toFixed(2) } : {}),
          }));
        }} keyboardType="decimal-pad" />
        <ButtonRow>
          <Button title="Cadastrar produto" onPress={submit} />
          <Button title="Cancelar" variant="outline" onPress={cancel} />
        </ButtonRow>
      </SectionCard>
      <SectionCard title="Últimos produtos cadastrados">
        {inventory.recentProducts.length
          ? inventory.recentProducts.slice(0, 10).map((product) => <ProductCard key={product.id} product={product} />)
          : <Text style={{ color: colors.muted, textAlign: 'center', padding: 10 }}>Nenhum produto cadastrado por código de barras ainda.</Text>}
      </SectionCard>
    </ScrollScreen>
  );
}
