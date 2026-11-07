import { StyleSheet } from 'react-native';
import { colors } from '../theme';

export default StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, paddingBottom: 36, gap: 16 },
  listContent: { padding: 16, paddingBottom: 36 },
  listHeader: { gap: 16 },
  listFooter: { gap: 16 },
  listSeparator: { height: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressTrack: { height: 9, backgroundColor: '#e8eef5', borderRadius: 8, overflow: 'hidden', flex: 1 },
  progressFill: { height: '100%', borderRadius: 8 },
  progressLabel: { color: colors.text, fontSize: 13, flexShrink: 1, flex: 1 },
  progressValue: { color: colors.primary, fontSize: 13, fontWeight: '700', minWidth: 48, textAlign: 'right' },
  alert: { borderRadius: 12, padding: 12, gap: 4 },
  alertMessage: { fontWeight: '800' },
  alertAction: { color: colors.muted, fontSize: 12 },
  itemLine: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  productTitle: { color: colors.primary, fontSize: 16, fontWeight: '800', flex: 1 },
  productMeta: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '800' },
  movementCard: { gap: 7 },
});
