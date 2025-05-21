import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { FiArrowLeft, FiUser, FiBell, FiGlobe, FiEye } from 'react-icons/fi';
import '../styles/Settings.css';

const Settings = ({ onBack }) => {
    const { user } = useAuth();
    const { language, changeLanguage, translations } = useLanguage();
    const [activeSection, setActiveSection] = useState('account');

    const handleLanguageChange = (e) => {
        changeLanguage(e.target.value);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'account':
                return (
                    <div className="settings-section">
                        <h3>{translations[language].accountInfo}</h3>
                        <div className="settings-group">
                            <label>{translations[language].username}</label>
                            <input type="text" defaultValue={user?.username} />
                            <p className="input-hint">{translations[language].usernameHint}</p>
                        </div>
                        <div className="settings-group">
                            <label>{translations[language].email}</label>
                            <input type="email" defaultValue={user?.email} />
                            <p className="input-hint">{translations[language].emailHint}</p>
                        </div>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="settings-section">
                        <h3>{translations[language].notifications}</h3>
                        <div className="settings-group">
                            <h4>{translations[language].emailNotifications}</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].newFollowers}</label>
                                    <p>{translations[language].newFollowersHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].mentions}</label>
                                    <p>{translations[language].mentionsHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].directMessages}</label>
                                    <p>{translations[language].directMessagesHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>{translations[language].pushNotifications}</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].activityAlerts}</label>
                                    <p>{translations[language].activityAlertsHint}</p>
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
                        <h3>{translations[language].accessibilityDisplay}</h3>
                        <div className="settings-group">
                            <h4>{translations[language].display}</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].darkMode}</label>
                                    <p>{translations[language].darkModeHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" defaultChecked />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].fontSize}</label>
                                    <p>{translations[language].fontSizeHint}</p>
                                </div>
                                <select defaultValue="medium">
                                    <option value="small">{translations[language].small}</option>
                                    <option value="medium">{translations[language].medium}</option>
                                    <option value="large">{translations[language].large}</option>
                                </select>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>{translations[language].accessibility}</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].highContrast}</label>
                                    <p>{translations[language].highContrastHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].reduceMotion}</label>
                                    <p>{translations[language].reduceMotionHint}</p>
                                </div>
                                <label className="toggle-switch">
                                    <input type="checkbox" />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>
                        <div className="settings-group">
                            <h4>{translations[language].language}</h4>
                            <div className="settings-option">
                                <div className="option-info">
                                    <label>{translations[language].displayLanguage}</label>
                                    <p>{translations[language].chooseLanguage}</p>
                                </div>
                                <select value={language} onChange={handleLanguageChange}>
                                    <option value="english">English</option>
                                    <option value="romanian">Romanian</option>
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
                <h2>{translations[language].settings}</h2>
            </div>

            <div className="settings-layout">
                <div className="settings-sidebar">
                    <div className="sidebar-header">
                        <h3>{translations[language].settings}</h3>
                    </div>
                    <button 
                        className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
                        onClick={() => setActiveSection('account')}
                    >
                        <FiUser className="nav-icon" /> {translations[language].account}
                    </button>
                    <button 
                        className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
                        onClick={() => setActiveSection('notifications')}
                    >
                        <FiBell className="nav-icon" /> {translations[language].notifications}
                    </button>
                    <button 
                        className={`settings-nav-item ${activeSection === 'accessibility' ? 'active' : ''}`}
                        onClick={() => setActiveSection('accessibility')}
                    >
                        <FiEye className="nav-icon" /> {translations[language].accessibility}
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