import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Download, CreditCard } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import Colors from '@/constants/colors';

// Mock payment history data
const MOCK_PAYMENTS = [
  {
    id: 'pay-1',
    date: '2023-06-15T10:30:00Z',
    amount: 499,
    currency: 'MZN',
    description: 'Assinatura Mensal - CasaMoç Premium',
    method: 'M-Pesa',
    status: 'completed',
    transactionId: 'TX-1686826200-123'
  },
  {
    id: 'pay-2',
    date: '2023-05-15T09:45:00Z',
    amount: 499,
    currency: 'MZN',
    description: 'Assinatura Mensal - CasaMoç Premium',
    method: 'e-Mola',
    status: 'completed',
    transactionId: 'TX-1684143900-456'
  },
  {
    id: 'pay-3',
    date: '2023-04-15T11:20:00Z',
    amount: 499,
    currency: 'MZN',
    description: 'Assinatura Mensal - CasaMoç Premium',
    method: 'M-Pesa',
    status: 'completed',
    transactionId: 'TX-1681556400-789'
  },
  {
    id: 'pay-4',
    date: '2023-03-15T14:10:00Z',
    amount: 499,
    currency: 'MZN',
    description: 'Assinatura Mensal - CasaMoç Premium',
    method: 'M-Pesa',
    status: 'completed',
    transactionId: 'TX-1678892400-012'
  }
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  
  if (!user) {
    router.replace('/auth/login');
    return null;
  }
  
  const handleDownloadReceipt = (paymentId: string) => {
    Alert.alert(
      'Recibo',
      'O recibo será enviado para o seu email.',
      [{ text: 'OK' }]
    );
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };
  
  const renderPaymentItem = ({ item }: { item: any }) => (
    <View style={styles.paymentCard}>
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentDate}>{formatDate(item.date)}</Text>
        <View style={[
          styles.statusBadge,
          item.status === 'completed' ? styles.completedBadge : styles.pendingBadge
        ]}>
          <Text style={styles.statusText}>
            {item.status === 'completed' ? 'Concluído' : 'Pendente'}
          </Text>
        </View>
      </View>
      
      <Text style={styles.paymentDescription}>{item.description}</Text>
      
      <View style={styles.paymentDetails}>
        <View>
          <Text style={styles.paymentAmount}>
            {item.amount.toLocaleString('pt-MZ')} {item.currency}
          </Text>
          <Text style={styles.paymentMethod}>{item.method}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.downloadButton}
          onPress={() => handleDownloadReceipt(item.id)}
        >
          <Download size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Pagamentos</Text>
      </View>
      
      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.summaryCard}>
            <CreditCard size={24} color={Colors.primary} />
            <Text style={styles.summaryTitle}>Histórico de Pagamentos</Text>
            <Text style={styles.summaryText}>
              Veja todos os seus pagamentos e baixe os recibos.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nenhum pagamento encontrado</Text>
            <Text style={styles.emptyText}>
              Você ainda não realizou nenhum pagamento.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDate: {
    fontSize: 14,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadge: {
    backgroundColor: Colors.success + '20',
  },
  pendingBadge: {
    backgroundColor: Colors.warning + '20',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  paymentMethod: {
    fontSize: 14,
    color: Colors.textLight,
  },
  downloadButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
});