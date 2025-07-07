// Utility function to detect file type from URL
export const detectFileType = (url) => {
  if (!url || typeof url !== 'string') return 'link';
  
  // Remove query parameters and fragments for extension detection
  const cleanUrl = url.split('?')[0].split('#')[0].toLowerCase();
  
  // Extract file extension
  const extension = cleanUrl.split('.').pop();
  
  // Define file type mappings
  const fileTypeMap = {
    // Documents
    'pdf': 'pdf',
    'doc': 'document',
    'docx': 'document',
    'txt': 'document',
    'rtf': 'document',
    'odt': 'document',
    
    // Spreadsheets
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'csv': 'spreadsheet',
    'ods': 'spreadsheet',
    
    // Presentations
    'ppt': 'presentation',
    'pptx': 'presentation',
    'odp': 'presentation',
    
    // Images
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'webp': 'image',
    'bmp': 'image',
    
    // Videos
    'mp4': 'video',
    'avi': 'video',
    'mov': 'video',
    'wmv': 'video',
    'flv': 'video',
    'webm': 'video',
    'mkv': 'video',
    'm4v': 'video',
    
    // Audio
    'mp3': 'audio',
    'wav': 'audio',
    'ogg': 'audio',
    'flac': 'audio',
    'aac': 'audio',
    'm4a': 'audio',
    
    // Archives
    'zip': 'archive',
    'rar': 'archive',
    '7z': 'archive',
    'tar': 'archive',
    'gz': 'archive',
    
    // Code files
    'js': 'code',
    'ts': 'code',
    'jsx': 'code',
    'tsx': 'code',
    'html': 'code',
    'css': 'code',
    'scss': 'code',
    'py': 'code',
    'java': 'code',
    'cpp': 'code',
    'c': 'code',
    'php': 'code',
    'rb': 'code',
    'go': 'code',
    'rs': 'code',
    'swift': 'code',
    'kt': 'code',
    'sql': 'code',
    'json': 'code',
    'xml': 'code',
    'yaml': 'code',
    'yml': 'code',
    
    // Ebooks
    'epub': 'ebook',
    'mobi': 'ebook',
    'azw': 'ebook',
    'azw3': 'ebook'
  };
  
  // Check for specific domains/platforms
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'video';
  if (url.includes('vimeo.com')) return 'video';
  if (url.includes('github.com') || url.includes('gitlab.com') || url.includes('bitbucket.org')) return 'code';
  if (url.includes('stackoverflow.com') || url.includes('stackexchange.com')) return 'tutorial';
  if (url.includes('medium.com') || url.includes('dev.to') || url.includes('hashnode.com')) return 'article';
  if (url.includes('wikipedia.org')) return 'reference';
  if (url.includes('docs.google.com')) {
    if (url.includes('/document/')) return 'document';
    if (url.includes('/spreadsheets/')) return 'spreadsheet';
    if (url.includes('/presentation/')) return 'presentation';
  }
  
  // Return mapped type or default
  return fileTypeMap[extension] || 'link';
};

// Get icon for file type
export const getFileTypeIcon = (type) => {
  const iconMap = {
    'pdf': '📄',
    'document': '📝',
    'spreadsheet': '📊',
    'presentation': '📽️',
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵',
    'archive': '📦',
    'code': '💻',
    'ebook': '📚',
    'tutorial': '📖',
    'article': '📰',
    'reference': '🔗',
    'link': '🌐'
  };
  
  return iconMap[type] || '🔗';
};

// Get display name for file type
export const getFileTypeDisplayName = (type) => {
  const displayMap = {
    'pdf': 'PDF Document',
    'document': 'Document',
    'spreadsheet': 'Spreadsheet',
    'presentation': 'Presentation',
    'image': 'Image',
    'video': 'Video',
    'audio': 'Audio',
    'archive': 'Archive',
    'code': 'Code',
    'ebook': 'E-book',
    'tutorial': 'Tutorial',
    'article': 'Article',
    'reference': 'Reference',
    'link': 'Website Link'
  };
  
  return displayMap[type] || 'Link';
};
