import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, LogOut, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { getConversations, createConversation } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './ChatInterface.css';

const ChatInterface = ({ user }) => {
  const [input, setInput] = useState('');
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    getConversations()
      .then(response => {
        if (response && response.data && Array.isArray(response.data)) {
          setConversations(response.data);
        } else {
          console.error('Unexpected response structure:', response);
          toast.error('Unexpected data structure received from the server.');
        }
      })
      .catch(error => {
        console.error('Error fetching conversations:', error);
        toast.error('Failed to fetch conversations. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCreateConversation = () => {
    if (input.trim()) {
      createConversation(input)
        .then((response) => {
          if (response && response.data) {
            setConversations(prevConversations => [response.data, ...prevConversations]);
            setInput('');
            navigate(`/conversation/${response.data._id}`);
          } else {
            console.error('Unexpected response structure:', response);
            toast.error('Failed to create conversation. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error creating conversation:', error);
          toast.error('Failed to create conversation. Please try again.');
        });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (isLoading) {
    return <div>Loading conversations...</div>;
  }

  return (
    <div className="chat-interface">
      <header>
      <img src="/images/logo.svg" alt="Company Logo" />
        <nav>
          <Link to="/profile"><User className='nav-icons' size={24} /></Link>
          <LogOut size={24} className='nav-icons' onClick={handleLogout} />
        </nav>
      </header>
      <h2 className='welcome-message'>Welcome, {user.fullName}</h2>
      <div style={{width: "100%"}}>
        <input style={{width: "90%"}}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleCreateConversation()}
          placeholder="Enter the topic you want to learn (e.g. Python)"
        />
        <button onClick={handleCreateConversation} style={{width: "10%"}}>Enter</button>
      </div>
      <div className="quick-actions">
        <button onClick={() => setInput("Python")}>Learn Python</button>
        <button onClick={() => setInput("R Programming")}>R Programming</button>
        <button onClick={() => setInput("Java")}>Java Basics</button>
      </div>
      <h3>Your Courses</h3>
      <div className="conversations">
        {conversations.map(conversation => (
          <Link to={`/conversation/${conversation._id}`} key={conversation._id} className="conversation-item">
          <div className="conversation-icon">
            <FileText size={24} />
          </div>
          <div className="conversation-content">
            <h4>{conversation.title}</h4>
            <p>{new Date(conversation.updatedAt).toLocaleString()}</p>
          </div>
        </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatInterface;