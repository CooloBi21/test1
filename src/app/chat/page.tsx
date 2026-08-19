'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useChat } from '@/context/ChatContext';
import { getConversations, getMessages, markAsRead } from '@/api/chatApi';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import styles from './chat.module.css';

export default function ChatPage() {
  const { user } = useAuth();
  const { socket, refreshUnread } = useChat();

  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Tải danh sách cuộc trò chuyện
  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConv) {
        selectConversation(data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadConversations();
    }
  }, [user?.id]);

  // 2. Tải tin nhắn của cuộc hội thoại đang chọn
  const selectConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const msgs = await getMessages(conv.id);
      setMessages(msgs);
      await markAsRead(conv.id);
      refreshUnread();
    } catch (err) {
      console.error(err);
    }
  };

  // 3. Lắng nghe tin nhắn real-time từ Socket
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (activeConv && msg.conversation_id === activeConv.id) {
        setMessages((prev) => [...prev, msg]);
        markAsRead(activeConv.id);
        refreshUnread();
      }
      loadConversations();
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [socket, activeConv]);

  // Tự động cuộn xuống cuối khung chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Gửi tin nhắn
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv || !user || !socket) return;

    const recipientId =
      activeConv.user_1_id === user.id ? activeConv.user_2_id : activeConv.user_1_id;

    socket.emit('sendMessage', {
      conversationId: activeConv.id,
      senderId: user.id,
      recipientId: recipientId,
      text: inputText,
    });

    setInputText('');
  };

  if (!user) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Vui lòng đăng nhập để sử dụng tính năng Chat!</div>;
  }

  return (
    <div className={styles.chatContainer}>
      {/* CỘT TRÁI: DANH SÁCH CUỘC TRÒ CHUYỆN */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.homeButton}>
            <ArrowLeft size={18} />
          </Link>
          <span>Hộp thoại tin nhắn</span>
        </div>
        <div className={styles.conversationList}>
          {conversations.map((conv) => {
            const partner = conv.user_1_id === user.id ? conv.user2 : conv.user1;
            const isSelected = activeConv?.id === conv.id;

            return (
              <div
                key={conv.id}
                className={`${styles.convItem} ${isSelected ? styles.selectedConv : ''}`}
                onClick={() => selectConversation(conv)}
              >
                <div className={styles.avatar}>
                  {partner?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.convInfo}>
                  <div className={styles.partnerName}>{partner?.full_name || 'Người dùng'}</div>
                  {conv.room && <div className={styles.roomTag}>Phòng: {conv.room.title}</div>}
                  <div className={styles.lastMsg}>
                    {conv.messages[0]?.text || 'Chưa có tin nhắn'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CỘT PHẢI: KHUNG TRÒ CHUYỆN */}
      <div className={styles.chatBox}>
        {activeConv ? (
          <>
            <div className={styles.chatHeader}>
              <strong>
                {activeConv.user_1_id === user.id
                  ? activeConv.user2?.full_name
                  : activeConv.user1?.full_name}
              </strong>
            </div>

            <div className={styles.messageList}>
              {messages.map((msg) => {
                const isMe = msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`${styles.msgRow} ${isMe ? styles.myMsgRow : styles.otherMsgRow}`}>
                    <div className={`${styles.bubble} ${isMe ? styles.myBubble : styles.otherBubble}`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className={styles.inputArea}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className={styles.input}
              />
              <button type="submit" className={styles.sendBtn}>Gửi</button>
            </form>
          </>
        ) : (
          <div className={styles.noChat}>Hãy chọn một cuộc hội thoại để bắt đầu chat!</div>
        )}
      </div>
    </div>
  );
}
