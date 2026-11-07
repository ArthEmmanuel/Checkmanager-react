import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import AppNavigator from './AppNavigator';
import { paperTheme } from './theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
