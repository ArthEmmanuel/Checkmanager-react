import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.medium,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardContent: { gap: 12 },
  buttonContent: { minHeight: 44 },
  buttonLabel: { fontWeight: '700', fontSize: typography.body },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  fieldGroup: { gap: 6 },
  label: { color: colors.secondary, fontSize: typography.small + 1, fontWeight: '700' },
  input: { backgroundColor: colors.surface, fontSize: typography.body, minHeight: 48 },
  inputOutline: { borderRadius: 10 },
  inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
  select: {
    minHeight: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  selectText: { color: colors.text, fontSize: typography.body },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: 20,
  },
  modalContainer: { width: '100%', maxWidth: 480, alignSelf: 'center' },
  modalCard: { marginHorizontal: 4 },
  modalContent: { flexShrink: 1, gap: 8 },
  modalOptions: { flexGrow: 0, flexShrink: 1 },
  titleGroup: { gap: 5 },
  metricWrapper: { flexGrow: 1, flexBasis: '46%', minWidth: 145 },
});
