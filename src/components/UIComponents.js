import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors } from '../theme';
import styles from './UIComponents.styles';

export function Button({ title, onPress, variant = 'primary', disabled = false, style }) {
  const variantStyle = variant === 'secondary'
    ? styles.buttonSecondary
    : variant === 'outline'
      ? styles.buttonOutline
      : variant === 'danger'
        ? styles.buttonDanger
        : null;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variantStyle,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.buttonText, variant === 'outline' && styles.buttonOutlineText]}>{title}</Text>
    </Pressable>
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
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        multiline={multiline}
        autoCapitalize={autoCapitalize}
        editable={editable}
        style={[styles.input, multiline && styles.inputMultiline, !editable && styles.inputDisabled]}
        {...inputProps}
      />
    </View>
  );
}

export function SelectField({ label, value, options, onChange, placeholder = 'Selecione' }) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
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
          <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.modalTitle}>{label}</Text>
            <ScrollView keyboardShouldPersistTaps="handled">
              {options.map((option) => (
                <Pressable
                  accessibilityRole="button"
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setVisible(false);
                  }}
                  style={styles.modalOption}
                >
                  <Text style={styles.modalOptionText}>{option}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Button title="Cancelar" variant="outline" onPress={() => setVisible(false)} />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenTitle({ title, subtitle }) {
  return (
    <View style={styles.titleGroup}>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.subheading}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionTitle({ children }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function MetricCard({ label, value, detail, color }) {
  return (
    <View style={styles.metricWrapper}>
      <Card>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={[styles.metricValue, color ? { color } : null]}>{value}</Text>
        {detail ? <Text style={styles.metricLabel}>{detail}</Text> : null}
      </Card>
    </View>
  );
}
