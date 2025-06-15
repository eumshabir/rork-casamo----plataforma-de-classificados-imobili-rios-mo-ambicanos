import { supabase } from '@/lib/supabase';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}

export const chatService = {
  // Get all conversations for the current user
  getConversations: async (): Promise<ChatConversation[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversations (
          id,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    const conversations: ChatConversation[] = [];

    for (const item of data) {
      const conversation = item.conversations as any;
      
      // Get other participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          users (
            id,
            name,
            email
          )
        `)
        .eq('conversation_id', conversation.id)
        .neq('user_id', user.id);

      // Get last message
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversation.id)
        .eq('read', false)
        .neq('sender_id', user.id);

      conversations.push({
        id: conversation.id,
        participants: participants?.map(p => ({
          id: (p.users as any).id,
          name: (p.users as any).name,
          avatar: `https://randomuser.me/api/portraits/lego/1.jpg`,
        })) || [],
        lastMessage: lastMessage ? {
          id: lastMessage.id,
          conversationId: lastMessage.conversation_id,
          senderId: lastMessage.sender_id,
          receiverId: '', // We'll need to determine this
          content: lastMessage.content,
          read: lastMessage.read,
          createdAt: lastMessage.created_at,
        } : undefined,
        unreadCount: unreadCount || 0,
        updatedAt: conversation.updated_at,
      });
    }

    return conversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // Get messages for a specific conversation
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify user is part of this conversation
    const { data: participant } = await supabase
      .from('conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id)
      .single();

    if (!participant) {
      throw new Error('Unauthorized access to conversation');
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data.map(message => ({
      id: message.id,
      conversationId: message.conversation_id,
      senderId: message.sender_id,
      receiverId: '', // We'll determine this based on participants
      content: message.content,
      read: message.read,
      createdAt: message.created_at,
    }));
  },

  // Send a message
  sendMessage: async (conversationId: string, content: string, receiverId: string): Promise<ChatMessage> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return {
      id: data.id,
      conversationId: data.conversation_id,
      senderId: data.sender_id,
      receiverId,
      content: data.content,
      read: data.read,
      createdAt: data.created_at,
    };
  },

  // Create a new conversation
  createConversation: async (receiverId: string, initialMessage: string): Promise<ChatConversation> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if conversation already exists between these users
    const { data: existingConversations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);

    if (existingConversations) {
      for (const conv of existingConversations) {
        const { data: otherParticipant } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', receiverId)
          .single();

        if (otherParticipant) {
          // Conversation already exists, just send message
          await chatService.sendMessage(conv.conversation_id, initialMessage, receiverId);
          
          // Return existing conversation
          const conversations = await chatService.getConversations();
          return conversations.find(c => c.id === conv.conversation_id)!;
        }
      }
    }

    // Create new conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({})
      .select()
      .single();

    if (convError) {
      throw new Error(convError.message);
    }

    // Add participants
    const { error: participantError } = await supabase
      .from('conversation_participants')
      .insert([
        { conversation_id: conversation.id, user_id: user.id },
        { conversation_id: conversation.id, user_id: receiverId },
      ]);

    if (participantError) {
      throw new Error(participantError.message);
    }

    // Send initial message
    const message = await chatService.sendMessage(conversation.id, initialMessage, receiverId);

    // Get receiver info
    const { data: receiver } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', receiverId)
      .single();

    return {
      id: conversation.id,
      participants: [
        {
          id: receiverId,
          name: receiver?.name || 'Unknown User',
          avatar: `https://randomuser.me/api/portraits/lego/1.jpg`,
        },
      ],
      lastMessage: message,
      unreadCount: 0,
      updatedAt: conversation.updated_at,
    };
  },

  // Mark messages as read
  markAsRead: async (conversationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  // Delete a conversation
  deleteConversation: async (conversationId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Remove user from conversation participants
    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      throw new Error(error.message);
    }

    // Check if conversation has any participants left
    const { count } = await supabase
      .from('conversation_participants')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    // If no participants left, delete the conversation
    if (count === 0) {
      await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
    }

    return true;
  },

  // Subscribe to real-time messages
  subscribeToMessages: (conversationId: string, callback: (message: ChatMessage) => void) => {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new as any;
          callback({
            id: message.id,
            conversationId: message.conversation_id,
            senderId: message.sender_id,
            receiverId: '', // We'll determine this
            content: message.content,
            read: message.read,
            createdAt: message.created_at,
          });
        }
      )
      .subscribe();
  },
};