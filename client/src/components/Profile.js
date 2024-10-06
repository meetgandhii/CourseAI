import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { updateProfile, updatePreferences } from '../services/api';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [fullName, setFullName] = useState(user.fullName);
  const [theme, setTheme] = useState(user.preferences?.theme);
  const [language, setLanguage] = useState(user.preferences?.language);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updateProfile({ fullName });
      setUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed:', error);
      toast.error('Profile update failed. Please try again.');
    }
  };

  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = await updatePreferences({ theme, language });
      setUser(updatedUser);
      toast.success('Preferences updated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Preferences update failed:', error);
      toast.error('Preferences update failed. Please try again.');
    }
  };

  return (
    <div className="profile">
      <header>
        <Link to="/">Back to Chat</Link>
        <h2>Profile</h2>
      </header>
      <form onSubmit={handleUpdateProfile}>
        <h3>Personal Information</h3>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full Name"
        />
        <button type="submit">Update Profile</button>
      </form>
      <form onSubmit={handleUpdatePreferences}>
        <h3>Preferences</h3>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light Theme</option>
          <option value="dark">Dark Theme</option>
        </select>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
        <button type="submit">Update Preferences</button>
      </form>
    </div>
  );
};

export default Profile;