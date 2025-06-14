import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View
} from 'react-native';
import Colors from '@/constants/colors';

interface SocialLoginButtonProps {
  type: 'google' | 'facebook';
  onPress: () => void;
  isLoading?: boolean;
}

export default function SocialLoginButton({
  type,
  onPress,
  isLoading = false
}: SocialLoginButtonProps) {
  const buttonText = type === 'google' 
    ? 'Continuar com Google' 
    : 'Continuar com Facebook';
  
  const buttonColor = type === 'google' 
    ? '#FFFFFF' 
    : '#1877F2';
  
  const textColor = type === 'google' 
    ? '#202124' 
    : '#FFFFFF';
  
  const iconColor = type === 'google' 
    ? '#4285F4' 
    : '#FFFFFF';
  
  const GoogleIcon = () => (
    <View style={styles.googleIcon}>
      <Text style={{ color: iconColor, fontSize: 16, fontWeight: 'bold' }}>G</Text>
    </View>
  );
  
  const FacebookIcon = () => (
    <View style={styles.facebookIcon}>
      <Text style={{ color: iconColor, fontSize: 16, fontWeight: 'bold' }}>f</Text>
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: buttonColor },
        type === 'google' && styles.googleButton
      ]}
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator 
          color={type === 'google' ? Colors.primary : '#FFFFFF'} 
          size="small" 
        />
      ) : (
        <>
          {type === 'google' ? <GoogleIcon /> : <FacebookIcon />}
          <Text style={[styles.text, { color: textColor }]}>
            {buttonText}
          </Text>
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
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  googleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  facebookIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1877F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
});