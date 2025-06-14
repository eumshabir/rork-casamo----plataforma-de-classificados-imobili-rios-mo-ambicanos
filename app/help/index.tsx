import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  HelpCircle, 
  ChevronRight, 
  Mail, 
  Phone, 
  MessageCircle,
  FileText,
  Shield,
  AlertCircle
} from 'lucide-react-native';
import Colors from '@/constants/colors';

// FAQ data
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'Como publicar um imóvel?',
    answer: 'Para publicar um imóvel, acesse a aba "Publicar" no menu inferior. Preencha todos os detalhes do imóvel, adicione fotos e clique em "Publicar Imóvel".'
  },
  {
    id: 'faq-2',
    question: 'Qual a diferença entre conta gratuita e premium?',
    answer: 'Contas gratuitas podem publicar até 2 imóveis por mês. Contas premium têm publicações ilimitadas, destaque nos resultados de busca, selo premium e estatísticas detalhadas.'
  },
  {
    id: 'faq-3',
    question: 'Como entrar em contato com um anunciante?',
    answer: 'Na página do imóvel, você encontrará botões para ligar ou enviar mensagem via WhatsApp para o anunciante.'
  },
  {
    id: 'faq-4',
    question: 'Como cancelar minha assinatura premium?',
    answer: 'Acesse seu perfil, vá em "Minha Assinatura" e clique em "Cancelar Assinatura". Você continuará com acesso premium até o final do período atual.'
  },
  {
    id: 'faq-5',
    question: 'Posso editar um imóvel após publicá-lo?',
    answer: 'Sim. Acesse seu perfil, vá em "Meus Imóveis", encontre o imóvel que deseja editar e clique no botão de edição.'
  }
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFaq, setExpandedFaq] = React.useState<string | null>(null);
  
  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null);
    } else {
      setExpandedFaq(id);
    }
  };
  
  const handleContactEmail = () => {
    Linking.openURL('mailto:suporte@casamoc.com');
  };
  
  const handleContactPhone = () => {
    Linking.openURL('tel:+258841234567');
  };
  
  const handleContactWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=+258841234567&text=Olá, preciso de ajuda com o CasaMoç.');
  };
  
  const handleOpenTerms = () => {
    Alert.alert(
      'Termos de Uso',
      'Os Termos de Uso seriam abertos em um navegador externo em um aplicativo real.'
    );
  };
  
  const handleOpenPrivacy = () => {
    Alert.alert(
      'Política de Privacidade',
      'A Política de Privacidade seria aberta em um navegador externo em um aplicativo real.'
    );
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Ajuda e Suporte</Text>
      </View>
      
      <View style={styles.heroSection}>
        <HelpCircle size={40} color={Colors.primary} />
        <Text style={styles.heroTitle}>Como podemos ajudar?</Text>
        <Text style={styles.heroText}>
          Encontre respostas para perguntas frequentes ou entre em contato com nossa equipe de suporte.
        </Text>
      </View>
      
      <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
      <View style={styles.faqContainer}>
        {FAQ_ITEMS.map((item) => (
          <View key={item.id} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.faqQuestion}
              onPress={() => toggleFaq(item.id)}
            >
              <Text style={styles.faqQuestionText}>{item.question}</Text>
              <ChevronRight 
                size={20} 
                color={Colors.textLight} 
                style={[
                  styles.faqIcon,
                  expandedFaq === item.id && styles.faqIconExpanded
                ]}
              />
            </TouchableOpacity>
            
            {expandedFaq === item.id && (
              <View style={styles.faqAnswer}>
                <Text style={styles.faqAnswerText}>{item.answer}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
      
      <Text style={styles.sectionTitle}>Contato</Text>
      <View style={styles.contactContainer}>
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleContactEmail}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#EBF5FF' }]}>
            <Mail size={24} color={Colors.primary} />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Email</Text>
            <Text style={styles.contactValue}>suporte@casamoc.com</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleContactPhone}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#F0FDF4' }]}>
            <Phone size={24} color="#10B981" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Telefone</Text>
            <Text style={styles.contactValue}>+258 84 123 4567</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={handleContactWhatsApp}
        >
          <View style={[styles.contactIcon, { backgroundColor: '#DCFCE7' }]}>
            <MessageCircle size={24} color="#25D366" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>WhatsApp</Text>
            <Text style={styles.contactValue}>+258 84 123 4567</Text>
          </View>
          <ChevronRight size={20} color={Colors.textLight} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.sectionTitle}>Legal</Text>
      <View style={styles.legalContainer}>
        <TouchableOpacity 
          style={styles.legalItem}
          onPress={handleOpenTerms}
        >
          <FileText size={20} color={Colors.textLight} />
          <Text style={styles.legalText}>Termos de Uso</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.legalItem}
          onPress={handleOpenPrivacy}
        >
          <Shield size={20} color={Colors.textLight} />
          <Text style={styles.legalText}>Política de Privacidade</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.legalItem}
          onPress={() => Alert.alert('Sobre', 'CasaMoç v1.0.0\n© 2023 CasaMoç. Todos os direitos reservados.')}
        >
          <AlertCircle size={20} color={Colors.textLight} />
          <Text style={styles.legalText}>Sobre o CasaMoç</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  heroText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  faqContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    flex: 1,
  },
  faqIcon: {
    transform: [{ rotate: '0deg' }],
  },
  faqIconExpanded: {
    transform: [{ rotate: '90deg' }],
  },
  faqAnswer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: Colors.background,
  },
  faqAnswerText: {
    fontSize: 14,
    color: Colors.textLight,
    lineHeight: 20,
  },
  contactContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    color: Colors.textLight,
  },
  legalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  legalText: {
    fontSize: 16,
    color: Colors.text,
  },
});