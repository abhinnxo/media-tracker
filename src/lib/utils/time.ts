
import { formatDistanceToNow, format } from 'date-fns';

export const formatRelativeTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) {
    return 'just now';
  }
  
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  // For anything else, use formatDistanceToNow
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const formatMessageTime = (date: string | Date): string => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // If the date is today
  if (parsedDate >= today) {
    return format(parsedDate, 'h:mm a');
  }
  
  // If the date is yesterday
  if (parsedDate >= yesterday && parsedDate < today) {
    return 'Yesterday';
  }
  
  // If the date is this year
  if (parsedDate.getFullYear() === now.getFullYear()) {
    return format(parsedDate, 'MMM d');
  }
  
  // If the date is in another year
  return format(parsedDate, 'MMM d, yyyy');
};
