import React, { useState, useEffect, useCallback } from 'react';
import {
  Trash2,
  RefreshCcw,
  Search,
  Sun,
  Moon,
  Mail,
  User,
  Inbox,
  Settings,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import {
  getMessages,
  getMessage,
  deleteMessage,
  deleteAllMessages,
  searchMessages,
  setApiUrl,
  getApiUrl,
  type Message
} from './api';
import { decodeMimeHeader } from './utils';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [totalMessages, setTotalMessages] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiUrlInput, setApiUrlInput] = useState(getApiUrl());
  const [apiError, setApiError] = useState<string | null>(null);

  const fetchMessages = useCallback(async (query = '') => {
    setLoading(true);
    setApiError(null);
    try {
      let data;
      if (query) {
        data = await searchMessages('containing', query);
      } else {
        data = await getMessages();
      }
      setMessages(data.items || []);
      setTotalMessages(data.total);
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      setApiError(error.message || 'Could not connect to MailHog API. Please check your settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('api_url', apiUrlInput);
  }, [apiUrlInput]);

  const handleSelectMessage = async (msg: Message) => {
    try {
      const fullMsg = await getMessage(msg.ID);
      setSelectedMessage(fullMsg);
    } catch (error) {
      console.error('Failed to fetch full message:', error);
    }
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this message?')) {
      try {
        await deleteMessage(id);
        if (selectedMessage?.ID === id) setSelectedMessage(null);
        fetchMessages(searchQuery);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Delete ALL messages?')) {
      try {
        await deleteAllMessages();
        setSelectedMessage(null);
        fetchMessages();
      } catch (error) {
        console.error('Failed to delete all messages:', error);
      }
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages(searchQuery);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setApiUrl(apiUrlInput);
    setIsSettingsOpen(false);
    fetchMessages();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <Mail className="logo-icon" size={24} />
          <h1>MailHog Simple</h1>
        </div>

        <form className="search-bar" onSubmit={handleSearch}>
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <button onClick={() => fetchMessages(searchQuery)} title="Refresh">
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleDeleteAll} title="Delete all" className="btn-danger">
            <Trash2 size={20} />
          </button>
          <button onClick={() => setIsSettingsOpen(true)} title="Settings">
            <Settings size={20} />
          </button>
          <button onClick={toggleTheme} title="Toggle theme">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveSettings}>
              <div className="form-group">
                <label>API Base URL</label>
                <input
                  type="text"
                  value={apiUrlInput}
                  onChange={(e) => setApiUrlInput(e.target.value)}
                  placeholder="e.g. http://localhost:8025"
                />
                <small>Enter the full URL of your MailHog server.</small>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !messages.length ? (
        <div className="loading-screen">
          <RefreshCcw size={48} className="animate-spin" />
          <p>Connecting to MailHog...</p>
        </div>
      ) : apiError ? (
        <div className="error-screen">
          <RefreshCcw size={48} className="error-icon" />
          <h2>Connection Error</h2>
          <p>{apiError}</p>
          <div className="error-actions">
            <button onClick={() => fetchMessages(searchQuery)} className="btn-primary">Try Again</button>
            <button onClick={() => setIsSettingsOpen(true)} className="btn-outline">Open Settings</button>
          </div>
        </div>
      ) : (
        <div className="main-layout">          {/* Message List */}
          <aside className="sidebar">          <div className="sidebar-header">
            <span>{totalMessages} Messages</span>
          </div>
            <div className="message-list">
              {messages.length === 0 ? (
                <div className="empty-state">
                  <Inbox size={48} />
                  <p>No messages found</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.ID}
                    className={`message-item ${selectedMessage?.ID === msg.ID ? 'active' : ''}`}
                    onClick={() => handleSelectMessage(msg)}
                  >
                    <div className="msg-from">
                      <User size={14} />
                      <span>{msg.From.Mailbox}@{msg.From.Domain}</span>
                    </div>
                    <div className="msg-subject">{decodeMimeHeader(msg.Content.Headers.Subject?.[0] || '(No Subject)')}</div>
                    <div className="msg-meta">
                      <span className="msg-date">{format(new Date(msg.Created), 'MMM d, HH:mm')}</span>
                      <button onClick={(e) => handleDeleteMessage(msg.ID, e)} className="msg-delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Message Detail */}
          <main className="content">
            {selectedMessage ? (
              <div className="message-detail">
                <div className="detail-header">
                  <h2>{decodeMimeHeader(selectedMessage.Content.Headers.Subject?.[0] || '(No Subject)')}</h2>
                  <div className="detail-meta">
                    <div className="meta-row">
                      <strong>From:</strong> {selectedMessage.From.Mailbox}@{selectedMessage.From.Domain}
                    </div>
                    <div className="meta-row">
                      <strong>To:</strong> {selectedMessage.To.map(t => `${t.Mailbox}@${t.Domain}`).join(', ')}
                    </div>
                    <div className="meta-row">
                      <strong>Date:</strong> {format(new Date(selectedMessage.Created), 'PPPP p')}
                    </div>
                  </div>
                </div>
                <div className="detail-body">
                  {selectedMessage.Content.Body ? (
                    <pre>{selectedMessage.Content.Body}</pre>
                  ) : (
                    <div className="empty-state">Message body is empty or unavailable.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="empty-content">
                <Mail size={64} />
                <p>Select a message to view its contents</p>
              </div>
            )}
          </main>

          <style>{`
            .app-container { height: 100%; display: flex; flex-direction: column; }
            .header { 
              display: flex; align-items: center; justify-content: space-between; 
              padding: 0.75rem 1.5rem; background-color: var(--bg-primary); 
              border-bottom: 1px solid var(--border-color);
            }
            .header-left { display: flex; align-items: center; gap: 0.75rem; }
            .header-left h1 { font-size: 1.25rem; margin: 0; }
            .logo-icon { color: var(--accent-color); }
            .search-bar { position: relative; flex: 1; max-width: 500px; margin: 0 2rem; }
            .search-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: var(--text-secondary); }
            .search-bar input { width: 100%; padding-left: 2.5rem; }
            .header-actions { display: flex; gap: 1rem; }
            .header-actions button { padding: 0.5rem; border-radius: 0.375rem; transition: background 0.2s; }
            .header-actions button:hover { background-color: var(--bg-secondary); }
            .btn-danger { color: var(--danger-color); }
            .btn-danger:hover { background-color: #fee2e2 !important; }
            [data-theme="dark"] .btn-danger:hover { background-color: #450a0a !important; }

            .main-layout { display: flex; flex: 1; overflow: hidden; }
            .sidebar { 
              width: 350px; border-right: 1px solid var(--border-color); 
              display: flex; flex-direction: column; background-color: var(--bg-secondary);
            }
            .sidebar-header { padding: 1rem; font-size: 0.875rem; color: var(--text-secondary); border-bottom: 1px solid var(--border-color); }
            .message-list { flex: 1; overflow-y: auto; }
            .message-item { 
              padding: 1rem; border-bottom: 1px solid var(--border-color); 
              cursor: pointer; transition: background 0.2s;
            }
            .message-item:hover { background-color: var(--bg-primary); }
            .message-item.active { background-color: var(--selected-bg); border-left: 4px solid var(--accent-color); }
            .msg-from { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 0.25rem; }
            .msg-subject { font-weight: 600; margin-bottom: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .msg-meta { display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-secondary); }
            .msg-delete { color: var(--danger-color); opacity: 0; transition: opacity 0.2s; }
            .message-item:hover .msg-delete { opacity: 1; }

            .content { flex: 1; overflow-y: auto; background-color: var(--bg-primary); }
            .empty-content { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-secondary); gap: 1rem; }
            .message-detail { padding: 2rem; max-width: 900px; margin: 0 auto; }
            .detail-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-color); }
            .detail-header h2 { margin-top: 0; }
            .detail-meta { font-size: 0.875rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 0.5rem; }
            .meta-row strong { color: var(--text-primary); margin-right: 0.5rem; }
            
            .animate-spin { animation: spin 1s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            .empty-state { display: flex; flex-direction: column; align-items: center; padding: 3rem; color: var(--text-secondary); gap: 1rem; text-align: center; }

            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 100; }
            .modal-content { background: var(--bg-primary); padding: 1.5rem; border-radius: 0.5rem; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
            .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
            .modal-header h3 { margin: 0; }
            .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; }
            .form-group label { font-size: 0.875rem; font-weight: 500; }
            .form-group small { color: var(--text-secondary); font-size: 0.75rem; }
            .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
            .btn-primary { background-color: var(--accent-color); color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; }
            .btn-primary:hover { background-color: var(--accent-hover); }
            .btn-outline { border: 1px solid var(--border-color); padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; }
            .btn-outline:hover { background-color: var(--bg-secondary); }

            .error-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; text-align: center; }
            .loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; color: var(--text-secondary); gap: 1rem; }
            .error-icon { color: var(--danger-color); margin-bottom: 1rem; }            .error-actions { display: flex; gap: 1rem; margin-top: 1.5rem; }
      `}</style>
        </div>
      )}
    </div>
  );
};

export default App;
