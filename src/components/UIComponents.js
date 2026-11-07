import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Button as PaperButton,
  Card as PaperCard,
  List,
  Text as PaperText,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { colors } from '../theme';
import styles from './UIComponents.styles';

export function Button({ title, onPress, variant = 'primary', disabled = false, style }) {
  const mode = variant === 'outline'
    ? 'outlined'
    : variant === 'secondary'
      ? 'contained-tonal'
      : 'contained';

  return (
    <PaperButton
      mode={mode}
      buttonColor={variant === 'danger' ? colors.danger : undefined}
      textColor={variant === 'danger' ? '#ffffff' : undefined}
      disabled={disabled}
      onPress={onPress}
      style={style}
      contentStyle={styles.buttonContent}
      labelStyle={styles.buttonLabel}
    >
      {title}
    </PaperButton>
  );
}

export function ButtonRow({ children }) {
  return <View style={styles.buttonRow}>{children}</View>;
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  autoCapitalize = 'sentences',
  editable = true,
  ...inputProps
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <PaperTextInput
        mode="outlined"
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable={editable}
        outlineStyle={styles.inputOutline}
        style={[styles.input, multiline && styles.inputMultiline]}
        {...inputProps}
      />
    </View>
  );
}

export function SelectField({ label, value, options, onChange, placeholder = 'Selecione' }) {
  const [visible, setVisible] = useState(false);
  const { height } = useWindowDimensions();

  return (
    <View style={styles.fieldGroup}>
      <PaperText variant="labelLarge">{label}</PaperText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: visible }}
        onPress={() => setVisible(true)}
        style={styles.select}
      >
        <Text style={styles.selectText}>{value || placeholder}</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalContainer} onPress={(event) => event.stopPropagation()}>
            <PaperCard style={[styles.modalCard, { maxHeight: height * 0.8 }]}>
              <PaperCard.Content style={styles.modalContent}>
                <PaperText variant="titleMedium">{label}</PaperText>
                <ScrollView
                  style={[styles.modalOptions, { maxHeight: height * 0.6 }]}
                  keyboardShouldPersistTaps="handled"
                >
                  {options.map((option) => (
                    <List.Item
                      key={option}
                      title={option}
                      onPress={() => {
                        onChange(option);
                        setVisible(false);
                      }}
                    />
                  ))}
                </ScrollView>
                <Button title="Cancelar" variant="outline" onPress={() => setVisible(false)} />
              </PaperCard.Content>
            </PaperCard>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function Card({ children, style }) {
  return (
    <PaperCard mode="elevated" style={style}>
      <PaperCard.Content style={styles.cardContent}>{children}</PaperCard.Content>
    </PaperCard>
  );
}

export function ScreenTitle({ title, subtitle }) {
  return (
    <View style={styles.titleGroup}>
      <PaperText variant="headlineSmall">{title}</PaperText>
      {subtitle ? <PaperText variant="bodyMedium">{subtitle}</PaperText> : null}
    </View>
  );
}

export function SectionTitle({ children }) {
  return <PaperText variant="titleMedium">{children}</PaperText>;
}

export function MetricCard({ label, value, detail, color }) {
  return (
    <View style={styles.metricWrapper}>
      <Card>
        <PaperText variant="labelMedium">{label}</PaperText>
        <PaperText variant="headlineSmall" style={color ? { color } : undefined}>{value}</PaperText>
        {detail ? <PaperText variant="labelMedium">{detail}</PaperText> : null}
      </Card>
    </View>
  );
}
