import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { messagesService, Conversation, MessageWithSender } from '@/lib/messages-service';
import { friendsService } from '@/lib/friends-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  User,
  MessageCircle,
  Search,
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Reply,
  UserX,
  CircleSlash,
  Clock,
  Check,
  CheckCheck,
  X
} from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

export const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { partnerId } = useParams<{ partnerId?: string }>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [partner, setPartner] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [replyingTo, setReplyingTo] = useState<MessageWithSender | null>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<HTMLDivElement>(null);
  const messageSubscriptionRef = useRef<any>(null);
  const presenceChannelRef = useRef<any>(null);

  // Load conversations on component mount
  useEffect(() => {
    if (user) {
      loadConversations();

      // Subscribe to new messages
      messageSubscriptionRef.current = messagesService.subscribeToMessages(
        user.id,
        (newMessage) => {
          // If we're currently viewing a conversation with this sender
          if (partnerId === newMessage.sender_id) {
            // Mark as read right away
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMessage.id);

            // Add to messages list
            loadMessages(partnerId);
          } else {
            // Just refresh conversations list to show new message notification
            loadConversations();
          }
        }
      );

      // Set up presence for online status
      setupPresence();

      // Cleanup
      return () => {
        if (messageSubscriptionRef.current) {
          supabase.removeChannel(messageSubscriptionRef.current);
        }
        if (presenceChannelRef.current) {
          supabase.removeChannel(presenceChannelRef.current);
        }
      };
    }
  }, [user]);

  // Load messages when partnerId changes
  useEffect(() => {
    if (user && partnerId) {
      loadMessages(partnerId);
    }
  }, [user, partnerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const setupPresence = () => {
    if (!user) return;

    // Update user's online status
    friendsService.updateUserPresence(user.id, true);

    // Create presence channel
    presenceChannelRef.current = supabase.channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        // When presence syncs, do nothing special
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        // When a user comes online and it's our conversation partner
        if (partnerId && key === partnerId) {
          // Update partner's online status in our state
          setPartner(prev => prev ? { ...prev, online_status: true } : null);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        // When a user goes offline and it's our conversation partner
        if (partnerId && key === partnerId) {
          // Update partner's online status in our state
          setPartner(prev => prev ? { ...prev, online_status: false } : null);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track presence for current user
          await presenceChannelRef.current.track({
            user_id: user.id,
            online_at: new Date().toISOString()
          });
        }
      });

    // Set up handler for page unload to mark user as offline
    const handleUnload = () => {
      friendsService.updateUserPresence(user.id, false);
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      friendsService.updateUserPresence(user.id, false);
    };
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const conversationsData = await messagesService.getConversations(user!.id);
      setConversations(conversationsData);

      // If we have a partnerId, find that conversation
      if (partnerId) {
        const currentPartner = conversationsData.find(c => c.user_id === partnerId);
        setPartner(currentPartner || null);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (partnerId: string) => {
    try {
      const messagesData = await messagesService.getMessages(user!.id, partnerId);
      setMessages(messagesData);

      // Refresh conversations to update unread count
      loadConversations();
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !partnerId) return;

    setSendingMessage(true);
    try {
      const success = await messagesService.sendMessage(
        user!.id,
        partnerId,
        messageInput,
        replyingTo?.id
      );

      if (success) {
        setMessageInput('');
        setReplyingTo(null);
        loadMessages(partnerId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const success = await messagesService.deleteMessage(messageId, user!.id);
      if (success && partnerId) {
        loadMessages(partnerId);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive"
      });
    }
  };

  const handleBlockUser = async (userId: string) => {
    if (!partnerId) return;

    try {
      const success = await friendsService.blockUser(user!.id, userId);
      if (success) {
        toast({
          title: "User blocked",
          description: "You will no longer receive messages from this user"
        });
        navigate('/messages');
      }
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "Error",
        description: "Failed to block user",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);

    // Handle typing indicator logic
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a timeout to clear the typing indicator after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      // Here we would send an event to indicate user stopped typing
      // For now this is just a placeholder
    }, 2000);

    setTypingTimeout(timeout);
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };

  const formatMessageGroup = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMMM d, yyyy');
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ [key: string]: MessageWithSender[] }>((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Find the replied-to message for rendering replies
  const findRepliedMessage = (replyId: string | null) => {
    if (!replyId) return null;
    return messages.find(msg => msg.id === replyId);
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Please log in to use the messaging feature</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="flex h-full rounded-lg overflow-hidden border">
        {/* Conversations sidebar */}
        <div className={`w-full md:w-1/3 lg:w-1/4 border-r ${partnerId ? 'hidden md:block' : ''}`}>
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Messages</h2>
          </div>

          {loading && !conversations.length ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[calc(100%-4rem)]" ref={conversationsRef}>
              {conversations.length > 0 ? (
                conversations.map(conversation => (
                  <div
                    key={conversation.user_id}
                    className={`p-4 border-b hover:bg-muted/50 cursor-pointer transition-colors ${partnerId === conversation.user_id ? 'bg-muted' : ''
                      }`}
                    onClick={() => navigate(`/messages/${conversation.user_id}`)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.avatar_url || ''} alt={conversation.username} />
                          <AvatarFallback>
                            <User className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online_status && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium truncate">
                            {conversation.full_name || conversation.username}
                          </h3>
                          <span className="text-xs text-muted-foreground ml-2">
                            {conversation.last_message_time ? formatMessageDate(conversation.last_message_time) : ''}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      {conversation.unread_count > 0 && (
                        <Badge className="ml-auto">{conversation.unread_count}</Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No messages yet</h3>
                  <p className="text-muted-foreground mb-4">Start a conversation with a friend</p>
                  <Button onClick={() => navigate('/friends')}>
                    Find Friends
                  </Button>
                </div>
              )}
            </ScrollArea>
          )}
        </div>

        {/* Message content area */}
        {partnerId ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                {partner && (
                  <>
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={partner.avatar_url || ''} alt={partner.username} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      {partner.online_status && (
                        <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 border-2 border-background rounded-full"></span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{partner.full_name || partner.username}</h3>
                      <p className="text-xs text-muted-foreground">
                        {partner.online_status ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(`/user/${partner?.username}`)}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleBlockUser(partnerId)}
                    className="text-destructive"
                  >
                    <CircleSlash className="mr-2 h-4 w-4" />
                    Block User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : messages.length > 0 ? (
                <div className="space-y-6">
                  {Object.entries(groupedMessages).map(([date, msgs]) => (
                    <div key={date}>
                      <div className="flex items-center justify-center my-4">
                        <div className="bg-muted px-3 py-1 rounded-full text-xs">
                          {formatMessageGroup(msgs[0].created_at)}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {msgs.map(message => {
                          const isCurrentUser = message.sender_id === user.id;
                          const repliedMessage = findRepliedMessage(message.reply_to);

                          return (
                            <div
                              key={message.id}
                              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[75%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                                {!isCurrentUser && (
                                  <div className="flex items-center gap-2 mb-1">
                                    <Avatar className="h-6 w-6">
                                      <AvatarImage src={message.sender.avatar_url || ''} alt={message.sender.username} />
                                      <AvatarFallback>{message.sender.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium">{message.sender.username}</span>
                                  </div>
                                )}

                                <div className={`relative group rounded-lg px-4 py-2 ${isCurrentUser
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                                  }`}>
                                  {repliedMessage && (
                                    <div className={`text-xs p-2 mb-1 rounded ${isCurrentUser
                                      ? 'bg-primary-foreground/10 text-primary-foreground/90'
                                      : 'bg-background text-muted-foreground'
                                      }`}>
                                      <div className="flex items-center gap-1 mb-1">
                                        <Reply className="h-3 w-3" />
                                        <span className="font-medium">
                                          {repliedMessage.sender_id === user.id
                                            ? 'You'
                                            : repliedMessage.sender.username}
                                        </span>
                                      </div>
                                      <p className="truncate">{repliedMessage.content}</p>
                                    </div>
                                  )}

                                  <p>{message.content}</p>

                                  <div className={`absolute ${isCurrentUser ? '-left-16' : '-right-16'} top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8"
                                        onClick={() => setReplyingTo(message)}
                                      >
                                        <Reply className="h-4 w-4" />
                                      </Button>
                                      {isCurrentUser && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-8 w-8 text-destructive"
                                          onClick={() => handleDeleteMessage(message.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-xs text-right mt-1">
                                    <span className={isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                                      {format(new Date(message.created_at), 'h:mm a')}
                                    </span>
                                    {isCurrentUser && (
                                      <span className="ml-1">
                                        {message.is_read ? (
                                          <CheckCheck className="inline h-3 w-3 text-primary-foreground/70" />
                                        ) : (
                                          <Check className="inline h-3 w-3 text-primary-foreground/70" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {isPartnerTyping && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                        <span className="inline-flex gap-1">
                          <span className="animate-bounce">.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
                          <span className="animate-bounce" style={{ animationDelay: '0.4s' }}>.</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No messages yet. Send a message to start the conversation.</p>
                </div>
              )}
            </ScrollArea>

            {/* Reply preview */}
            {replyingTo && (
              <div className="border-t p-2 flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">
                      Replying to {replyingTo.sender_id === user.id ? 'yourself' : replyingTo.sender.username}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{replyingTo.content}</p>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => setReplyingTo(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={messageInput}
                  onChange={handleInputChange}
                  placeholder="Type a message..."
                  className="min-h-[60px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Your Messages</h3>
              <p className="text-muted-foreground mb-4">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
