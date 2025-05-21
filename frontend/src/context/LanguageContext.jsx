import React, { createContext, useContext, useState } from 'react';

export const LanguageContext = createContext();

export const translations = {
    english: {
        home: 'Home',
        profile: 'Profile',
        settings: 'Settings',
        notifications: 'Notifications',
        messages: 'Messages',
        bookmarks: 'Bookmarks',
        lists: 'Lists',
        post: 'Post',
        logout: 'Logout',
        adminPanel: 'Admin',
        forYou: 'For You',
        following: 'Following',
        followers: 'Followers',
        account: 'Account',
        displayLanguage: 'Display language',
        chooseLanguage: 'Choose your preferred language',
        // Search related translations
        search: 'Search',
        searchPlaceholder: 'Search for users or posts...',
        searchResults: 'Search Results',
        noResults: 'No results found',
        back: 'Back',
        users: 'Users',
        posts: 'Posts',
        comments: 'Comments',
        likes: 'Likes',
        edit: 'Edit',
        delete: 'Delete',
        like: 'Like',
        comment: 'Comment',
        save: 'Save',
        cancel: 'Cancel',
        confirmDelete: 'Confirm Delete',
        deleteConfirmation: 'Are you sure you want to delete this post? This action cannot be undone.',
        cancelDelete: 'Cancel',
        confirmDeleteButton: 'Delete',
        loading: 'Loading...',
        searching: 'Searching...',
        // Settings translations
        accountInfo: 'Account information',
        username: 'Username',
        usernameHint: 'This is your unique identifier',
        email: 'Email',
        emailHint: 'Used for account recovery and notifications',
        accessibility: 'Accessibility',
        accessibilityDisplay: 'Accessibility, display and languages',
        display: 'Display',
        darkMode: 'Dark mode',
        darkModeHint: 'Switch between light and dark themes',
        fontSize: 'Font size',
        fontSizeHint: 'Adjust the size of text throughout the app',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        highContrast: 'High contrast mode',
        highContrastHint: 'Increase contrast for better visibility',
        reduceMotion: 'Reduce motion',
        reduceMotionHint: 'Minimize animations throughout the app',
        language: 'Language',
        emailNotifications: 'Email notifications',
        newFollowers: 'New followers',
        newFollowersHint: 'Get notified when someone follows you',
        mentions: 'Mentions',
        mentionsHint: 'Get notified when someone mentions you',
        directMessages: 'Direct messages',
        directMessagesHint: 'Get notified when you receive a message',
        pushNotifications: 'Push notifications',
        activityAlerts: 'Activity alerts',
        activityAlertsHint: 'Receive push notifications for account activity',
        // Create Post Modal translations
        createPost: 'Create Post',
        writeSomething: 'Write something...',
        addImage: 'Add Image',
        addVideo: 'Add Video',
        postPrivacy: 'Post Privacy',
        public: 'Public',
        private: 'Private',
        onlyFollowers: 'Only Followers',
        createPostButton: 'Post',
        cancelPost: 'Cancel',
        imageUploadError: 'Error uploading image',
        videoUploadError: 'Error uploading video',
        maxFileSize: 'Maximum file size: 5MB',
        allowedFormats: 'Allowed formats: JPG, PNG, GIF, MP4',
        // Admin Panel translations
        userManagement: 'User Management',
        searchUsers: 'Search users by username or email...',
        exportData: 'Export Data',
        reports: 'Reports',
        settingsComingSoon: 'Settings panel coming soon...',
        reportsComingSoon: 'Reports panel coming soon...',
        // User Profile translations
        editProfile: 'Edit Profile',
        following: 'Following',
        follow: 'Follow',
        posts: 'Posts',
        replies: 'Replies',
        media: 'Media',
        loadingPosts: 'Loading posts...',
        comment: 'Comment',
        like: 'Like',
        edit: 'Edit',
        delete: 'Delete',
        save: 'Save',
        cancel: 'Cancel',
        confirmDelete: 'Confirm Delete',
        deleteConfirmation: 'Are you sure you want to delete this post? This action cannot be undone.',
        changePhoto: 'Change Photo',
        tellUsAboutYourself: 'Tell us about yourself...',
        saving: 'Saving...',
        saveChanges: 'Save Changes',
        // Add more translations as needed
    },
    romanian: {
        home: 'Acasă',
        profile: 'Profil',
        settings: 'Setări',
        notifications: 'Notificări',
        messages: 'Mesaje',
        bookmarks: 'Salvate',
        lists: 'Liste',
        post: 'Postare',
        logout: 'Deconectare',
        adminPanel: 'Admin',
        forYou: 'Pentru tine',
        following: 'Urmărești',
        followers: 'Urmăritori',
        account: 'Cont',
        displayLanguage: 'Limba de afișare',
        chooseLanguage: 'Alege limba preferată',
        // Search related translations
        search: 'Caută',
        searchPlaceholder: 'Caută...',
        searchResults: 'Rezultate Căutare',
        noResults: 'Nu s-au găsit rezultate',
        back: 'Înapoi',
        users: 'Utilizator',
        posts: 'Postări',
        comments: 'Comentarii',
        likes: 'Aprecieri',
        edit: 'Editează',
        delete: 'Șterge',
        like: 'Apreciază',
        comment: 'Comentează',
        save: 'Salvează',
        cancel: 'Anulează',
        confirmDelete: 'Confirmă Ștergerea',
        deleteConfirmation: 'Sigur doriți să ștergeți această postare? Această acțiune nu poate fi anulată.',
        cancelDelete: 'Anulează',
        confirmDeleteButton: 'Șterge',
        loading: 'Se încarcă...',
        searching: 'Se caută...',
        // Settings translations
        accountInfo: 'Informații cont',
        username: 'Nume utilizator',
        usernameHint: 'Acesta este identificatorul tău unic',
        email: 'Email',
        emailHint: 'Folosit pentru recuperarea contului și notificări',
        accessibility: 'Accesibilitate',
        accessibilityDisplay: 'Accesibilitate, afișare și limbi',
        display: 'Afișare',
        darkMode: 'Mod întunecat',
        darkModeHint: 'Comută între teme luminoase și întunecate',
        fontSize: 'Dimensiune font',
        fontSizeHint: 'Ajustează dimensiunea textului în aplicație',
        small: 'Mic',
        medium: 'Mediu',
        large: 'Mare',
        highContrast: 'Mod contrast ridicat',
        highContrastHint: 'Crește contrastul pentru o vizibilitate mai bună',
        reduceMotion: 'Reduce mișcarea',
        reduceMotionHint: 'Minimizează animațiile din aplicație',
        language: 'Limbă',
        emailNotifications: 'Notificări email',
        newFollowers: 'Urmăritori noi',
        newFollowersHint: 'Primești notificări când cineva te urmărește',
        mentions: 'Menționări',
        mentionsHint: 'Primești notificări când cineva te menționează',
        directMessages: 'Mesaje directe',
        directMessagesHint: 'Primești notificări când primești un mesaj',
        pushNotifications: 'Notificări push',
        activityAlerts: 'Alerte activitate',
        activityAlertsHint: 'Primești notificări push pentru activitatea contului',
        // Create Post Modal translations
        createPost: 'Creează Postare',
        writeSomething: 'Scrie ceva...',
        addImage: 'Adaugă Imagine',
        addVideo: 'Adaugă Video',
        postPrivacy: 'Confidențialitate Postare',
        public: 'Public',
        private: 'Privat',
        onlyFollowers: 'Doar Urmăritori',
        createPostButton: 'Postează',
        cancelPost: 'Anulează',
        imageUploadError: 'Eroare la încărcarea imaginii',
        videoUploadError: 'Eroare la încărcarea videoului',
        maxFileSize: 'Dimensiune maximă fișier: 5MB',
        allowedFormats: 'Formate permise: JPG, PNG, GIF, MP4',
        // Admin Panel translations
        userManagement: 'Gestionare Utilizatori',
        searchUsers: 'Caută utilizatori după nume sau email...',
        exportData: 'Exportă Date',
        reports: 'Rapoarte',
        settingsComingSoon: 'Panoul de setări va fi disponibil în curând...',
        reportsComingSoon: 'Panoul de rapoarte va fi disponibil în curând...',
        // User Profile translations
        editProfile: 'Editează Profilul',
        following: 'Urmărești',
        follow: 'Urmărește',
        posts: 'Postări',
        replies: 'Răspunsuri',
        media: 'Media',
        loadingPosts: 'Se încarcă postările...',
        comment: 'Comentează',
        like: 'Apreciază',
        edit: 'Editează',
        delete: 'Șterge',
        save: 'Salvează',
        cancel: 'Anulează',
        confirmDelete: 'Confirmă Ștergerea',
        deleteConfirmation: 'Sigur doriți să ștergeți această postare? Această acțiune nu poate fi anulată.',
        changePhoto: 'Schimbă Fotografia',
        tellUsAboutYourself: 'Spune-ne despre tine...',
        saving: 'Se salvează...',
        saveChanges: 'Salvează Modificările',
        // Add more translations as needed
    }
};

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('english');

    const changeLanguage = (newLanguage) => {
        setLanguage(newLanguage);
        localStorage.setItem('language', newLanguage);
    };

    // Load saved language preference on initial render
    React.useEffect(() => {
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }
    }, []);

    const value = {
        language,
        changeLanguage,
        translations
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}; 