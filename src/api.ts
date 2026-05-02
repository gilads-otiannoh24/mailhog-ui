import axios from 'axios';

export interface MessagePath {
  Relays: string[] | null;
  Mailbox: string;
  Domain: string;
  Params: string;
}

export interface MessageContent {
  Headers: Record<string, string[]>;
  Body: string;
  size: number;
}

export interface Message {
  ID: string;
  From: MessagePath;
  To: MessagePath[];
  Content: MessageContent,
  Created: string;
}

export interface MessagesResponse {
  total: number;
  count: number;
  start: number;
  items: Message[];
}

const getBaseURL = () => {
  return localStorage.getItem('api_url') || '';
};

const api = axios.create({
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  config.baseURL = getBaseURL();
  return config;
});

export const setApiUrl = (url: string) => {
  if (url === '/') {
    localStorage.removeItem('api_url');
  } else {
    localStorage.setItem('api_url', url);
  }
};

export const getApiUrl = () => {
  return localStorage.getItem('api_url') || '/';
};

export const getMessages = async (start = 0, limit = 50): Promise<MessagesResponse> => {
  const response = await api.get<MessagesResponse>('/api/v2/messages', {
    params: { start, limit },
  });
  return response.data;
};

export const getMessage = async (id: string): Promise<Message> => {
  const response = await api.get<Message>(`/api/v1/messages/${id}`);
  return response.data;
};

export const searchMessages = async (kind: 'from' | 'to' | 'containing', query: string, start = 0, limit = 50): Promise<MessagesResponse> => {
  const response = await api.get<MessagesResponse>('/api/v2/search', {
    params: { kind, query, start, limit },
  });
  return response.data;
};

export const deleteMessage = async (id: string): Promise<void> => {
  await api.delete(`/api/v1/messages/${id}`);
};

export const deleteAllMessages = async (): Promise<void> => {
  await api.delete('/api/v1/messages');
};

export const getEventSource = (): EventSource => {
  const baseUrl = getApiUrl();
  const eventUrl = baseUrl === '/' ? '/api/v1/events' : `${baseUrl}/api/v1/events`;
  return new EventSource(eventUrl);
};
