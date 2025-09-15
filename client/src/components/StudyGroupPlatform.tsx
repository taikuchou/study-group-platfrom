import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Calendar, BookOpen, MessageSquare, Link, FileText, 
  Heart, Lightbulb, Plus, Edit, Trash2, Search, Filter,
  ChevronDown, ChevronRight, Shield, User as UserIcon, Globe, Info, LogOut, Settings
} from 'lucide-react';
  import type { User, Topic, Interaction } from '../types';
  // import { mockUsers, mockTopics, mockInteractions } from '../data/mockData';
import TopicList from './TopicList';
import SessionDetail from './SessionDetail';
// import UserManagement from './UserManagement';
import { UserManagement, UserForm, useUsers } from '../features/users';
import { InteractionForm } from '../features/interactions/components/InteractionForm';
// import { SessionDetail, SessionForm, useSessions } from '../features/sessions';
import { useData } from '../context/DataContext';
import { useLanguage, useTranslation } from '../context/LanguageContext';
import { Language, languageNames } from '../locales';
import { AuthForm } from './AuthForm';
import { ProfileUpdate } from './ProfileUpdate';

// Version information
const VERSION = '1.1.0';
const BUILD_DATE = '2025-09-12';

const StudyGroupPlatform = () => {
  // 模擬數據狀態
  // const [currentUser, setCurrentUser] = useState({
  //   id: 1,
  //   name: "Alice Chen",
  //   email: "alice@example.com",
  //   role: "admin",
  //   createdAt: "2024-01-15",
  // });
  const [activeTab, setActiveTab] = useState('topics');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [editingTopic, setEditingTopic] = useState(null);
  const [currentTopicForSession, setCurrentTopicForSession] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingInteraction, setEditingInteraction] = useState(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);
  const [showVersionInfo, setShowVersionInfo] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [interactionModal, setInteractionModal] = useState({ open: false, type: null, editing: null });

  // 模擬數據
  const { currentUser, setCurrentUser, users, topics, interactions, loading, error, reload, createTopic, updateTopic, deleteTopic, createSession, updateSession, deleteSession, createInteraction, updateInteraction, deleteInteraction, source, setSource, isAuthenticated, profileIncomplete, login, logout, completeProfile } = useData();

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  // 用戶管理 (feature-based)
  const { createUser, updateUser, deleteUser } = useUsers();
  
  // 場次管理 (feature-based) - 暫時註解
  // const { createSession, updateSession } = useSessions();
  
  // 語言
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  // 點擊外部關閉下拉選單
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLanguageSwitcher && !event.target.closest('.language-switcher')) {
        setShowLanguageSwitcher(false);
      }
      if (showVersionInfo && !event.target.closest('.version-info')) {
        setShowVersionInfo(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLanguageSwitcher, showVersionInfo]);

  // const [users] = useState<User[]>(mockUsers);
  // const [topics, setTopics] = useState<Topic[]>(mockTopics);
  // const [interactions, setInteractions] = useState<Interaction[]>(mockInteractions);

  // 篩選邏輯
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return topics;
    return topics.filter(topic => 
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase())) ||
      topic.outline.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  // 獲取使用者名稱
  const getUserName = (userId) => {
    console.log('[getUserName] userId:', userId, 'type:', typeof userId);
    console.log('[getUserName] currentUser:', currentUser);
    console.log('[getUserName] users array length:', users.length);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log('[getUserName] Found user:', user.name);
      return user.name;
    }
    
    // If we can't find the user in the users list (due to permissions)
    // but it's the current user, return current user's name
    console.log('[getUserName] Checking if current user - userId:', userId, 'currentUser.id:', currentUser?.id);
    // Use loose equality to handle potential type differences between string/number
    if ((userId == currentUser?.id || userId === currentUser?.id) && currentUser?.name) {
      console.log('[getUserName] Returning current user name:', currentUser.name);
      return currentUser.name;
    }
    
    console.log('[getUserName] Returning Unknown User');
    return 'Unknown User';
  };

  // 獲取特定 session 的互動內容
  const getSessionInteractions = (sessionId) => {
    return interactions.filter(item => item.sessionId === sessionId);
  };

  // 互動類型圖標和標籤
  const getInteractionIcon = (type) => {
    const icons = {
      question: <MessageSquare className="w-4 h-4" />,
      noteLink: <Link className="w-4 h-4" />,
      reference: <FileText className="w-4 h-4" />,
      speakerFeedback: <Heart className="w-4 h-4" />,
      weeklyInsight: <Lightbulb className="w-4 h-4" />,
      outlineSuggestion: <Edit className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getInteractionLabel = (type) => {
    const labels = {
      question: t('interaction.question'),
      noteLink: t('interaction.noteLink'),
      reference: t('interaction.reference'),
      speakerFeedback: t('interaction.speakerFeedback'),
      weeklyInsight: t('interaction.weeklyInsight'),
      outlineSuggestion: t('interaction.outlineSuggestion')
    };
    return labels[type] || type;
  };

  // 切換主題展開狀態
  const toggleTopicExpansion = (topicId) => {
    const newExpanded = new Set(expandedTopics);
    if (newExpanded.has(topicId)) {
      newExpanded.delete(topicId);
    } else {
      newExpanded.add(topicId);
    }
    setExpandedTopics(newExpanded);
  };

  // 添加新互動內容
  const addInteraction = (type, sessionId, content, additionalData = {}) => {
    const newInteraction = {
      id: interactions.length + 1,
      type,
      sessionId,
      authorId: currentUser.id,
      content,
      ...additionalData,
      createdAt: new Date().toISOString()
    };
    createInteraction(newInteraction);
  };


  // 刪除場次
  const handleDeleteSession = async (session) => {    
    if (window.confirm(t('session.deleteConfirm', { scope: session.scope }))) {
      await deleteSession(session.id);
      setActiveTab('topics'); // 回到主題列表
    }
  };

  // 簡單的模態框組件
  const renderModal = () => {
    if (!showModal) return null;

    const modalContent = {
      newQuestion: {
        title: t('modal.newQuestion'),
        fields: [
          { key: 'content', label: t('form.questionContent'), type: 'textarea', placeholder: t('form.questionPlaceholder'), required: true }
        ]
      },
      newNoteLink: {
        title: t('modal.newNoteLink'),
        fields: [
          { key: 'label', label: t('form.linkTitle'), type: 'text', placeholder: t('form.linkTitlePlaceholder'), required: true },
          { key: 'description', label: t('form.description'), type: 'textarea', placeholder: t('form.descriptionPlaceholder'), required: true },
          { key: 'url', label: t('form.linkUrl'), type: 'url', placeholder: t('form.linkUrlPlaceholder'), required: true }
        ]
      },
      newInsight: {
        title: t('modal.newInsight'),
        fields: [
          { key: 'content', label: t('form.insightContent'), type: 'textarea', placeholder: t('form.insightPlaceholder'), required: true }
        ]
      },
      newFeedback: {
        title: t('modal.newFeedback'),
        fields: [
          { key: 'content', label: t('form.feedbackContent'), type: 'textarea', placeholder: t('form.feedbackPlaceholder'), required: true }
        ]
      },
      newReference: {
        title: t('modal.newReference'),
        fields: [
          { key: 'content', label: t('form.referenceContent'), type: 'textarea', placeholder: t('form.referencePlaceholder'), required: true }
        ]
      },
      newTopic: {
        title: t('modal.newTopic'),
        fields: [
          { key: 'title', label: t('form.title'), type: 'text', placeholder: t('form.titlePlaceholder'), required: true },
          { key: 'startDate', label: t('form.startDate'), type: 'date', required: true },
          { key: 'endDate', label: t('form.endDate'), type: 'date', required: true },
          { key: 'intervalType', label: t('form.intervalType'), type: 'select', options: [
            { value: 'WEEKLY', label: t('topic.weekly') },
            { value: 'BIWEEKLY', label: t('topic.biweekly') }
          ], required: true },
          { key: 'outline', label: t('form.outline'), type: 'textarea', placeholder: t('form.outlinePlaceholder'), required: true },
          { key: 'keywords', label: t('form.keywords'), type: 'text', placeholder: t('form.keywordsPlaceholder') },
          { key: 'referenceUrls', label: t('form.referenceUrls'), type: 'textarea', placeholder: t('form.referenceUrlsPlaceholder') },
          { key: 'attendees', label: t('form.attendees'), type: 'multiselect', options: users.map(u => ({ value: u.id, label: u.name })), required: true }
        ]
      },
      editTopic: {
        title: t('modal.editTopic'),
        fields: [
          { key: 'title', label: t('form.title'), type: 'text', placeholder: t('form.titlePlaceholder'), required: true },
          { key: 'startDate', label: t('form.startDate'), type: 'date', required: true },
          { key: 'endDate', label: t('form.endDate'), type: 'date', required: true },
          { key: 'intervalType', label: t('form.intervalType'), type: 'select', options: [
            { value: 'WEEKLY', label: t('topic.weekly') },
            { value: 'BIWEEKLY', label: t('topic.biweekly') }
          ], required: true },
          { key: 'outline', label: t('form.outline'), type: 'textarea', placeholder: t('form.outlinePlaceholder'), required: true },
          { key: 'keywords', label: t('form.keywords'), type: 'text', placeholder: t('form.keywordsPlaceholder') },
          { key: 'referenceUrls', label: t('form.referenceUrls'), type: 'textarea', placeholder: t('form.referenceUrlsPlaceholder') },
          { key: 'attendees', label: t('form.attendees'), type: 'multiselect', options: users.map(u => ({ value: u.id, label: u.name })), required: true }
        ]
      },
      newSession: {
        title: t('modal.newSession'),
        fields: [
          { key: 'scope', label: t('form.sessionScope'), type: 'text', placeholder: t('form.sessionScopePlaceholder'), required: true },
          { key: 'startDateTime', label: t('form.startDateTime'), type: 'datetime-local', required: true },
          { key: 'presenterId', label: t('form.presenter'), type: 'select', options: users.map(u => ({ value: u.id, label: u.name })), required: true },
          { key: 'outline', label: t('form.sessionOutline'), type: 'textarea', placeholder: t('form.sessionOutlinePlaceholder'), required: true },
          { key: 'attendees', label: t('form.sessionAttendees'), type: 'multiselect', options: users.map(u => ({ value: u.id, label: u.name })), required: false }
        ]
      },
      editSession: {
        title: t('modal.editSession'),
        fields: [
          { key: 'scope', label: t('form.sessionScope'), type: 'text', placeholder: t('form.sessionScopePlaceholder'), required: true },
          { key: 'startDateTime', label: t('form.startDateTime'), type: 'datetime-local', required: true },
          { key: 'presenterId', label: t('form.presenter'), type: 'select', options: users.map(u => ({ value: u.id, label: u.name })), required: true },
          { key: 'outline', label: t('form.sessionOutline'), type: 'textarea', placeholder: t('form.sessionOutlinePlaceholder'), required: true },
          { key: 'attendees', label: t('form.sessionAttendees'), type: 'multiselect', options: users.map(u => ({ value: u.id, label: u.name })), required: false }
        ]
      },
      newUser: {
        title: t('modal.newUser'),
        fields: [
          { key: 'name', label: t('form.userName'), type: 'text', placeholder: t('form.userNamePlaceholder'), required: true },
          { key: 'email', label: t('form.userEmail'), type: 'email', placeholder: t('form.userEmailPlaceholder'), required: true },
          { key: 'role', label: t('form.userRole'), type: 'select', options: [
            { value: 'user', label: t('form.regularUser') },
            { value: 'admin', label: t('form.adminUser') }
          ], required: true }
        ]
      },
      editUser: {
        title: t('modal.editUser'),
        fields: [
          { key: 'name', label: t('form.userName'), type: 'text', placeholder: t('form.userNamePlaceholder'), required: true },
          { key: 'email', label: t('form.userEmail'), type: 'email', placeholder: t('form.userEmailPlaceholder'), required: true },
          { key: 'role', label: t('form.userRole'), type: 'select', options: [
            { value: 'user', label: t('form.regularUser') },
            { value: 'admin', label: t('form.adminUser') }
          ], required: true }
        ]
      },
      editQuestion: {
        title: t('modal.editQuestion'),
        fields: [
          { key: 'content', label: t('form.questionContent'), type: 'textarea', placeholder: t('form.questionPlaceholder'), required: true }
        ]
      },
      editNoteLink: {
        title: t('modal.editNoteLink'),
        fields: [
          { key: 'label', label: t('form.linkTitle'), type: 'text', placeholder: t('form.linkTitlePlaceholder'), required: true },
          { key: 'description', label: t('form.description'), type: 'textarea', placeholder: t('form.descriptionPlaceholder'), required: true },
          { key: 'url', label: t('form.linkUrl'), type: 'url', placeholder: t('form.linkUrlPlaceholder'), required: true }
        ]
      },
      editInsight: {
        title: t('modal.editInsight'),
        fields: [
          { key: 'content', label: t('form.insightContent'), type: 'textarea', placeholder: t('form.insightPlaceholder'), required: true }
        ]
      },
      editFeedback: {
        title: t('modal.editFeedback'),
        fields: [
          { key: 'content', label: t('form.feedbackContent'), type: 'textarea', placeholder: t('form.feedbackPlaceholder'), required: true }
        ]
      },
      editReference: {
        title: t('modal.editReference'),
        fields: [
          { key: 'content', label: t('form.referenceContent'), type: 'textarea', placeholder: t('form.referencePlaceholder'), required: true }
        ]
      }
    };

    const config = modalContent[showModal];
    if (!config) return null;

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {};
      
      config.fields.forEach(field => {
        if (field.type === 'select' && field.key === 'presenterId') {
          data[field.key] = parseInt(formData.get(field.key));
        } else if (field.key === 'keywords') {
          data[field.key] = formData.get(field.key) ? formData.get(field.key).split(',').map(k => k.trim()) : [];
        } else if (field.key === 'referenceUrls') {
          data[field.key] = formData.get(field.key) ? formData.get(field.key).split('\n').filter(url => url.trim()) : [];
        } else if (field.type === 'multiselect' && field.key === 'attendees') {
          // 處理多選attendees欄位
          const selectedAttendees = formData.getAll(field.key);
          data[field.key] = selectedAttendees.map(id => parseInt(id));
          console.log('處理出席者數據:', selectedAttendees, '->', data[field.key]);
        } else {
          data[field.key] = formData.get(field.key);
        }
      });

      // 根據不同的模態框類型處理數據
      if (showModal === 'newTopic') {
        const newTopic = {
          id: topics.length + 1,
          ...data,
          createdBy: currentUser.id,
          createdAt: new Date().toISOString(),
          sessions: []
        };
        createTopic(newTopic);
      } else if (showModal === 'editTopic' && editingTopic) {
        const updatedTopic = {
          ...editingTopic,
          ...data
        };
        updateTopic(updatedTopic);
        setEditingTopic(null);
      } else if (showModal === 'newSession' && currentTopicForSession) {
        const newSession = {
          id: 0, // Will be assigned by the backend
          topicId: currentTopicForSession.id,
          presenterId: parseInt(data.presenterId),
          startDateTime: data.startDateTime.replace('T', ' '), // Convert to YYYY-MM-DD HH:MM format
          scope: data.scope,
          outline: data.outline || '',
          noteLinks: [],
          references: [],
          attendees: data.attendees || []
        };
        
        await createSession(newSession);
        setCurrentTopicForSession(null);
      } else if (showModal === 'editSession' && editingSession && selectedTopic) {
        console.log('編輯場次 - 原始數據:', editingSession);
        console.log('編輯場次 - 表單數據:', data);
        
        const updatedSession = {
          ...editingSession,
          presenterId: parseInt(data.presenterId),
          startDateTime: data.startDateTime.replace('T', ' '), // Convert to YYYY-MM-DD HH:MM format
          scope: data.scope,
          outline: data.outline || '',
          attendees: data.attendees || []
        };
        
        console.log('編輯場次 - 更新後數據:', updatedSession);
        
        await updateSession(updatedSession);
        setSelectedSession(updatedSession); // 更新 selectedSession 以反映最新數據
        setEditingSession(null);
      } else if (showModal === 'newUser') {
        const newUser = {
          id: users.length + 1,
          ...data,
          createdAt: new Date().toISOString()
        };
        createUser(newUser);
      } else if (showModal === 'editUser' && editingUser) {
        const updatedUser = {
          ...editingUser,
          ...data
        };
        updateUser(updatedUser);
        setEditingUser(null);
      } else if (editingInteraction && (showModal === 'editQuestion' || showModal === 'editNoteLink' || showModal === 'editInsight' || showModal === 'editFeedback' || showModal === 'editReference')) {
        // 編輯互動內容
        const updatedInteraction = {
          ...editingInteraction,
          ...data,
          updatedAt: new Date().toISOString()
        };
        updateInteraction(updatedInteraction);
        setEditingInteraction(null);
      } else {
        // 新增互動內容
        let interactionType;
        if (showModal === 'newInsight') {
          interactionType = 'weeklyInsight';
        } else if (showModal === 'newNoteLink') {
          interactionType = 'noteLink';
        } else if (showModal === 'newQuestion') {
          interactionType = 'question';
        } else if (showModal === 'newReference') {
          interactionType = 'reference';
        } else if (showModal === 'newFeedback') {
          interactionType = 'speakerFeedback';
        } else {
          // 備案：使用原來的邏輯
          interactionType = showModal.replace('new', '').toLowerCase();
        }
        
        addInteraction(interactionType, selectedSession?.id, data.content, data);
      }
      
      setShowModal(null);
    };

    // 獲取預填值（編輯模式）
    const getDefaultValue = (field) => {
      // 編輯主題模式
      if (editingTopic && showModal === 'editTopic') {
        console.log('取得主題預設值:', field.key, editingTopic[field.key]);
        
        if (field.key === 'keywords') {
          return editingTopic.keywords ? editingTopic.keywords.join(', ') : '';
        } else if (field.key === 'referenceUrls') {
          return editingTopic.referenceUrls ? editingTopic.referenceUrls.join('\n') : '';
        } else if (field.key === 'attendees') {
          return editingTopic.attendees || [];
        }
        return editingTopic[field.key] || '';
      }
      
      // 新增主題模式 - 預設選中當前使用者
      if (showModal === 'newTopic' && field.key === 'attendees') {
        return [currentUser.id];
      }
      
      // 編輯場次模式
      if (editingSession && showModal === 'editSession') {
        console.log('取得場次預設值:', field.key, editingSession[field.key]);
        
        if (field.key === 'presenterId') {
          return editingSession.presenterId || '';
        } else if (field.key === 'attendees') {
          return editingSession.attendees || [];
        } else if (field.key === 'startDateTime') {
          // 將日期時間格式轉換為 datetime-local 輸入所需的格式
          const dateTime = editingSession.startDateTime;
          if (dateTime) {
            try {
              const date = new Date(dateTime);
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const hours = String(date.getHours()).padStart(2, '0');
              const minutes = String(date.getMinutes()).padStart(2, '0');
              return `${year}-${month}-${day}T${hours}:${minutes}`;
            } catch (e) {
              // 如果轉換失敗，嘗試直接使用原值
              return dateTime;
            }
          }
          return '';
        }
        return editingSession[field.key] || '';
      }
      
      // 編輯使用者模式
      if (editingUser && showModal === 'editUser') {
        console.log('取得使用者預設值:', field.key, editingUser[field.key]);
        return editingUser[field.key] || '';
      }
      
      // 編輯互動模式
      if (editingInteraction && (showModal === 'editQuestion' || showModal === 'editNoteLink' || showModal === 'editInsight' || showModal === 'editFeedback' || showModal === 'editReference')) {
        console.log('取得互動預設值:', field.key, editingInteraction[field.key]);
        return editingInteraction[field.key] || '';
      }
      
      return '';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">{config.title}</h3>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {config.fields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={field.placeholder}
                      rows={3}
                      required={field.required}
                      defaultValue={getDefaultValue(field)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.key}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={field.required}
                      defaultValue={getDefaultValue(field)}
                    >
                      <option value="">{t('form.pleaseSelect')}</option>
                      {field.options?.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'multiselect' ? (
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto">
                      {field.options?.map(option => (
                        <label key={option.value} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            name={field.key}
                            value={option.value}
                            defaultChecked={(() => {
                              const defaultValue = getDefaultValue(field);
                              const optionValueNum = parseInt(option.value);
                              return Array.isArray(defaultValue) && defaultValue.includes(optionValueNum);
                            })()}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      name={field.key}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={field.placeholder}
                      required={field.required}
                      defaultValue={getDefaultValue(field)}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {showModal === 'editTopic' || showModal === 'editSession' || showModal === 'editUser' || showModal === 'editQuestion' || showModal === 'editNoteLink' || showModal === 'editInsight' || showModal === 'editFeedback' || showModal === 'editReference' ? t('form.confirmEdit') : t('form.confirm')}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                onClick={() => {
                  setShowModal(null);
                  setEditingTopic(null);
                  setCurrentTopicForSession(null);
                  setEditingSession(null);
                  setEditingUser(null);
                  setEditingInteraction(null);
                }}
              >
                {t('form.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Handle login success
  const handleLoginSuccess = async (loginData: { user: any; accessToken: string }) => {
    console.log('Login success in StudyGroupPlatform:', loginData);
    console.log('Current authentication state:', isAuthenticated);
    console.log('Current user before update:', currentUser);
    
    // Update the current user and authentication state in the DataContext
    setCurrentUser(loginData.user);
    console.log('Updated current user to:', loginData.user);
    
    // Force reload to refresh all data with the authenticated user
    console.log('Calling reload...');
    await reload();
    console.log('Reload completed');
  };

  // Show auth form if in API mode and not authenticated, or if profile is incomplete
  if (source === 'api' && (!isAuthenticated || profileIncomplete)) {
    return <AuthForm onLoginSuccess={handleLoginSuccess} />;
  }

  // Show profile page if requested
  if (showProfile) {
    return <ProfileUpdate onBack={() => setShowProfile(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 頂部導航 */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">{t('nav.title')}</span>
              
              {/* Version Information */}
              <div className="relative ml-3 version-info">
                <button
                  onClick={() => setShowVersionInfo(!showVersionInfo)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full font-medium hover:bg-blue-200 transition-colors flex items-center gap-1"
                  title="Click for version details"
                >
                  <Info className="w-3 h-3" />
                  v{VERSION}
                </button>
                
                {showVersionInfo && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Study Group Platform</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span className="font-medium">Client Version:</span>
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">v{VERSION}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Build Date:</span>
                          <span>{BUILD_DATE}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">Data Source:</span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            source === 'mock' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {source === 'mock' ? 'Mock Data' : 'API Server'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">React Version:</span>
                          <span>18.3.1</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">TypeScript:</span>
                          <span>5.5.4</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="font-medium">UI Framework:</span>
                          <span>Tailwind CSS 3.4</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-3 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Recent Updates</h4>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>• Enhanced data structure alignment</div>
                          <div>• Improved API integration support</div>
                          <div>• Added reference categorization</div>
                          <div>• Updated server compatibility</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                        Built with React + TypeScript + Vite
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* 語言切換下拉選單 */}
              <div className="relative language-switcher">
                <button
                  onClick={() => setShowLanguageSwitcher(!showLanguageSwitcher)}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 border border-purple-300"
                  title={t('nav.language')}
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{languageNames[language]}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                
                {showLanguageSwitcher && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
                        {t('nav.language')}
                      </div>
                      {(Object.keys(languageNames) as Language[]).map(lang => (
                        <button
                          key={lang}
                          onClick={() => {
                            setLanguage(lang);
                            setShowLanguageSwitcher(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                            language === lang ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${language === lang ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                          {languageNames[lang]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>


              {/* 當前使用者顯示 */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  {currentUser.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-blue-600" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{currentUser.name}</span>
                  <span className="text-xs text-gray-500">{currentUser.role === 'admin' ? t('nav.admin') : t('nav.user')}</span>
                </div>
              </div>

              {/* Profile Settings Button */}
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors"
                title="Profile Settings"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>

              {/* Logout Button - only show in API mode */}
              {source === 'api' && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 border border-red-300 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 標籤導航 */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'topics'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            {t('nav.topics')}
          </button>
          
          <button
            onClick={() => setActiveTab('session')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'session'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            {t('nav.session')}
          </button>
          
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              {t('nav.users')}
            </button>
          )}
        </div>

        {/* 主要內容區域 */}
        <div className="transition-all duration-300">
          {activeTab === 'topics' && (
  <TopicList
    topics={topics}
    users={users}
    interactions={interactions}
    searchQuery={searchQuery}
    onSearch={setSearchQuery}
    expandedTopicIds={expandedTopics}
    onToggleTopic={toggleTopicExpansion}
    currentUserRole={currentUser.role as 'admin' | 'user'}
    onNewTopic={() => setShowModal('newTopic')}
    onNewSession={(topic) => {
      setCurrentTopicForSession(topic);
      setShowModal('newSession');
    }}
    onOpenSession={(topic, session) => {
      setSelectedTopic(topic);
      setSelectedSession(session);
      setActiveTab('session');
    }}
    onEditTopic={(t) => {
      setEditingTopic(t);
      setShowModal('editTopic');
    }}
    onDeleteTopic={(topic) => {
      if (window.confirm(t('topic.deleteConfirm', { title: topic.title }))) {
        deleteTopic(topic.id);
      }
    }}
  />
)}

 {activeTab === 'session' && selectedTopic && selectedSession && (
  <SessionDetail
    topic={selectedTopic}
    session={selectedSession}
    users={users}
    interactions={interactions.filter(i => i.sessionId === selectedSession.id)}
    currentUser={currentUser}
    onBack={() => setActiveTab('topics')}
    onEditSession={(s) => {
      setEditingSession(s);
      setShowModal('editSession');
    }}
    onDeleteSession={handleDeleteSession}
    onAddNoteLink={() => setInteractionModal({ open: true, type: 'noteLink', editing: null })}
    onAddReference={() => setInteractionModal({ open: true, type: 'reference', editing: null })}
    onAddQuestion={() => setShowModal('newQuestion')}
    onAddInsight={() => setShowModal('newInsight')}
    onAddSpeakerFeedback={() => setShowModal('newFeedback')}
    onEditInteraction={(interaction) => {
      if (interaction.type === 'reference' || interaction.type === 'noteLink') {
        setInteractionModal({ open: true, type: interaction.type, editing: interaction });
      } else {
        setEditingInteraction(interaction);
        // 根據互動類型設置對應的編輯模態框
        let modalType;
        switch (interaction.type) {
          case 'question': modalType = 'editQuestion'; break;
          case 'weeklyInsight': modalType = 'editInsight'; break;
          case 'speakerFeedback': modalType = 'editFeedback'; break;
          default: modalType = 'editQuestion'; break;
        }
        setShowModal(modalType);
      }
    }}
    onDeleteInteraction={async (interaction) => {
      if (window.confirm(t('interaction.deleteConfirm', { type: getInteractionLabel(interaction.type) }))) {
        await deleteInteraction(interaction.id);
      }
    }}
  />
)}

  {activeTab === 'users' && currentUser.role === 'admin' && (
  <UserManagement
    users={users}
    currentUserRole={currentUser.role as 'admin' | 'user'}
    onCreateUser={() => {
      setEditingUser(null);
      setShowUserForm(true);
    }}
    onEditUser={(u) => {
      setEditingUser(u);
      setShowUserForm(true);
    }}
    onDeleteUser={async (u) => {
      if (window.confirm(t('user.deleteConfirm', { name: u.name }))) {
        try {
          await deleteUser(u.id);
        } catch (error: any) {
          console.error('Delete user failed:', error);
          // Show a more user-friendly error message
          const errorMessage = error.message || 'Failed to delete user';
          window.alert(`Cannot delete user: ${errorMessage}`);
        }
      }
    }}
  />
)}

        </div>
      </div>

      {/* 模態框 */}
      {renderModal()}
      
      {/* 用戶管理表單 (feature-based) */}
      <UserForm
        open={showUserForm}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        initialValue={editingUser}
        onSubmit={editingUser ? 
          (data) => updateUser({ ...editingUser, ...data }) : 
          createUser
        }
      />
      
      {/* 場次管理表單 (feature-based) - 暫時註解 */}
      {/* {(currentTopicForSession || selectedTopic) && (
        <SessionForm
          open={showSessionForm}
          onClose={() => {
            setShowSessionForm(false);
            setEditingSession(null);
            setCurrentTopicForSession(null);
          }}
          initialValue={editingSession}
          topic={currentTopicForSession || selectedTopic}
          users={users}
          onSubmit={editingSession ? 
            (data) => updateSession(selectedTopic.id, editingSession.id, data) : 
            (data) => createSession((currentTopicForSession || selectedTopic).id, data)
          }
        />
      )} */}
      
      {/* 互動表單 (新增參考文獻等) */}
      <InteractionForm
        open={interactionModal.open}
        onClose={() => setInteractionModal({ open: false, type: null, editing: null })}
        type={interactionModal.type}
        initialValue={interactionModal.editing}
        onSubmit={async (content, additionalData) => {
          if (selectedSession && selectedTopic) {
            if (interactionModal.editing) {
              // 編輯現有互動
              const updateData: any = {
                ...interactionModal.editing,
              };
              
              // Only add content for non-link types
              if (interactionModal.type !== 'reference' && interactionModal.type !== 'noteLink') {
                updateData.content = content;
              }
              
              // Add additional data (label, description, url, category for references)
              if (additionalData) {
                Object.assign(updateData, additionalData);
              }
              
              await updateInteraction(updateData);
            } else {
              // 新增互動
              const interactionData: any = {
                type: interactionModal.type,
                sessionId: selectedSession.id,
                authorId: currentUser.id,
                createdAt: new Date().toISOString(),
              };
              
              // Only add content for non-link types
              if (interactionModal.type !== 'reference' && interactionModal.type !== 'noteLink') {
                interactionData.content = content;
              }
              
              // Add additional data (label, description, url, category for references)
              if (additionalData) {
                Object.assign(interactionData, additionalData);
              }
              
              await createInteraction(interactionData);
            }
          }
        }}
      />
    </div>
  );
};

export default StudyGroupPlatform;