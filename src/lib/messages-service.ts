
import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  reply_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageWithSender extends Message {
  sender: {
    username: string;
    avatar_url: string | null;
  };
}

export interface Conversation {
  user_id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  online_status: boolean;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
}

export const messagesService = {
  // Get all conversations for the current user
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      // First get all messages where user is sender or recipient
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (!messages?.length) return [];
      
      // Extract unique conversation partners
      const conversationPartners = new Map<string, { 
        last_message: string, 
        last_message_time: string,
        unread_count: number 
      }>();
      
      messages.forEach(message => {
        // Determine the conversation partner
        const partnerId = message.sender_id === userId ? message.recipient_id : message.sender_id;
        
        // Only process if this is a newer message than what we've seen
        if (!conversationPartners.has(partnerId) || 
            new Date(message.created_at) > new Date(conversationPartners.get(partnerId)!.last_message_time)) {
          
          conversationPartners.set(partnerId, {
            last_message: message.content,
            last_message_time: message.created_at,
            unread_count: 0
          });
        }
        
        // Count unread messages
        if (message.recipient_id === userId && !message.is_read) {
          const current = conversationPartners.get(partnerId)!;
          conversationPartners.set(partnerId, {
            ...current,
            unread_count: current.unread_count + 1
          });
        }
      });
      
      // Get user profiles for conversation partners
      const partnerIds = Array.from(conversationPartners.keys());
      
      if (partnerIds.length === 0) return [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, full_name, avatar_url')
        .in('user_id', partnerIds);
      
      if (profilesError) throw profilesError;
      
      // Get online status
      const { data: presence, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, online_status')
        .in('user_id', partnerIds);
      
      if (presenceError) throw presenceError;
      
      // Combine data into conversations
      return profiles.map(profile => {
        const conversationData = conversationPartners.get(profile.user_id)!;
        const userPresence = presence?.find(p => p.user_id === profile.user_id);
        
        return {
          user_id: profile.user_id,
          username: profile.username || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          online_status: userPresence?.online_status || false,
          last_message: conversationData.last_message,
          last_message_time: conversationData.last_message_time,
          unread_count: conversationData.unread_count
        };
      }).sort((a, b) => 
        new Date(b.last_message_time || 0).getTime() - new Date(a.last_message_time || 0).getTime()
      );
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },
  
  // Get messages between current user and another user
  async getMessages(userId: string, partnerId: string): Promise<MessageWithSender[]> {
    try {
      // Get messages between the two users
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${partnerId}),and(sender_id.eq.${partnerId},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error selecting messages:', error);
        throw error;
      }
      
      if (!messages?.length) return [];
      
      // Get profiles for sender and recipient
      const userIds = [userId, partnerId];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, username, avatar_url')
        .in('user_id', userIds);
      
      if (profilesError) {
        console.error('Error selecting profiles:', profilesError);
        throw profilesError;
      }
      
      // Mark messages as read
      const { error: updateError } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', userId)
        .eq('sender_id', partnerId);
        
      if (updateError) {
        console.error('Error marking messages as read:', updateError);
      }
      
      // Combine data into messages with sender info
      return messages.map(message => {
        const sender = profiles.find(p => p.user_id === message.sender_id);
        
        return {
          ...message,
          sender: {
            username: sender?.username || 'Unknown',
            avatar_url: sender?.avatar_url
          }
        };
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  },
  
  // Send a message
  async sendMessage(senderId: string, recipientId: string, content: string, replyToId?: string): Promise<boolean> {
    try {
      // Check if we're blocked by this user
      const { data: friendship, error: checkError } = await supabase
        .from('friendships')
        .select('status')
        .eq('user_id', recipientId)
        .eq('friend_id', senderId)
        .eq('status', 'blocked')
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking blocked status:', checkError);
      }
      
      if (friendship) {
        toast({
          title: "Cannot send message",
          description: "You may have been blocked by this user",
          variant: "destructive"
        });
        return false;
      }
      
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          content,
          reply_to: replyToId || null
        });
      
      if (error) {
        console.error('Insert message error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Delete a message
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      // Ensure user is the sender
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);
      
      if (error) {
        console.error('Delete message error:', error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Subscribe to new messages
  subscribeToMessages(userId: string, callback: (message: Message) => void) {
    return supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  },
  
  // Subscribe to message status changes (read receipts)
  subscribeToMessageUpdates(userId: string, callback: (message: Message) => void) {
    return supabase
      .channel('public:message-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `sender_id=eq.${userId}`
      }, (payload) => {
        callback(payload.new as Message);
      })
      .subscribe();
  }
};
