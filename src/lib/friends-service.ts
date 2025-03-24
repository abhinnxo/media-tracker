
import { supabase } from './supabase';
import { toast } from '@/hooks/use-toast';

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface FriendProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  online_status: boolean;
  last_active: string | null;
  status: 'pending' | 'accepted' | 'blocked';
}

export const friendsService = {
  // Get all friends and their profiles
  async getFriends(userId: string): Promise<FriendProfile[]> {
    try {
      // Get accepted friendships where the user is either the requester or the recipient
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('id, user_id, friend_id, status')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');
      
      if (error) throw error;
      
      if (!friendships?.length) return [];
      
      // Extract friend IDs
      const friendIds = friendships.map(friendship => 
        friendship.user_id === userId ? friendship.friend_id : friendship.user_id
      );
      
      // Get profiles for these friends
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('user_id', friendIds);
      
      if (profilesError) throw profilesError;
      
      // Get online status
      const { data: presence, error: presenceError } = await supabase
        .from('user_presence')
        .select('user_id, online_status, last_active')
        .in('user_id', friendIds);
      
      if (presenceError) throw presenceError;
      
      // Combine the data
      return profiles.map(profile => {
        const friendship = friendships.find(f => 
          f.user_id === profile.user_id || f.friend_id === profile.user_id
        );
        
        const userPresence = presence?.find(p => p.user_id === profile.user_id);
        
        return {
          id: profile.id,
          username: profile.username || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          online_status: userPresence?.online_status || false,
          last_active: userPresence?.last_active || null,
          status: friendship?.status as 'pending' | 'accepted' | 'blocked'
        };
      });
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  },
  
  // Get friend requests
  async getFriendRequests(userId: string): Promise<FriendProfile[]> {
    try {
      // Get pending friendships where the user is the recipient
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('id, user_id, status')
        .eq('friend_id', userId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      if (!friendships?.length) return [];
      
      // Extract requester IDs
      const requesterIds = friendships.map(friendship => friendship.user_id);
      
      // Get profiles for these requesters
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, user_id')
        .in('user_id', requesterIds);
      
      if (profilesError) throw profilesError;
      
      // Combine the data
      return profiles.map(profile => {
        const friendship = friendships.find(f => f.user_id === profile.user_id);
        
        return {
          id: profile.id,
          username: profile.username || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          online_status: false,
          last_active: null,
          status: friendship?.status as 'pending' | 'accepted' | 'blocked'
        };
      });
    } catch (error) {
      console.error('Error fetching friend requests:', error);
      return [];
    }
  },
  
  // Send a friend request
  async sendFriendRequest(userId: string, friendUsername: string): Promise<boolean> {
    try {
      // First, get the friend's user ID from their username
      console.log('Searching for username:', friendUsername);
      const { data: friendProfile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('username', friendUsername)
        .maybeSingle();
      
      if (profileError || !friendProfile) {
        console.error('Profile error:', profileError);
        toast({
          title: "User not found",
          description: "Could not find a user with that username",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if trying to add yourself
      if (friendProfile.user_id === userId) {
        toast({
          title: "Cannot add yourself",
          description: "You cannot send a friend request to yourself",
          variant: "destructive"
        });
        return false;
      }
      
      const friendId = friendProfile.user_id;
      
      // Check if a friendship already exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('id, status')
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingFriendship) {
        if (existingFriendship.status === 'blocked') {
          toast({
            title: "Unable to send request",
            description: "You cannot send a friend request to this user",
            variant: "destructive"
          });
          return false;
        }
        
        if (existingFriendship.status === 'pending') {
          toast({
            title: "Request already sent",
            description: "A friend request is already pending for this user",
            variant: "destructive"
          });
          return false;
        }
        
        if (existingFriendship.status === 'accepted') {
          toast({
            title: "Already friends",
            description: "You are already friends with this user",
            variant: "destructive"
          });
          return false;
        }
      }
      
      // Create a new friendship
      const { error: insertError } = await supabase
        .from('friendships')
        .insert({
          user_id: userId,
          friend_id: friendId,
          status: 'pending'
        });
      
      if (insertError) throw insertError;
      
      toast({
        title: "Friend request sent",
        description: `Friend request sent to ${friendUsername}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Accept a friend request
  async acceptFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);
      
      if (error) throw error;
      
      toast({
        title: "Friend request accepted",
        description: "You are now friends"
      });
      
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Decline a friend request
  async declineFriendRequest(friendshipId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      
      if (error) throw error;
      
      toast({
        title: "Friend request declined",
      });
      
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast({
        title: "Error",
        description: "Failed to decline friend request",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Remove a friend
  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);
      
      if (error) throw error;
      
      toast({
        title: "Friend removed",
      });
      
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Block a user
  async blockUser(userId: string, targetId: string): Promise<boolean> {
    try {
      // First check if a friendship entry exists
      const { data: existingFriendship, error: checkError } = await supabase
        .from('friendships')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetId}),and(user_id.eq.${targetId},friend_id.eq.${userId})`)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingFriendship) {
        // Update the existing friendship to blocked
        const { error } = await supabase
          .from('friendships')
          .update({ 
            status: 'blocked', 
            user_id: userId, // Ensure the blocker is the user_id
            friend_id: targetId, // Ensure the blocked user is the friend_id
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingFriendship.id);
          
        if (error) throw error;
      } else {
        // Create a new blocked friendship
        const { error } = await supabase
          .from('friendships')
          .insert({
            user_id: userId,
            friend_id: targetId,
            status: 'blocked'
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "User blocked",
        description: "You will no longer receive messages or friend requests from this user"
      });
      
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Unblock a user
  async unblockUser(userId: string, blockedId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', blockedId)
        .eq('status', 'blocked');
      
      if (error) throw error;
      
      toast({
        title: "User unblocked",
      });
      
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      toast({
        title: "Error",
        description: "Failed to unblock user",
        variant: "destructive"
      });
      return false;
    }
  },
  
  // Get blocked users
  async getBlockedUsers(userId: string): Promise<FriendProfile[]> {
    try {
      // Get blocked entries where the user is the blocker
      const { data: blockedEntries, error } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'blocked');
      
      if (error) throw error;
      
      if (!blockedEntries?.length) return [];
      
      // Extract blocked user IDs
      const blockedIds = blockedEntries.map(entry => entry.friend_id);
      
      // Get profiles for these blocked users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, user_id')
        .in('user_id', blockedIds);
      
      if (profilesError) throw profilesError;
      
      // Create blocked user profiles
      return profiles.map(profile => ({
        id: profile.id,
        username: profile.username || '',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        online_status: false,
        last_active: null,
        status: 'blocked' as const
      }));
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      return [];
    }
  },
  
  // Get friendship suggestions (users with mutual friends)
  async getFriendSuggestions(userId: string, limit: number = 5): Promise<FriendProfile[]> {
    try {
      // This is a complex query - in a real app we'd use a stored procedure
      // For now, let's do a simplified version - just get users who aren't friends or blocked
      
      // First get all friends and blocked users
      const { data: friendships, error } = await supabase
        .from('friendships')
        .select('friend_id, user_id, status')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`);
      
      if (error) throw error;
      
      // Extract all user IDs that have a relationship with the current user
      const relatedUserIds = new Set<string>();
      friendships.forEach(friendship => {
        relatedUserIds.add(friendship.user_id);
        relatedUserIds.add(friendship.friend_id);
      });
      
      // Add the current user to exclude them
      relatedUserIds.add(userId);
      
      // Get profiles not in the related users list
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, user_id')
        .not('user_id', 'in', Array.from(relatedUserIds))
        .limit(limit);
      
      if (profilesError) throw profilesError;
      
      // Return suggestions
      return profiles.map(profile => ({
        id: profile.id,
        username: profile.username || '',
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        online_status: false,
        last_active: null,
        status: 'suggestion' as any
      }));
    } catch (error) {
      console.error('Error fetching friend suggestions:', error);
      return [];
    }
  },
  
  // Search for users
  async searchUsers(query: string, userId: string): Promise<FriendProfile[]> {
    if (!query || query.length < 2) return [];
    
    try {
      // Search by username or full name
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, user_id')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .neq('user_id', userId) // Exclude current user
        .limit(10);
      
      if (error) throw error;
      
      if (!profiles?.length) return [];
      
      // Get friendships to determine status
      const profileUserIds = profiles.map(profile => profile.user_id);
      const { data: friendships, error: friendshipError } = await supabase
        .from('friendships')
        .select('user_id, friend_id, status')
        .or(`and(user_id.eq.${userId},friend_id.in.(${profileUserIds.join(',')})),and(friend_id.eq.${userId},user_id.in.(${profileUserIds.join(',')}))`);
      
      if (friendshipError) throw friendshipError;
      
      // Combine the data
      return profiles.map(profile => {
        // Find friendship if it exists
        const friendship = friendships?.find(f => 
          (f.user_id === userId && f.friend_id === profile.user_id) || 
          (f.friend_id === userId && f.user_id === profile.user_id)
        );
        
        return {
          id: profile.id,
          username: profile.username || '',
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          online_status: false,
          last_active: null,
          status: friendship?.status as 'pending' | 'accepted' | 'blocked' || 'none'
        };
      });
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
  
  // Update user presence
  async updateUserPresence(userId: string, isOnline: boolean): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      
      // Check if presence record exists
      const { data: existingPresence } = await supabase
        .from('user_presence')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (existingPresence) {
        // Update existing record
        await supabase
          .from('user_presence')
          .update({ 
            online_status: isOnline, 
            last_active: now 
          })
          .eq('user_id', userId);
      } else {
        // Create new record
        await supabase
          .from('user_presence')
          .insert({ 
            user_id: userId, 
            online_status: isOnline,
            last_active: now
          });
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user presence:', error);
      return false;
    }
  }
};
