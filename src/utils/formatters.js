export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num)) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const formatDate = (dateInput) => {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
};

export const formatRelativeTime = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateInput);
  } catch {
    return '';
  }
};

export const groupChatsByDate = (chats) => {
  if (!Array.isArray(chats)) return { today: [], yesterday: [], last7Days: [], older: [] };

  const today = [];
  const yesterday = [];
  const last7Days = [];
  const older = [];

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
  const startOf7Days = startOfToday - 7 * 24 * 60 * 60 * 1000;

  chats.forEach((chat) => {
    const chatDate = new Date(chat.createdAt || chat.updatedAt || Date.now()).getTime();
    if (chatDate >= startOfToday) {
      today.push(chat);
    } else if (chatDate >= startOfYesterday) {
      yesterday.push(chat);
    } else if (chatDate >= startOf7Days) {
      last7Days.push(chat);
    } else {
      older.push(chat);
    }
  });

  return { today, yesterday, last7Days, older };
};
