import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Save, Eye, EyeOff } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    organization: '',
    role: '',
  });
  const [settings, setSettings] = useState({
    apiToken: '',
    showToken: false,
    emailNotifications: true,
    autoRefresh: true,
    refreshInterval: 5,
    theme: 'light',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');

  const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Load user profile on mount
  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.full_name || '',
        email: user.email || '',
        organization: user.organization || '',
        role: user.role || '',
      });
    }
  }, [user]);

  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const generateNewApiToken = async () => {
    try {
      setLoading(true);
      const response = await api.post('/auth/generate-token');
      setSettings((prev) => ({
        ...prev,
        apiToken: response.data.token,
      }));
      showMessage('API token generated successfully');
    } catch (error) {
      showMessage('Failed to generate API token', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showMessage('Copied to clipboard!');
  };

  const updateSettings = async () => {
    try {
      setLoading(true);
      await api.put('/auth/settings', {
        emailNotifications: settings.emailNotifications,
        autoRefresh: settings.autoRefresh,
        refreshInterval: settings.refreshInterval,
        theme: settings.theme,
        timezone: settings.timezone,
      });
      showMessage('Settings updated successfully');
    } catch (error) {
      showMessage('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          <h1>Settings</h1>
        </div>
      </div>

      <div className="settings-content">
        {message && (
          <div className={`notification notification-${messageType}`}>
            {message}
          </div>
        )}

        {/* Profile Section */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <div className="section-content">
            <div className="setting-group">
              <label>Full Name</label>
              <input
                type="text"
                value={profile.fullName}
                disabled
                className="input-field disabled"
              />
              <small>This is your account name</small>
            </div>

            <div className="setting-group">
              <label>Email Address</label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="input-field disabled"
              />
              <small>Your primary email address</small>
            </div>

            <div className="setting-group">
              <label>Organization</label>
              <input
                type="text"
                value={profile.organization}
                disabled
                className="input-field disabled"
              />
              <small>Your organization name</small>
            </div>

            <div className="setting-group">
              <label>Role</label>
              <input
                type="text"
                value={profile.role.toUpperCase()}
                disabled
                className="input-field disabled"
              />
              <small>Your access level and permissions</small>
            </div>
          </div>
        </div>

        {/* API Token Section */}
        <div className="settings-section">
          <h2>API Access</h2>
          <div className="section-content">
            <div className="setting-group">
              <label>API Token</label>
              <div className="token-container">
                <input
                  type={settings.showToken ? 'text' : 'password'}
                  value={settings.apiToken || 'No token generated'}
                  disabled
                  className="input-field disabled"
                />
                <button
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      showToken: !prev.showToken,
                    }))
                  }
                  className="btn-icon"
                  title={settings.showToken ? 'Hide' : 'Show'}
                >
                  {settings.showToken ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
                {settings.apiToken && (
                  <button
                    onClick={() => copyToClipboard(settings.apiToken)}
                    className="btn btn-secondary btn-sm"
                  >
                    Copy
                  </button>
                )}
              </div>
              <small>Use this token for API authentication</small>
            </div>

            <div className="setting-group">
              <button
                onClick={generateNewApiToken}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Generating...' : 'Generate New Token'}
              </button>
              <small>
                Generating a new token will invalidate the previous one
              </small>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="settings-section">
          <h2>Notifications</h2>
          <div className="section-content">
            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      emailNotifications: e.target.checked,
                    }))
                  }
                />
                <span>Email Notifications</span>
              </label>
              <small>Receive email updates on workflow completion</small>
            </div>

            <div className="setting-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={settings.autoRefresh}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      autoRefresh: e.target.checked,
                    }))
                  }
                />
                <span>Auto-Refresh Logs</span>
              </label>
              <small>Automatically refresh workflow logs</small>
            </div>

            {settings.autoRefresh && (
              <div className="setting-group">
                <label>Refresh Interval (seconds)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      refreshInterval: parseInt(e.target.value),
                    }))
                  }
                  className="input-field"
                />
                <small>How often to check for new logs</small>
              </div>
            )}
          </div>
        </div>

        {/* Appearance Section */}
        <div className="settings-section">
          <h2>Appearance</h2>
          <div className="section-content">
            <div className="setting-group">
              <label>Theme</label>
              <select
                value={settings.theme}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    theme: e.target.value,
                  }))
                }
                className="select-field"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
              <small>Choose your preferred color scheme</small>
            </div>

            <div className="setting-group">
              <label>Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    timezone: e.target.value,
                  }))
                }
                className="select-field"
              >
                <option value="UTC">UTC</option>
                <option value="EST">Eastern (EST)</option>
                <option value="CST">Central (CST)</option>
                <option value="MST">Mountain (MST)</option>
                <option value="PST">Pacific (PST)</option>
                <option value="GMT">GMT</option>
                <option value="IST">Indian (IST)</option>
              </select>
              <small>Select your timezone for timestamp display</small>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="settings-footer">
          <button
            onClick={updateSettings}
            disabled={loading}
            className="btn btn-success btn-lg"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
