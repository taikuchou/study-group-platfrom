import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Globe, ChevronDown,
  User as UserIcon, Shield
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useLanguage, useTranslation } from '../context/LanguageContext';

// Feature imports
import { TopicList, TopicForm, useTopics } from '../features/topics';
import { SessionDetail, SessionForm, useSessions } from '../features/sessions';
import { InteractionForm, useInteractions, InteractionType } from '../features/interactions';
import { UserManagement, UserForm, useUsers } from '../features/users';

// Types
import type { Topic, User, Interaction } from '../types';

type Session = Topic['sessions'][number];
type ActiveTab = 'topics' | 'session' | 'users';

const StudyGroupPlatform: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<ActiveTab>('topics');
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTopicIds, setExpandedTopicIds] = useState<Set<number>>(new Set());

  // UI state
  const [showLanguageSwitcher, setShowLanguageSwitcher] = useState(false);

  // Modal state
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showInteractionForm, setShowInteractionForm] = useState(false);
  
  // Form data state
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [interactionType, setInteractionType] = useState<InteractionType>('question');
  const [currentTopicForSession, setCurrentTopicForSession] = useState<Topic | null>(null);

  // Data and hooks
  const { currentUser, setCurrentUser, users, interactions, source, setSource } = useData();
  const { topics, createTopic, updateTopic, deleteTopic } = useTopics();
  const { createSession, updateSession } = useSessions();
  const { createInteraction, updateInteraction, deleteInteraction } = useInteractions();
  const { createUser, updateUser, deleteUser } = useUsers();

  // Language
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  // Language names mapping
  const languageNames = {
    'zh-TW': '繁體中文',
    'en': 'English',
    'ja': '日本語',
    'ko': '한국어',
    'es': 'Español',
    'fr': 'Français'
  };

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (showLanguageSwitcher && !(event.target as Element).closest('.language-switcher')) {
        setShowLanguageSwitcher(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguageSwitcher]);

  // Utility functions
  const toggleTopic = (topicId: number) => {
    setExpandedTopicIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(topicId)) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const getInteractionLabel = (type: string) => {
    const labels: Record<string, string> = {
      question: t('interaction.question'),
      noteLink: t('interaction.noteLink'),
      reference: t('interaction.reference'),
      speakerFeedback: t('interaction.speakerFeedback'),
      weeklyInsight: t('interaction.weeklyInsight'),
      outlineSuggestion: t('interaction.outlineSuggestion')
    };
    return labels[type] || type;
  };

  // Form handlers
  const handleCreateTopic = async (topicData: any) => {
    await createTopic({
      ...topicData,
      createdBy: currentUser.id
    });
  };

  const handleUpdateTopic = async (topicData: any) => {
    if (editingTopic) {
      const updatedTopic = await updateTopic({
        ...editingTopic,
        ...topicData
      });
      if (selectedTopic?.id === editingTopic.id) {
        setSelectedTopic(updatedTopic);
      }
      setEditingTopic(null);
    }
  };

  const handleCreateSession = async (sessionData: any) => {
    if (currentTopicForSession) {
      const newSession = await createSession(currentTopicForSession.id, {
        ...sessionData,
        attendees: sessionData.attendees || []
      });
      setCurrentTopicForSession(null);
      
      // Update selected topic if it's the same
      if (selectedTopic?.id === currentTopicForSession.id) {
        const updatedTopic = { 
          ...currentTopicForSession, 
          sessions: [...currentTopicForSession.sessions, newSession] 
        };
        setSelectedTopic(updatedTopic);
      }
    }
  };

  const handleUpdateSession = async (sessionData: any) => {
    if (editingSession && selectedTopic) {
      const updatedSession = await updateSession(
        selectedTopic.id,
        editingSession.id,
        {
          ...sessionData,
          attendees: sessionData.attendees || []
        }
      );
      
      if (updatedSession) {
        setSelectedSession(updatedSession);
        // Update selected topic sessions
        const updatedTopic = {
          ...selectedTopic,
          sessions: selectedTopic.sessions.map(s => 
            s.id === editingSession.id ? updatedSession : s
          )
        };
        setSelectedTopic(updatedTopic);
      }
      setEditingSession(null);
    }
  };

  const handleCreateInteraction = async (content: string, additionalData?: any) => {
    if (selectedSession) {
      await createInteraction(
        interactionType,
        selectedSession.id,
        content,
        {
          ...additionalData,
          authorId: currentUser.id
        }
      );
    }
  };

  const handleUpdateInteraction = async (content: string, additionalData?: any) => {
    if (editingInteraction) {
      await updateInteraction({
        ...editingInteraction,
        content,
        ...additionalData
      });
      setEditingInteraction(null);
    }
  };

  const closeAllModals = () => {
    setShowTopicForm(false);
    setShowSessionForm(false);
    setShowUserForm(false);
    setShowInteractionForm(false);
    setEditingTopic(null);
    setEditingSession(null);
    setEditingUser(null);
    setEditingInteraction(null);
    setCurrentTopicForSession(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">{t('nav.title')}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Language Switcher */}
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
                    <div className="py-2">
                      {Object.entries(languageNames).map(([code, name]) => (
                        <button
                          key={code}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            language === code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                          onClick={() => {
                            setLanguage(code as keyof typeof languageNames);
                            setShowLanguageSwitcher(false);
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Current User Display */}
              <div className="flex items-center gap-3 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg">
                {/* User Avatar - Show Google picture if available, otherwise icon */}
                {currentUser.picture ? (
                  <img 
                    src={currentUser.picture} 
                    alt={`${currentUser.name}'s profile`}
                    className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {currentUser.role === 'admin' ? (
                      <Shield className="w-4 h-4 text-purple-600" />
                    ) : (
                      <UserIcon className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                )}
                
                {/* User Info */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currentUser.name}</span>
                    {currentUser.googleId && (
                      <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        Google
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {currentUser.role === 'admin' ? t('nav.admin') : t('nav.user')} • {currentUser.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'topics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('topics')}
            >
              {t('nav.topics')}
            </button>
            {currentUser.role === 'admin' && (
              <button
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('users')}
              >
                {t('nav.users')}
              </button>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topics Tab */}
        {activeTab === 'topics' && (
          <TopicList
            topics={topics}
            users={users}
            interactions={interactions}
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            expandedTopicIds={expandedTopicIds}
            onToggleTopic={toggleTopic}
            currentUserRole={currentUser.role}
            onNewTopic={() => {
              setEditingTopic(null);
              setShowTopicForm(true);
            }}
            onNewSession={(topic) => {
              setCurrentTopicForSession(topic);
              setEditingSession(null);
              setShowSessionForm(true);
            }}
            onOpenSession={(topic, session) => {
              setSelectedTopic(topic);
              setSelectedSession(session);
              setActiveTab('session');
            }}
            onEditTopic={(topic) => {
              setEditingTopic(topic);
              setShowTopicForm(true);
            }}
            onDeleteTopic={(topic) => {
              if (window.confirm(t('topic.deleteConfirm', { title: topic.title }))) {
                deleteTopic(topic.id);
              }
            }}
          />
        )}

        {/* Session Detail Tab */}
        {activeTab === 'session' && selectedTopic && selectedSession && (
          <SessionDetail
            topic={selectedTopic}
            session={selectedSession}
            users={users}
            interactions={interactions}
            currentUser={currentUser}
            onBack={() => setActiveTab('topics')}
            onEditSession={(session) => {
              setEditingSession(session);
              setShowSessionForm(true);
            }}
            onDeleteSession={async (session) => {
              if (window.confirm(t('session.deleteConfirm', { scope: session.scope }))) {
                // Handle session deletion logic here
                setActiveTab('topics');
              }
            }}
            onAddInteraction={(type) => {
              setInteractionType(type as InteractionType);
              setEditingInteraction(null);
              setShowInteractionForm(true);
            }}
            onEditInteraction={(interaction) => {
              setEditingInteraction(interaction);
              setInteractionType(interaction.type as InteractionType);
              setShowInteractionForm(true);
            }}
            onDeleteInteraction={async (interaction) => {
              if (window.confirm(t('interaction.deleteConfirm', { type: getInteractionLabel(interaction.type) }))) {
                await deleteInteraction(interaction.id);
              }
            }}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && currentUser.role === 'admin' && (
          <UserManagement
            users={users}
            currentUserRole={currentUser.role}
            onCreateUser={() => {
              setEditingUser(null);
              setShowUserForm(true);
            }}
            onEditUser={(user) => {
              setEditingUser(user);
              setShowUserForm(true);
            }}
            onDeleteUser={(user) => {
              if (window.confirm(t('user.deleteConfirm', { name: user.name }))) {
                deleteUser(user.id);
              }
            }}
          />
        )}
      </div>

      {/* Modals */}
      <TopicForm
        open={showTopicForm}
        onClose={closeAllModals}
        initialValue={editingTopic}
        users={users}
        currentUser={currentUser}
        onSubmit={editingTopic ? handleUpdateTopic : handleCreateTopic}
      />

      {(currentTopicForSession || selectedTopic) && (
        <SessionForm
          open={showSessionForm}
          onClose={closeAllModals}
          initialValue={editingSession}
          topic={currentTopicForSession || selectedTopic!}
          users={users}
          onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        />
      )}

      <UserForm
        open={showUserForm}
        onClose={closeAllModals}
        initialValue={editingUser}
        onSubmit={editingUser ? 
          (data) => updateUser({ ...editingUser, ...data }) : 
          createUser
        }
      />

      <InteractionForm
        open={showInteractionForm}
        onClose={closeAllModals}
        type={interactionType}
        initialValue={editingInteraction}
        onSubmit={editingInteraction ? handleUpdateInteraction : handleCreateInteraction}
      />
    </div>
  );
};

export default StudyGroupPlatform;