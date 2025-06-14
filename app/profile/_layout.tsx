import React from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function ProfileLayout() {
  const { user } = useAuthStore();
  
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Perfil',
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          title: 'Editar Perfil',
        }}
      />
      <Stack.Screen
        name="properties"
        options={{
          title: 'Meus Imóveis',
        }}
      />
      <Stack.Screen
        name="subscription"
        options={{
          title: 'Assinatura Premium',
        }}
      />
      <Stack.Screen
        name="payments"
        options={{
          title: 'Histórico de Pagamentos',
        }}
      />
      {user?.role === 'admin' && (
        <Stack.Screen
          name="admin"
          options={{
            title: 'Administração',
          }}
        />
      )}
    </Stack>
  );
}