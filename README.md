# CasaMoç - Aplicativo de Classificados Imobiliários para Moçambique

CasaMoç é um aplicativo mobile de classificados imobiliários para Moçambique, inspirado no SuperCasa. O aplicativo permite que usuários publiquem, pesquisem e entrem em contato com anunciantes de imóveis.

## Funcionalidades Principais

### 1. Cadastro e Login
- Cadastro por telefone, email ou Google/Facebook
- Verificação por SMS
- Dois tipos de conta:
  - Usuário Comum (Grátis): Pode publicar até 2 imóveis/mês com menos destaque
  - Usuário Premium (Pago): Pode publicar ilimitado, com selo de destaque, prioridade nas buscas e mais imagens

### 2. Publicação de Imóveis
- Tipo de imóvel: Casa, Apartamento, Terreno, Escritório, etc.
- Venda ou arrendamento
- Localização no mapa
- Preço, número de quartos, casa de banho, área em m²
- Upload de fotos
- Visibilidade: normal ou destaque (para Premium)

### 3. Sistema de Pagamento
- Integração com M-Pesa e e-Mola para:
  - Subir para Premium (mensal, trimestral, anual)
  - Dar boost (impulsionamento) em um imóvel específico
  - Comprar pacotes de anúncios

### 4. Busca e Filtros Avançados
- Filtro por tipo de imóvel, localização, preço, quartos, casas de banho, área, etc.
- Resultados organizados por "Mais Recentes", "Mais Vistos", "Destaques"

### 5. Página do Imóvel
- Galeria de imagens
- Mapa da localização
- Contato direto com anunciante (WhatsApp, ligação, email)
- Imóveis semelhantes recomendados

### 6. Painel do Usuário
- Gerenciar anúncios (editar, ativar/desativar, excluir)
- Ver estatísticas (visualizações, contatos recebidos)
- Histórico de pagamentos e status de Premium

## Implementação Técnica

### Frontend
- React Native com Expo
- Zustand para gerenciamento de estado
- AsyncStorage para persistência local
- Expo Router para navegação

### Backend (Simulado)
- Serviços mockados para autenticação, propriedades e pagamentos
- Em uma implementação real, seria usado:
  - Firebase/Firestore ou
  - Supabase ou
  - API REST personalizada com Node.js/Express

### Pagamentos
- Integração simulada com M-Pesa e e-Mola
- Em uma implementação real, seria usado:
  - APIs oficiais dos provedores de pagamento
  - Gateway de pagamento para Moçambique

## Estrutura do Projeto

```
/app - Rotas e telas principais
/components - Componentes reutilizáveis
/constants - Constantes e configurações
/hooks - Custom hooks
/mocks - Dados mockados
/services - Serviços de API
/store - Estado global (Zustand)
/styles - Estilos compartilhados
/types - Tipos TypeScript
```

## Próximos Passos

1. Implementar backend real com Firebase ou Supabase
2. Integrar APIs reais de pagamento (M-Pesa e e-Mola)
3. Adicionar funcionalidades de moderação e administração
4. Implementar notificações push
5. Adicionar análises e métricas