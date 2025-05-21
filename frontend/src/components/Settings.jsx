import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiArrowLeft, FiUser, FiBell, FiGlobe, FiEye } from 'react-icons/fi';
import '../styles/Settings.css';

const Settings = ({ onBack }) => {
    const { user } = useAuth();
    const [activeSection, setActiveSection] = useState('account');

    const renderSection = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="settings-section">
                        <h3>Account information</h3>
                        <div className="settings-group">
                            <label>Username</label>
                            <input type="text" defaultValue={user?.username} />
                            <p className="input-hint">This is your unique identifier</p>
                        </div>
                        <div className="settings-group">
                            <label>Email</label>
                            <input type="email" defaultValue={user?.email} />
                            <p className="input-hint">Used for account recovery and notifications</p>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-section">
                        <h3>Notifications</h3>
                        <div className="settings-group">
                            <h4>Email notifications</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>New followers</label>
                                    <p>Get notified when someone follows you</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Mentions</label>
                                    <p>Get notified when someone mentions you</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Direct messages</label>
                                    <p>Get notified when you receive a message</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>Push notifications</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Activity alerts</label>
                                    <p>Receive push notifications for account activity</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                );
            case 'accessibility':
                return (
                    <div className="settings-section">
                        <h3>Accessibility, display and languages</h3>
                        <div className="settings-group">
                            <h4>Display</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Dark mode</label>
                                    <p>Switch between light and dark themes</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Font size</label>
                                    <p>Adjust the size of text throughout the app</p>
                                </div>
                                <select defaultValue="medium">
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>Accessibility</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>High contrast mode</label>
                                    <p>Increase contrast for better visibility</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Reduce motion</label>
                                    <p>Minimize animations throughout the app</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>Language</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>Display language</label>
                                    <p>Choose your preferred language</p>
                                </div>
                                <select defaultValue="english">
                                    <option value="english">English</option>
                                    <option value="romanian">Romanian</option>
                                    <option value="spanish">Spanish</option>
                                    <option value="french">French</option>
                                    <option value="german">German</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-header">
                <button className="back-button" onClick={onBack}>
                    <FiArrowLeft />
                </button>
                <h2>Settings</h2>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <div className="sidebar-header">
                        <h3>Settings</h3>
                    </div>
                    <button 
                        className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveSection('account')}
                    >
                        <FiUser className="nav-icon" /> Account
                    </button>
                    <button 
                        className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSection('notifications')}
                    >
                        <FiBell className="nav-icon" /> Notifications
                    </button>
                    <button 
                        className={`settings-nav-item ${activeSection === 'accessibility' ? 'active' : ''}`}
                        onClick={() => setActiveSection('accessibility')}
                    >
                        <FiEye className="nav-icon" /> Accessibility
                    </button>
                </div>

                <div className="settings-content">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
};

export default Settings;