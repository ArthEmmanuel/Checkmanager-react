import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInventoryMetrics } from '../utils/analytics';

const STORAGE_KEYS = {
  products: 'produtos',
  movements: 'historico',
  recent: 'produtosRecentes',
};

function parseSavedValue(value, fallback) {
  if (!value) return fallback;
  const parsed = JSON.parse(value);
  return Array.isArray(parsed) ? parsed : fallback;
}

export default function useInventory() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const metrics = useMemo(() => getInventoryMetrics(products, history), [products, history]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const values = await AsyncStorage.multiGet(Object.values(STORAGE_KEYS));
        const saved = Object.fromEntries(values);
        if (!active) return;
        setProducts(parseSavedValue(saved[STORAGE_KEYS.products], []));
        setHistory(parseSavedValue(saved[STORAGE_KEYS.movements], []));
        setRecentProducts(parseSavedValue(saved[STORAGE_KEYS.recent], []));
      } catch (error) {
        Alert.alert('Erro ao carregar estoque', error.message || 'Não foi possível ler os dados salvos neste aparelho.');
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    AsyncStorage.multiSet([
      [STORAGE_KEYS.products, JSON.stringify(products)],
      [STORAGE_KEYS.movements, JSON.stringify(history)],
      [STORAGE_KEYS.recent, JSON.stringify(recentProducts)],
    ]).catch((error) => {
      Alert.alert('Erro ao salvar dados', error.message || 'As alterações não puderam ser persistidas neste aparelho.');
    });
  }, [products, history, recentProducts, isLoading]);

  const saveProduct = useCallback((product) => {
    const name = product.nome.trim();
    if (!name) throw new Error('Informe o nome do produto.');
    if (products.some((item) => item.nome.toLowerCase() === name.toLowerCase() && item.id !== product.id)) {
      throw new Error('Já existe um produto com esse nome.');
    }
    setProducts((current) => {
      const existingIndex = current.findIndex((item) => item.id === product.id);
      if (existingIndex < 0) return [...current, product];
      return current.map((item, index) => index === existingIndex ? { ...item, ...product } : item);
    });
    if (product.codigoBarras) {
      setRecentProducts((current) => [product, ...current.filter((item) => item.id !== product.id)].slice(0, 10));
    }
    setEditingProduct(null);
  }, [products]);

  const deleteProduct = useCallback((id) => {
    setProducts((current) => current.filter((product) => product.id !== id));
    setRecentProducts((current) => current.filter((product) => product.id !== id));
    setEditingProduct((current) => current?.id === id ? null : current);
  }, []);

  const registerMovement = useCallback((productId, type, quantity, reason) => {
    const amount = Number.parseInt(quantity, 10);
    if (!productId) throw new Error('Selecione um produto.');
    if (!Number.isInteger(amount) || amount < 1) throw new Error('Informe uma quantidade maior que zero.');
    const product = products.find((item) => item.id === productId);
    if (!product) throw new Error('O produto selecionado não foi encontrado.');
    if (type === 'saida' && product.quantidade < amount) {
      throw new Error('Quantidade em estoque insuficiente para essa saída.');
    }
    setProducts((current) => current.map((item) => item.id === productId
      ? { ...item, quantidade: item.quantidade + (type === 'entrada' ? amount : -amount) }
      : item));
    setHistory((current) => [{
      data: new Date().toISOString(),
      nome: product.nome,
      tipo: type,
      qtd: amount,
      motivo: reason.trim(),
    }, ...current]);
  }, [products]);

  const clearProducts = useCallback(() => {
    setProducts([]);
    setRecentProducts([]);
    setEditingProduct(null);
  }, []);
  const clearHistory = useCallback(() => setHistory([]), []);
  const importProducts = useCallback((nextProducts) => setProducts(nextProducts), []);

  return {
    products,
    history,
    recentProducts,
    isLoading,
    editingProduct,
    setEditingProduct,
    metrics,
    saveProduct,
    deleteProduct,
    registerMovement,
    clearProducts,
    clearHistory,
    importProducts,
  };
}
