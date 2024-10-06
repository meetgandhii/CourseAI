import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './components/Login';
import Register from './components/Register';
import ChatInterface from './components/ChatInterface';
import Conversation from './components/Conversation';
import Profile from './components/Profile';
import { getProfile } from './services/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(response => setUser(response.data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          <Route path="/" element={user ? <ChatInterface user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <Login setUser={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register setUser={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/conversation/:id" element={user ? <Conversation user={user} /> : <Navigate to="/login" replace />} />
          <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;