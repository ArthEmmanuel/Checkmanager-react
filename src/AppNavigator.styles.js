import { StyleSheet } from 'react-native';
import { colors } from './theme';

export default StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#ffffff' },
  brandText: { gap: 1 },
  brandTitle: { color: '#ffffff', fontWeight: '800' },
  brandAccent: { color: '#48d1b3' },
  tagline: { color: '#d6e0ec', fontSize: 11 },
  localStatus: { color: '#c6f6e8', fontSize: 11, fontWeight: '700' },
  navigationScroller: { flexGrow: 0, flexShrink: 0 },
  navigation: {
    minHeight: 64,
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  navItem: { marginVertical: 4 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  bottomSafeArea: { backgroundColor: colors.background },
});
