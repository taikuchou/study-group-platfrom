import React, { useMemo, useState } from 'react';
import {
  Search, Plus, Calendar, Users, Edit, Trash2,
  ChevronDown, ChevronRight, X
} from 'lucide-react';
import type { User, Topic, Interaction } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

type Session = Topic['sessions'][number];

type Props = {
  topics: Topic[];
  users: User[];
  interactions: Interaction[];

  // 搜尋
  searchQuery: string;
  onSearch: (v: string) => void;

  // 展開/收合
  expandedTopicIds: Set<number>;
  onToggleTopic: (topicId: number) => void;

  // 權限
  currentUserRole: 'admin' | 'user';

  // 事件
  onNewTopic: () => void;
  onNewSession?: (topic: Topic) => void;
  onOpenSession: (topic: Topic, session: Session) => void;
  onEditTopic?: (topic: Topic) => void;
  onDeleteTopic?: (topic: Topic) => void;
};

const TopicList: React.FC<Props> = ({
  topics, users, interactions,
  searchQuery, onSearch,
  expandedTopicIds, onToggleTopic,
  currentUserRole,
  onNewTopic, onNewSession, onOpenSession, onEditTopic, onDeleteTopic
}) => {
  const { t } = useTranslation();
  const { currentUser } = useData();
  const [showAttendeesModal, setShowAttendeesModal] = useState<Session | null>(null);
  const [showTopicMembersModal, setShowTopicMembersModal] = useState<Topic | null>(null);

  // helpers
  const getUserName = (userId: number) => {
    console.log('[TopicList getUserName] userId:', userId, 'type:', typeof userId);
    console.log('[TopicList getUserName] users array length:', users.length);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log('[TopicList getUserName] Found user:', user.name);
      return user.name;
    }
    
    // If we can't find the user in the users list (due to permissions)
    // but it's the current user, return current user's name
    console.log('[TopicList getUserName] Checking if current user - userId:', userId);
    // Use loose equality to handle potential type differences between string/number
    if ((userId == currentUser?.id || userId === currentUser?.id) && currentUser?.name) {
      console.log('[TopicList getUserName] Returning current user name:', currentUser.name);
      return currentUser.name;
    }
    
    console.log('[TopicList getUserName] Returning Unknown User');
    return 'Unknown User';
  };
  const getSessionInteractions = (sessionId: number) =>
    interactions.filter(item => item.sessionId === sessionId);

  // 篩選（沿用你的邏輯）
  const filteredTopics = useMemo(() => {
    if (!searchQuery) return topics;
    const q = searchQuery.toLowerCase();
    return topics.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.outline.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    );
  }, [topics, searchQuery]);

  return (
    <div className="space-y-4">
      {/* 搜尋 + 新增主題 */}
      <div className="flex gap-4 items-center mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('topic.search')}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {currentUserRole === 'admin' && (
          <button
            className="bg-blue-600 text-white w-10 h-10 rounded-lg hover:bg-blue-700 flex items-center justify-center"
            onClick={onNewTopic}
            title={t('topic.newTopic')}
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 主題卡片 */}
      {filteredTopics.map(topic => (
        <div key={topic.id} className="bg-white rounded-lg shadow border">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => onToggleTopic(topic.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {expandedTopicIds.has(topic.id)
                      ? <ChevronDown className="w-5 h-5" />
                      : <ChevronRight className="w-5 h-5" />}
                  </button>
                  <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {topic.intervalType === 'WEEKLY' ? t('topic.weekly') : t('topic.biweekly')}
                  </span>
                </div>

                <pre className="text-gray-600 mb-3 whitespace-pre-wrap font-sans">{topic.outline}</pre>

                <div className="flex flex-wrap gap-2 mb-3">
                  {topic.keywords.map(keyword => (
                    <span key={keyword} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                      {keyword}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {topic.startDate} ~ {topic.endDate}
                  </span>
                  <button 
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTopicMembersModal(topic);
                    }}
                  >
                    <Users className="w-4 h-4" />
                    {topic.attendees.length} {t('topic.members')}
                  </button>
                </div>
              </div>

              {currentUserRole === 'admin' && (
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600" onClick={() => onEditTopic?.(topic)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-red-600" onClick={() => onDeleteTopic?.(topic)}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* 場次列表（展開時） */}
            {expandedTopicIds.has(topic.id) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900">{t('topic.sessions')}</h4>
                  {currentUserRole === 'admin' && (
                    <button
                      className="text-blue-600 hover:text-blue-700 w-6 h-6 flex items-center justify-center rounded"
                      onClick={() => onNewSession?.(topic)}
                      title={t('topic.newSession')}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {topic.sessions.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                      onClick={() => onOpenSession(topic, session)}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{session.scope}</div>
                        <div className="text-sm text-gray-600">
                          {session.startDateTime} • 分享者: {getUserName(session.presenterId)}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span>{getSessionInteractions(session.id).length} {t('topic.interactions')}</span>
                        <button
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowAttendeesModal(session);
                          }}
                        >
                          <Users className="w-3 h-3" />
                          {session.attendees?.length || 0} {t('topic.attendees')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 主題成員清單模態框 */}
      {showTopicMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('modal.topicMembers')}</h3>
              <button
                onClick={() => setShowTopicMembersModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{showTopicMembersModal.title}</div>
              <div className="text-sm text-gray-600">
                {showTopicMembersModal.startDate} ~ {showTopicMembersModal.endDate}
              </div>
            </div>

            {showTopicMembersModal.attendees && showTopicMembersModal.attendees.length > 0 ? (
              <div className="space-y-2">
                <div className="font-medium text-gray-700 mb-3">
                  {t('modal.totalMembers', { count: showTopicMembersModal.attendees.length })}
                </div>
                {showTopicMembersModal.attendees.map(attendeeId => (
                  <div key={attendeeId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-green-600">
                        {getUserName(attendeeId)[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900">{getUserName(attendeeId)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{t('modal.noMembers')}</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowTopicMembersModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {t('form.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 出席者清單模態框 */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{t('modal.sessionAttendees')}</h3>
              <button
                onClick={() => setShowAttendeesModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{showAttendeesModal.scope}</div>
              <div className="text-sm text-gray-600">{showAttendeesModal.startDateTime}</div>
            </div>

            {showAttendeesModal.attendees && showAttendeesModal.attendees.length > 0 ? (
              <div className="space-y-2">
                <div className="font-medium text-gray-700 mb-3">
                  {t('modal.totalAttendees', { count: showAttendeesModal.attendees.length })}
                </div>
                {showAttendeesModal.attendees.map(attendeeId => (
                  <div key={attendeeId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {getUserName(attendeeId)[0]?.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900">{getUserName(attendeeId)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">{t('modal.noAttendees')}</p>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAttendeesModal(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                {t('form.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicList;
