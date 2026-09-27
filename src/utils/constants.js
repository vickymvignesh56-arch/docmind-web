export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export const AUTH_TOKEN_KEY = 'ragfish_auth_token';
export const USER_INFO_KEY = 'ragfish_user_info';

export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.docx'];
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const LLM_PROVIDERS = {
  GEMINI: 'GEMINI',
  OPENAI: 'OPENAI',
  ANTHROPIC: 'ANTHROPIC',
};

export const LLM_DEFAULT_MODELS = {
  GEMINI: {
    chatModel: 'gemini-2.5-flash',
    embeddingModel: 'gemini-embedding-2',
    chatOptions: ['gemini-2.5-flash', 'gemini-3.6-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
    embeddingOptions: ['gemini-embedding-2', 'text-embedding-004'],
  },
  OPENAI: {
    chatModel: 'gpt-4o',
    embeddingModel: 'text-embedding-3-small',
    chatOptions: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    embeddingOptions: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'],
  },
  ANTHROPIC: {
    chatModel: 'claude-3-5-sonnet-20241022',
    embeddingModel: 'text-embedding-3-small',
    chatOptions: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    embeddingOptions: ['text-embedding-3-small', 'gemini-embedding-2'],
  },
};

export const RESOURCE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
};

export const CHANNEL_TYPES = [
  { value: 'files', label: 'Files (PDF, DOCX)', available: true },
  { value: 'database', label: 'Database (Coming Soon)', available: false },
  { value: 'xlxs', label: 'Spreadsheet / XLSX (Coming Soon)', available: false },
];
