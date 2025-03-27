import React, { useEffect, useRef } from 'react';

const DoctorChat = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-messages">
      {messages.map((message, index) => (
        <div key={index} className={`message ${message.sender} ${message.isTyping ? 'typing' : ''}`}>
          <div className="message-avatar">
            {message.sender === 'doctor' ? (
              <img src="https://i.imgur.com/KbYnOGt.png" alt="Doctor" className="avatar doctor-avatar" />
            ) : (
              <img src="/user-avatar.png" alt="User" className="avatar user-avatar" onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://i.imgur.com/q8RU0Ic.png"; // Fallback avatar
              }} />
            )}
          </div>
          <div className="message-bubble">
            <div className="message-content">
              {message.isTyping ? (
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : (
                message.text
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default DoctorChat; 