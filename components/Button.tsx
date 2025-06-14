import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    style
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'outline' || variant === 'text' ? Colors.primary : 'white'} 
          size="small" 
        />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Variants
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryText: {
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: Colors.secondary,
  },
  secondaryText: {
    color: 'white',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  outlineText: {
    color: Colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
  },
  textText: {
    color: Colors.primary,
  },
  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  smallText: {
    fontSize: 14,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  mediumText: {
    fontSize: 16,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  largeText: {
    fontSize: 18,
  },
  // States
  disabledButton: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
    opacity: 0.7,
  },
  disabledText: {
    color: Colors.textLight,
  },
});