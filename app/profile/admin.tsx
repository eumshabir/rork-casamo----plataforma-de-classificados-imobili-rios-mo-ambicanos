import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AdminLinkScreen() {
  const router = useRouter();
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Painel de Administração</Text>
      <Text style={styles.description}>
        Acesse o painel de administração para gerenciar usuários, imóveis e outras configurações do sistema.
      </Text>
      
      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => router.push('/admin')}
      >
        <Text style={styles.adminButtonText}>Acessar Painel de Administração</Text>
        <ArrowRight size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textLight,
    marginBottom: 32,
    lineHeight: 24,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  adminButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});