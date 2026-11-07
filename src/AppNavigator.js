import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import useInventory from './hooks/useInventory';
import DashboardScreen from './screens/DashboardScreen';
import InventoryScreen from './screens/InventoryScreen';
import QuickRegistrationScreen from './screens/QuickRegistrationScreen';
import MovementsScreen from './screens/MovementsScreen';
import FinancialScreen from './screens/FinancialScreen';
import MarketScreen from './screens/MarketScreen';
import PerformanceScreen from './screens/PerformanceScreen';
import ReportsScreen from './screens/ReportsScreen';
import { colors } from './theme';
import {
  buildReportHtml,
  createReportPdf,
  printReport,
  shareTextFile,
} from './services/exports';
import {
  fullReportToCsv,
  importProductsFromCsv,
  movementsToCsv,
  productsToCsv,
} from './utils/csv';
import styles from './AppNavigator.styles';

const SCREENS = [
  { id: 'dashboard', title: 'Dashboard', component: DashboardScreen },
  { id: 'inventory', title: 'Cadastro', component: InventoryScreen },
  { id: 'quick', title: 'Cadastro rápido', component: QuickRegistrationScreen },
  { id: 'movements', title: 'Movimentações', component: MovementsScreen },
  { id: 'financial', title: 'Financeiro', component: FinancialScreen },
  { id: 'market', title: 'Mercado', component: MarketScreen },
  { id: 'performance', title: 'Performance', component: PerformanceScreen },
  { id: 'reports', title: 'Relatórios', component: ReportsScreen },
];

export default function AppNavigator() {
  const inventory = useInventory();
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const [notification, setNotification] = useState('');
  const notificationTimeout = useRef(null);
  const ActiveScreen = SCREENS.find((screen) => screen.id === activeScreen)?.component || DashboardScreen;
  const reportHtml = useMemo(
    () => buildReportHtml(inventory.products, inventory.history, inventory.metrics),
    [inventory.products, inventory.history, inventory.metrics],
  );
  const notify = (message) => {
    clearTimeout(notificationTimeout.current);
    setNotification(message);
    notificationTimeout.current = setTimeout(() => setNotification(''), 3500);
  };
  useEffect(() => () => clearTimeout(notificationTimeout.current), []);

  const confirmClear = (title, message, action) => Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Limpar', style: 'destructive', onPress: action },
  ]);
  const runExport = async (action, successMessage) => {
    try {
      await action();
      notify(successMessage);
    } catch (error) {
      Alert.alert('Não foi possível concluir', error.message || 'Tente novamente.');
    }
  };
  const onImportProducts = async () => {
    try {
      const selected = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });
      if (selected.canceled) return;
      const content = await FileSystem.readAsStringAsync(selected.assets[0].uri);
      const result = importProductsFromCsv(content, inventory.products);
      inventory.importProducts(result.products);
      const summary = `${result.imported} novos, ${result.updated} atualizados, ${result.ignored} ignorados`;
      Alert.alert('Importação concluída', `${summary}.${result.errors.length ? `\n${result.errors.length} linha(s) com erro.` : ''}`);
    } catch (error) {
      Alert.alert('Erro ao importar CSV', error.message || 'Verifique o arquivo e tente novamente.');
    }
  };
  const onExportProducts = () => runExport(
    () => shareTextFile('produtos_estoque.csv', productsToCsv(inventory.products)),
    'Produtos exportados.',
  );
  const onExportMovements = () => runExport(
    () => shareTextFile('movimentacoes_estoque.csv', movementsToCsv(inventory.history)),
    'Movimentações exportadas.',
  );
  const onExportReportCsv = () => runExport(
    () => shareTextFile(
      `relatorio_completo_${new Date().toISOString().slice(0, 10)}.csv`,
      fullReportToCsv(inventory.products, inventory.history, inventory.metrics),
    ),
    'Relatório exportado.',
  );
  const onExportPdf = () => runExport(() => createReportPdf(reportHtml), 'Relatório PDF gerado.');
  const onPrintReport = () => runExport(() => printReport(reportHtml), 'Relatório enviado para impressão.');
  const onClearProducts = () => confirmClear(
    'Limpar produtos',
    'Todos os produtos serão removidos. Esta ação não pode ser desfeita.',
    inventory.clearProducts,
  );
  const onClearHistory = () => confirmClear(
    'Limpar histórico',
    'Todas as movimentações serão removidas. Esta ação não pode ser desfeita.',
    inventory.clearHistory,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <View style={styles.header}>
        <View style={styles.brand}>
          <Image source={require('./assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.brandText}>
            <Text style={styles.brandTitle}>Check<Text style={styles.brandAccent}>Manager</Text></Text>
            <Text style={styles.tagline}>Estoque sob controle</Text>
          </View>
        </View>
        <Text style={styles.localStatus}>●  Dados locais</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.navigationScroller}
        contentContainerStyle={styles.navigation}
      >
        {SCREENS.map((screen) => (
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: activeScreen === screen.id }}
            key={screen.id}
            onPress={() => setActiveScreen(screen.id)}
            style={[styles.navItem, activeScreen === screen.id && styles.navItemActive]}
          >
            <Text style={[styles.navText, activeScreen === screen.id && styles.navTextActive]}>
              {screen.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      {notification ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dispensar notificação"
          onPress={() => setNotification('')}
          style={styles.notice}
        >
          <Text accessibilityLiveRegion="polite" style={styles.noticeText}>{notification}</Text>
        </Pressable>
      ) : null}
      {inventory.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando estoque salvo...</Text>
        </View>
      ) : (
        <ActiveScreen
          inventory={inventory}
          navigate={setActiveScreen}
          notify={notify}
          onImportProducts={onImportProducts}
          onExportProducts={onExportProducts}
          onExportMovements={onExportMovements}
          onExportReportCsv={onExportReportCsv}
          onExportPdf={onExportPdf}
          onPrintReport={onPrintReport}
          onClearProducts={onClearProducts}
          onClearHistory={onClearHistory}
        />
      )}
      <SafeAreaView edges={['bottom']} style={styles.bottomSafeArea} />
    </SafeAreaView>
  );
}
