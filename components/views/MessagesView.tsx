'use client';

import { useEffect, useRef, useState } from 'react';
import type { UserSession } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import styles from './MessagesView.module.css';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  itemId?: string | null;
  itemTitle?: string | null;
  itemImg?: string | null;
  lastMessage?: string | null;
  lastMessageAt?: number | null;
  createdAt: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  imageUrl?: string | null;
  createdAt: number;
}

interface ChatTarget {
  userId: string;
  userName: string;
  itemId?: string;
  itemTitle?: string;
  itemImg?: string;
}

interface MessagesViewProps {
  session: UserSession | null;
  activeConvo: Conversation | null;
  chatTarget: ChatTarget | null;
  onConvoChange: (convo: Conversation | null) => void;
  onChatTargetChange: (target: ChatTarget | null) => void;
  onViewChange: (view: string) => void;
}

export default function MessagesView({
  session,
  activeConvo,
  chatTarget,
  onConvoChange,
  onChatTargetChange,
  onViewChange,
}: MessagesViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatImageFile, setChatImageFile] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSending, setReportSending] = useState(false);
  const [reportError, setReportError] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const chatImageInputRef = useRef<HTMLInputElement>(null);

  const fetchConversations = () => {
    if (!session) { setConversations([]); return; }
    fetch('/api/conversations')
      .then(r => r.json())
      .then(data => setConversations(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  useEffect(() => { fetchConversations(); }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load messages when a conversation is opened
  useEffect(() => {
    setChatImageFile(null);
    setChatImagePreview(null);
    if (!activeConvo) { setMessages([]); return; }
    fetch(`/api/conversations/${activeConvo.id}/messages`)
      .then(r => r.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [activeConvo]);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Real-time: subscribe to new messages from the OTHER person only
  useEffect(() => {
    if (!activeConvo || !session) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${activeConvo.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeConvo.id}` },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          if (row.sender_id === session.userId) return;
          setMessages(prev => {
            if (prev.some(m => m.id === row.id)) return prev;
            return [...prev, {
              id:             row.id as string,
              conversationId: row.conversation_id as string,
              senderId:       row.sender_id as string,
              senderName:     row.sender_name as string,
              content:        row.content as string,
              imageUrl:       (row.image_url as string | null) ?? null,
              createdAt:      new Date(row.created_at as string).getTime(),
            }];
          });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo, session]);

  async function uploadChatImage(file: File): Promise<string> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to upload image');
    }
    const { url } = await res.json();
    return url as string;
  }

  async function sendMessage(content: string, imageUrl?: string | null, targetConvo?: Conversation) {
    const convo = targetConvo ?? activeConvo;
    if ((!content.trim() && !imageUrl) || chatSending) return;

    const text = content.trim();
    const optimisticId = `opt-${Date.now()}`;
    const optimistic: Message = {
      id:             optimisticId,
      conversationId: convo?.id ?? '',
      senderId:       session?.userId ?? '',
      senderName:     session?.displayName ?? '',
      content:        text,
      imageUrl:       imageUrl ?? null,
      createdAt:      Date.now(),
    };

    setChatInput('');
    setChatError(null);
    if (convo) setMessages(prev => [...prev, optimistic]);
    setChatSending(true);

    try {
      if (convo) {
        const res = await fetch(`/api/conversations/${convo.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: text, imageUrl }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setMessages(prev => prev.filter(m => m.id !== optimisticId));
          throw new Error(body.error || `Error ${res.status}`);
        }
        const real = await res.json();
        setMessages(prev => prev.map(m => m.id === optimisticId ? real : m));
        fetchConversations();
      } else if (chatTarget) {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetUserId:   chatTarget.userId,
            targetUserName: chatTarget.userName,
            itemId:         chatTarget.itemId,
            itemTitle:      chatTarget.itemTitle,
            itemImg:        chatTarget.itemImg,
            message:        text,
            imageUrl,
          }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Error ${res.status}`);
        }
        const { conversationId } = await res.json();
        const convosRes = await fetch('/api/conversations');
        const convos: Conversation[] = await convosRes.json();
        setConversations(Array.isArray(convos) ? convos : []);
        const created = convos.find(c => c.id === conversationId) ?? null;
        const msgsRes = await fetch(`/api/conversations/${conversationId}/messages`);
        const msgs: Message[] = await msgsRes.json();
        setMessages(Array.isArray(msgs) ? msgs : []);
        onConvoChange(created);
        onChatTargetChange(null);
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Failed to send. Try again.');
    } finally {
      setChatSending(false);
    }
  }

  async function handleReport(e: React.FormEvent) {
    e.preventDefault();
    if (!reportReason.trim()) return;
    const otherUserId = activeConvo?.otherUserId ?? chatTarget?.userId;
    const itemId = activeConvo?.itemId ?? chatTarget?.itemId;
    if (!otherUserId) return;
    setReportSending(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportedUserId: otherUserId, reason: reportReason, itemId }),
      });
      if (!res.ok) throw new Error('Failed to send report');
      setShowReportModal(false);
      setReportReason('');
    } catch {
      setReportError('Failed to send report. Please try again.');
    } finally {
      setReportSending(false);
    }
  }

  return (
    <main className="content" id="view-messages" style={{ paddingTop: 0, paddingLeft: 0, paddingRight: 0, maxWidth: '100%', gap: 0 }}>

      {/* ── Chat view (conversation open) ── */}
      {(activeConvo || chatTarget) ? (
        <div className={styles['chat-view']}>
          <div className={styles['chat-header']}>
            <button
              className={styles['back-btn']}
              onClick={() => { onConvoChange(null); onChatTargetChange(null); }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5" /><path d="m12 19-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className={styles['chat-header-center']}>
              <p className={styles['chat-other-name']}>{activeConvo?.otherUserName ?? chatTarget?.userName}</p>
              {(activeConvo?.itemTitle ?? chatTarget?.itemTitle) && (
                <p className={styles['chat-item-context']}>re: {activeConvo?.itemTitle ?? chatTarget?.itemTitle}</p>
              )}
            </div>
            <div className={styles['chat-header-right']}>
              <div className={styles['chat-avatar']} aria-hidden="true">
                {(activeConvo?.otherUserName ?? chatTarget?.userName ?? '?').charAt(0).toUpperCase()}
              </div>
              <button
                className={styles['chat-report-btn']}
                aria-label="Report user"
                title="Report user"
                onClick={() => { setReportReason(''); setShowReportModal(true); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Report modal */}
          {showReportModal && (
            <div className={styles['report-modal-overlay']} onClick={() => { setShowReportModal(false); setReportError(''); }}>
              <div className={styles['report-modal']} onClick={e => e.stopPropagation()}>
                <h3 className={styles['report-modal-title']}>Report User</h3>
                <form onSubmit={handleReport}>
                  <label className="settings-label" htmlFor="report-reason">Reason</label>
                  <textarea
                    id="report-reason"
                    className={styles['report-reason-input']}
                    value={reportReason}
                    onChange={e => setReportReason(e.target.value)}
                    placeholder="Describe the issue…"
                    rows={3}
                    required
                  />
                  {reportError && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 8 }}>{reportError}</p>}
                  <div className={styles['report-modal-actions']}>
                    <button type="button" className={styles['report-cancel-btn']} onClick={() => { setShowReportModal(false); setReportError(''); }}>Cancel</button>
                    <button type="submit" className={styles['report-submit-btn']} disabled={reportSending || !reportReason.trim()}>
                      {reportSending ? 'Sending…' : 'Submit Report'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className={styles['chat-messages']} role="log" aria-live="polite" aria-label="Chat messages">
            {messages.length === 0 && !chatTarget && (
              <div className={styles['chat-empty']}>Start of your conversation</div>
            )}
            {messages.length === 0 && chatTarget && (
              <div className={styles['chat-empty']}>Say hi to {chatTarget.userName}!</div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === session?.userId;
              return (
                <div key={msg.id} className={`${styles['chat-message']}${isMine ? ` ${styles.sent}` : ` ${styles.recv}`}`}>
                  {!isMine && (
                    <div className={styles['chat-msg-avatar']} aria-hidden="true">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles['chat-msg-body']}>
                    <div className={`${styles['chat-bubble']}${msg.imageUrl ? ` ${styles['has-image']}` : ''}`}>
                      {msg.imageUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={msg.imageUrl} alt="Image" className={styles['chat-msg-image']} onClick={() => setLightboxUrl(msg.imageUrl!)} />
                      )}
                      {msg.content && <span className={msg.imageUrl ? styles['chat-msg-caption'] : ''}>{msg.content}</span>}
                    </div>
                    <span className={styles['chat-time']}>{timeAgo(msg.createdAt)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>

          {chatError && (
            <p style={{ color: '#e8473f', fontSize: 12, textAlign: 'center', padding: '6px 16px', background: 'rgba(232,71,63,0.06)', borderTop: '1px solid rgba(232,71,63,0.15)' }}>
              {chatError}
            </p>
          )}
          <div className={styles['chat-input-wrapper']}>
            {chatImagePreview && (
              <div className={styles['chat-image-preview-area']}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={chatImagePreview} alt="Attachment preview" className={styles['chat-image-preview']} />
                <button
                  type="button"
                  className={styles['chat-image-preview-remove']}
                  onClick={() => { setChatImageFile(null); setChatImagePreview(null); }}
                  aria-label="Remove image"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}
            <form
              className={styles['chat-input-area']}
              onSubmit={async (e) => {
                e.preventDefault();
                if (chatSending) return;
                if (!chatInput.trim() && !chatImageFile) return;
                let imageUrl: string | null = null;
                if (chatImageFile) {
                  setChatSending(true);
                  try {
                    imageUrl = await uploadChatImage(chatImageFile);
                  } catch (err) {
                    setChatError(err instanceof Error ? err.message : 'Failed to upload image');
                    setChatSending(false);
                    return;
                  }
                  setChatImageFile(null);
                  setChatImagePreview(null);
                  setChatSending(false);
                }
                sendMessage(chatInput, imageUrl);
              }}
            >
              <input
                ref={chatImageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setChatImageFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setChatImagePreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                className={styles['chat-attach-btn']}
                onClick={() => chatImageInputRef.current?.click()}
                aria-label="Attach image"
                title="Attach image"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" aria-hidden="true">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <input
                className={styles['chat-input']}
                type="text"
                placeholder="Type a message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                autoComplete="off"
                onPaste={(e) => {
                  const imageItem = Array.from(e.clipboardData.items).find(item => item.type.startsWith('image/'));
                  if (!imageItem) return;
                  const file = imageItem.getAsFile();
                  if (!file) return;
                  e.preventDefault();
                  setChatImageFile(file);
                  const reader = new FileReader();
                  reader.onload = (ev) => setChatImagePreview(ev.target?.result as string);
                  reader.readAsDataURL(file);
                }}
              />
              <button
                className={styles['chat-send-btn']}
                type="submit"
                disabled={(!chatInput.trim() && !chatImageFile) || chatSending}
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>

          {/* ── Lightbox ── (classes remain global) */}
          {lightboxUrl && (
            <div className="lightbox-overlay" onClick={() => setLightboxUrl(null)} role="dialog" aria-modal="true" aria-label="Image preview">
              <button className="lightbox-close" onClick={() => setLightboxUrl(null)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="20" height="20" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxUrl} alt="Full size" className="lightbox-img" onClick={e => e.stopPropagation()} />
            </div>
          )}
        </div>

      ) : (
        /* ── Conversation list ── */
        <div className={styles['inbox-wrap']}>
          <div className={styles['inbox-header']}>
            <div className={styles['inbox-title-row']}>
              <h1 className={styles['inbox-title']}>Inbox</h1>
              {conversations.length > 0 && (
                <span className={styles['inbox-badge']}>{conversations.length}</span>
              )}
            </div>
            <div className={styles['inbox-arrow']} aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            </div>
          </div>

          {conversations.length === 0 ? (
            <div className="empty-state" style={{ marginTop: 60 }}>
              <div className="empty-state-icon">💬</div>
              <p className="empty-state-text">No messages yet.</p>
              <p className="empty-state-sub">Go to a match and tap &ldquo;Message&rdquo; to start a conversation.</p>
              <button className="btn-primary" style={{ marginTop: 20, display: 'inline-flex' }} onClick={() => onViewChange('matches')}>
                View Matches
              </button>
            </div>
          ) : (
            <div className={styles['conversations-list']} role="list">
              {conversations.map((convo) => {
                const isRecent = convo.lastMessageAt ? (Date.now() - convo.lastMessageAt) < 30 * 60 * 1000 : false;
                return (
                  <button
                    key={convo.id}
                    className={styles['conversation-item']}
                    role="listitem"
                    onClick={() => { onConvoChange(convo); onChatTargetChange(null); }}
                  >
                    <div className={styles['conversation-avatar']} aria-hidden="true">
                      {convo.otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles['conversation-info']}>
                      <span className={styles['convo-status-label']}>{isRecent ? 'Active chat' : 'Chat'}</span>
                      <div className={styles['conversation-row']}>
                        <span className={styles['conversation-name']}>{convo.otherUserName}</span>
                        {convo.lastMessageAt && (
                          <span className={styles['conversation-time']}>{timeAgo(convo.lastMessageAt)}</span>
                        )}
                      </div>
                      {convo.lastMessage && (
                        <p className={styles['conversation-last']}>{convo.lastMessage}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
