
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FriendProfile, friendsService } from '@/lib/friends-service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { 
  Search, 
  UserPlus, 
  MessageCircle, 
  MoreVertical, 
  UserMinus, 
  UserX, 
  CircleSlash, 
  Filter, 
  User,
  X,
  Clock
} from 'lucide-react';

export const Friends = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendProfile[]>([]);
  const [suggestions, setSuggestions] = useState<FriendProfile[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<FriendProfile[]>([]);
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('friends');
  const [addFriendUsername, setAddFriendUsername] = useState('');
  const [friendToRemove, setFriendToRemove] = useState<FriendProfile | null>(null);
  const [userToBlock, setUserToBlock] = useState<FriendProfile | null>(null);
  const [addFriendDialogOpen, setAddFriendDialogOpen] = useState(false);
  const [removeFriendDialogOpen, setRemoveFriendDialogOpen] = useState(false);
  const [blockUserDialogOpen, setBlockUserDialogOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);
  
  const loadFriends = async () => {
    setLoading(true);
    try {
      // Load friends
      const friendsData = await friendsService.getFriends(user!.id);
      setFriends(friendsData);
      
      // Load friend requests
      const requestsData = await friendsService.getFriendRequests(user!.id);
      setFriendRequests(requestsData);
      
      // Load friend suggestions
      const suggestionsData = await friendsService.getFriendSuggestions(user!.id, 5);
      setSuggestions(suggestionsData);
      
      // Load blocked users
      const blockedData = await friendsService.getBlockedUsers(user!.id);
      setBlockedUsers(blockedData);
    } catch (error) {
      console.error('Error loading friends data:', error);
      toast({
        title: "Error",
        description: "Failed to load friends data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await friendsService.searchUsers(searchQuery, user!.id);
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive"
      });
    }
  };
  
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
    }
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const filterFriends = (friends: FriendProfile[]) => {
    if (!filterQuery) return friends;
    
    return friends.filter(friend => 
      friend.username.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (friend.full_name && friend.full_name.toLowerCase().includes(filterQuery.toLowerCase()))
    );
  };
  
  const handleSendFriendRequest = async () => {
    if (!addFriendUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a username",
        variant: "destructive"
      });
      return;
    }
    
    const success = await friendsService.sendFriendRequest(user!.id, addFriendUsername);
    if (success) {
      setAddFriendUsername('');
      setAddFriendDialogOpen(false);
      // Refresh search results if the user was in search results
      if (activeTab === 'search') {
        handleSearch();
      }
    }
  };
  
  const handleAcceptFriendRequest = async (friendshipId: string) => {
    const success = await friendsService.acceptFriendRequest(friendshipId);
    if (success) {
      loadFriends();
    }
  };
  
  const handleDeclineFriendRequest = async (friendshipId: string) => {
    const success = await friendsService.declineFriendRequest(friendshipId);
    if (success) {
      loadFriends();
    }
  };
  
  const handleRemoveFriend = async () => {
    if (!friendToRemove) return;
    
    const success = await friendsService.removeFriend(user!.id, friendToRemove.id);
    if (success) {
      setRemoveFriendDialogOpen(false);
      setFriendToRemove(null);
      loadFriends();
      
      // Refresh search results if the user was in search results
      if (activeTab === 'search') {
        handleSearch();
      }
    }
  };
  
  const handleBlockUser = async () => {
    if (!userToBlock) return;
    
    const success = await friendsService.blockUser(user!.id, userToBlock.id);
    if (success) {
      setBlockUserDialogOpen(false);
      setUserToBlock(null);
      loadFriends();
      
      // Refresh search results if the user was in search results
      if (activeTab === 'search') {
        handleSearch();
      }
    }
  };
  
  const handleUnblockUser = async (blockedId: string) => {
    const success = await friendsService.unblockUser(user!.id, blockedId);
    if (success) {
      loadFriends();
    }
  };
  
  const openUserProfile = (username: string) => {
    navigate(`/user/${username}`);
  };
  
  const startConversation = (userId: string) => {
    navigate(`/messages/${userId}`);
  };
  
  const renderFriendCard = (friend: FriendProfile) => (
    <Card key={friend.id} className="mb-3">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={friend.avatar_url || ''} alt={friend.username} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{friend.full_name || friend.username}</CardTitle>
            <CardDescription>@{friend.username}</CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {friend.online_status && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 hover:text-green-500">
              Online
            </Badge>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => startConversation(friend.id)}
            title="Message"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openUserProfile(friend.username)}>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setFriendToRemove(friend);
                  setRemoveFriendDialogOpen(true);
                }}
                className="text-destructive"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                Remove Friend
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => {
                  setUserToBlock(friend);
                  setBlockUserDialogOpen(true);
                }}
                className="text-destructive"
              >
                <CircleSlash className="mr-2 h-4 w-4" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
    </Card>
  );
  
  const renderFriendRequestCard = (request: FriendProfile) => (
    <Card key={request.id} className="mb-3">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={request.avatar_url || ''} alt={request.username} />
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-base">{request.full_name || request.username}</CardTitle>
              <CardDescription>@{request.username}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
            <Clock className="mr-2 h-3 w-3" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="pt-0 px-4 pb-4 flex gap-2 justify-end">
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleDeclineFriendRequest(request.id)}
        >
          Decline
        </Button>
        <Button 
          size="sm"
          onClick={() => handleAcceptFriendRequest(request.id)}
        >
          Accept
        </Button>
      </CardFooter>
    </Card>
  );
  
  const renderSearchResultCard = (result: FriendProfile) => (
    <Card key={result.id} className="mb-3">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openUserProfile(result.username)}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={result.avatar_url || ''} alt={result.username} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{result.full_name || result.username}</CardTitle>
            <CardDescription>@{result.username}</CardDescription>
          </div>
        </div>
        <div>
          {result.status === 'accepted' ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500">
                Friends
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => startConversation(result.id)}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
          ) : result.status === 'pending' ? (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500">
              Request Sent
            </Badge>
          ) : result.status === 'blocked' ? (
            <Badge variant="outline" className="bg-red-500/10 text-red-500">
              Blocked
            </Badge>
          ) : (
            <Button
              size="sm"
              onClick={() => friendsService.sendFriendRequest(user!.id, result.username).then(() => handleSearch())}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
  
  const renderSuggestionCard = (suggestion: FriendProfile) => (
    <Card key={suggestion.id} className="mb-3">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openUserProfile(suggestion.username)}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={suggestion.avatar_url || ''} alt={suggestion.username} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{suggestion.full_name || suggestion.username}</CardTitle>
            <CardDescription>@{suggestion.username}</CardDescription>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => friendsService.sendFriendRequest(user!.id, suggestion.username).then(loadFriends)}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Friend
        </Button>
      </CardHeader>
    </Card>
  );
  
  const renderBlockedUserCard = (blockedUser: FriendProfile) => (
    <Card key={blockedUser.id} className="mb-3">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={blockedUser.avatar_url || ''} alt={blockedUser.username} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base">{blockedUser.full_name || blockedUser.username}</CardTitle>
            <CardDescription>@{blockedUser.username}</CardDescription>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleUnblockUser(blockedUser.id)}
        >
          Unblock
        </Button>
      </CardHeader>
    </Card>
  );
  
  if (!user) {
    return (
      <div className="text-center py-10">
        <p>Please log in to manage your friends</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Friends</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              onKeyDown={handleSearchKeyDown}
              className="w-[200px] md:w-[300px]"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
              onClick={handleSearch}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={addFriendDialogOpen} onOpenChange={setAddFriendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add a Friend</DialogTitle>
                <DialogDescription>
                  Enter the username of the person you want to add as a friend.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  type="text"
                  placeholder="Username"
                  value={addFriendUsername}
                  onChange={(e) => setAddFriendUsername(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddFriendDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendFriendRequest}>Send Request</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="friends">
            Friends
            {friends.length > 0 && <Badge className="ml-2">{friends.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="requests">
            Requests
            {friendRequests.length > 0 && <Badge className="ml-2">{friendRequests.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          <TabsTrigger value="blocked">Blocked</TabsTrigger>
          {searchResults.length > 0 && (
            <TabsTrigger value="search">
              Search Results
              <Badge className="ml-2">{searchResults.length}</Badge>
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="friends">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : friends.length > 0 ? (
            <>
              <div className="flex items-center mb-4">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Filter friends..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  {filterQuery && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setFilterQuery('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              {filterFriends(friends).map(renderFriendCard)}
            </>
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No friends yet</h3>
              <p className="text-muted-foreground mb-4">Send a friend request to get started</p>
              <Button onClick={() => setAddFriendDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Friend
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="requests">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : friendRequests.length > 0 ? (
            friendRequests.map(renderFriendRequestCard)
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No pending friend requests</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="suggestions">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map(renderSuggestionCard)
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No friend suggestions available</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="blocked">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : blockedUsers.length > 0 ? (
            blockedUsers.map(renderBlockedUserCard)
          ) : (
            <div className="text-center py-10 border rounded-lg">
              <p className="text-muted-foreground">No blocked users</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="search">
          {searchResults.map(renderSearchResultCard)}
        </TabsContent>
      </Tabs>
      
      {/* Remove friend confirmation dialog */}
      <AlertDialog open={removeFriendDialogOpen} onOpenChange={setRemoveFriendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Friend</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {friendToRemove?.username} from your friends list?
              You can add them again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFriendToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFriend}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Block user confirmation dialog */}
      <AlertDialog open={blockUserDialogOpen} onOpenChange={setBlockUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to block {userToBlock?.username}? They will be removed from your friends list
              and won't be able to contact you or see your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToBlock(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
