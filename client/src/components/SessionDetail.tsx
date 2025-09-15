import React, { useMemo, useState } from 'react';
import {
  Calendar, FileText, Link as LinkIcon, MessageSquare,
  Heart, Lightbulb, Edit, Trash2, User as UserIcon, ChevronLeft, Plus, Users, X, Check, X as XIcon
} from 'lucide-react';
import type { Topic, User, Interaction, ReferenceLink, ReferenceCategory } from '../types';
import { canPerformSessionAction, canPerformInteractionAction } from '../context/Ownership';
import { useTranslation } from '../context/LanguageContext';

type Session = Topic['sessions'][number];

type Props = {
  topic: Topic;
  session: Session;
  users: User[];
  interactions: Interaction[]; // 僅該 session 的互動（父元件先過濾）
  currentUser: User;
  onBack: () => void;
  onEditSession?: (s: Session) => void;
  onDeleteSession?: (s: Session) => void;
  onAddNoteLink?: () => void;
  onAddReference?: () => void;
  onAddQuestion?: () => void;
  onAddInsight?: () => void;
  onAddSpeakerFeedback?: () => void;
  onEditInteraction?: (interaction: Interaction) => void;
  onDeleteInteraction?: (interaction: Interaction) => void;
};

const SessionDetail: React.FC<Props> = ({
  topic, session, users, interactions, currentUser, onBack, onEditSession, onDeleteSession, onAddNoteLink, onAddReference, onAddQuestion, onAddInsight, onAddSpeakerFeedback, onEditInteraction, onDeleteInteraction
}) => {
  const { t } = useTranslation();
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  const getUserName = (userId: number) => {
    console.log('[SessionDetail getUserName] userId:', userId, 'type:', typeof userId);
    console.log('[SessionDetail getUserName] users array length:', users.length);
    
    const user = users.find(u => u.id === userId);
    if (user) {
      console.log('[SessionDetail getUserName] Found user:', user.name);
      return user.name;
    }
    
    // If we can't find the user in the users list (due to permissions)
    // but it's the current user, return current user's name
    console.log('[SessionDetail getUserName] Checking if current user - userId:', userId, 'currentUser.id:', currentUser?.id);
    // Use loose equality to handle potential type differences between string/number
    if ((userId == currentUser?.id || userId === currentUser?.id) && currentUser?.name) {
      console.log('[SessionDetail getUserName] Returning current user name:', currentUser.name);
      return currentUser.name;
    }
    
    console.log('[SessionDetail getUserName] Returning Unknown User');
    return t('common.unknownUser');
  };

  const formatDateTime = (dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateTimeStr;
    }
  };

  const getCategoryIcon = (category: ReferenceCategory) => {
    switch (category) {
      case 'web': return '🌐';
      case 'book': return '📚';
      case 'paper': return '📄';
      default: return '📎';
    }
  };

  const getCategoryName = (category: ReferenceCategory) => {
    switch (category) {
      case 'web': return t('form.referenceCategoryWeb');
      case 'book': return t('form.referenceCategoryBook');
      case 'paper': return t('form.referenceCategoryPaper');
      default: return category;
    }
  };

  // Check if current user can edit/delete this session
  const canEditSession = canPerformSessionAction(currentUser, 'edit', session);
  const canDeleteSession = canPerformSessionAction(currentUser, 'delete', session);

  const byType = useMemo(() => {
    return {
      question: interactions.filter(i => i.type === 'question'),
      weeklyInsight: interactions.filter(i => i.type === 'weeklyInsight'),
      speakerFeedback: interactions.filter(i => i.type === 'speakerFeedback'),
      reference: interactions.filter(i => i.type === 'reference'),
      outlineSuggestion: interactions.filter(i => i.type === 'outlineSuggestion'),
      noteLink: interactions.filter(i => i.type === 'noteLink'),
    };
  }, [interactions]);

  const groupedReferences = useMemo(() => {
    // Combine session references and interaction references
    const allReferences = [
      ...session.references.map(ref => ({ ...ref, isSessionRef: true, createdAt: session.startDateTime })),
      ...byType.reference.map((i: any) => ({ 
        label: i.label, 
        description: i.description, 
        url: i.url, 
        category: i.category || 'web',
        isSessionRef: false,
        createdAt: i.createdAt,
        authorId: i.authorId,
        id: i.id
      }))
    ];

    // Group by category
    const grouped: Record<ReferenceCategory, any[]> = {
      web: [],
      book: [],
      paper: []
    };

    allReferences.forEach(ref => {
      const category = ref.category || 'web';
      if (grouped[category]) {
        grouped[category].push(ref);
      }
    });

    // Sort each category by creation time (newest first)
    Object.keys(grouped).forEach(category => {
      grouped[category as ReferenceCategory].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });

    return grouped;
  }, [session.references, byType.reference, session.startDateTime]);

  return (
    <div className="space-y-6">
      {/* 返回與操作列 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('session.back')}
        </button>

        <div className="flex items-center gap-2">
          {canEditSession && (
            <button
              className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
              onClick={() => onEditSession?.(session)}
            >
              <Edit className="w-4 h-4 inline -mt-1 mr-1" /> {t('session.editSession')}
            </button>
          )}
          {canDeleteSession && (
            <button
              className="px-3 py-1 rounded border text-red-600 hover:bg-red-50"
              onClick={() => onDeleteSession?.(session)}
            >
              <Trash2 className="w-4 h-4 inline -mt-1 mr-1" /> {t('session.deleteSession')}
            </button>
          )}
        </div>
      </div>

      {/* 場次基本資訊 */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{session.scope}</h2>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {session.startDateTime}
          </span>
          <span className="inline-flex items-center gap-1">
            <UserIcon className="w-4 h-4" />
            {t('session.presenter')}: {getUserName(session.presenterId)}
          </span>
          <button 
            className="inline-flex items-center gap-1 hover:text-blue-600 transition-colors"
            onClick={() => setShowAttendeesModal(true)}
          >
            <Users className="w-4 h-4" />
            {t('session.attendees')}: {session.attendees?.length || 0}
          </button>
          <span className="inline-flex items-center gap-1">
            <FileText className="w-4 h-4" /> {topic.title}
          </span>
        </div>

        {session.outline && (
          <pre className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{session.outline}</pre>
        )}
      </div>

      {/* 筆記連結（Session.noteLinks + 互動 noteLink） */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4" />
            <h3 className="font-semibold text-gray-900">{t('interaction.noteLink')} ({session.noteLinks.length + byType.noteLink.length})</h3>
          </div>
          {onAddNoteLink && (
            <button
              onClick={onAddNoteLink}
              className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded hover:bg-blue-700"
              title={t('modal.newNoteLink')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        {(session.noteLinks.length > 0 || byType.noteLink.length > 0) ? (
          <ul className="space-y-2">
            {session.noteLinks.map((url, idx) => (
              <li key={`s-notelink-${idx}`} className="border-l-2 border-gray-300 pl-3">
                <a href={url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {url}
                </a>
                <div className="text-xs text-gray-400 mt-1">系統資料</div>
              </li>
            ))}
            {byType.noteLink.map((i: Interaction & { type: 'noteLink'; label: string; description: string; url: string; }) => (
              <li key={`i-notelink-${i.id}`} className="border-l-2 border-blue-200 pl-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <a href={i.url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                      {i.label}
                    </a>
                    {i.description && <span className="text-gray-500 ml-2">— {i.description}</span>}
                    <div className="text-xs text-gray-400 mt-1">
                      {getUserName(i.authorId)} • {formatDateTime(i.createdAt)}
                    </div>
                  </div>
                  {canPerformInteractionAction(currentUser, 'edit', i) && (
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={() => onEditInteraction?.(i)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="編輯"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDeleteInteraction?.(i)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="刪除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">{t('interaction.noContent')}</p>
        )}
      </div>

      {/* 參考資料（Session.references + 互動 reference） */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <h3 className="font-semibold text-gray-900">{t('interaction.reference')} ({session.references.length + byType.reference.length})</h3>
          </div>
          {onAddReference && (
            <button
              onClick={onAddReference}
              className="inline-flex items-center justify-center w-8 h-8 bg-green-600 text-white rounded hover:bg-green-700"
              title={t('modal.newReference')}
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
        {(session.references.length > 0 || byType.reference.length > 0) ? (
          <div className="space-y-4">
            {(['web', 'book', 'paper'] as ReferenceCategory[]).map(category => {
              const categoryRefs = groupedReferences[category];
              if (categoryRefs.length === 0) return null;

              return (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <span>{getCategoryIcon(category)}</span>
                    {getCategoryName(category)} ({categoryRefs.length})
                  </h4>
                  <ul className="space-y-2 ml-4">
                    {categoryRefs.map((ref, idx) => (
                      <li key={ref.isSessionRef ? `s-ref-${category}-${idx}` : `i-ref-${ref.id}`} className="border-l-2 border-green-200 pl-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <a href={ref.url} target="_blank" rel="noreferrer" className="text-green-600 hover:underline font-medium">
                              {ref.label}
                            </a>
                            {ref.description && <span className="text-gray-500 ml-2">— {ref.description}</span>}
                            <div className="text-xs text-gray-400 mt-1">
                              {ref.isSessionRef ? '系統資料' : `${getUserName(ref.authorId)} • ${formatDateTime(ref.createdAt)}`}
                            </div>
                          </div>
                          {!ref.isSessionRef && canPerformInteractionAction(currentUser, 'edit', { authorId: ref.authorId }) && (
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => {
                                  const interaction = byType.reference.find((i: any) => i.id === ref.id);
                                  if (interaction) onEditInteraction?.(interaction);
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="編輯"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  const interaction = byType.reference.find((i: any) => i.id === ref.id);
                                  if (interaction) onDeleteInteraction?.(interaction);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="刪除"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">{t('interaction.noContent')}</p>
        )}
      </div>

      {/* 問答 / 週記 / 講者回饋 / 大綱建議 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <h3 className="font-semibold">{t('interaction.question')} ({byType.question.length})</h3>
            </div>
            {onAddQuestion && (
              <button
                onClick={onAddQuestion}
                className="inline-flex items-center justify-center w-6 h-6 bg-orange-600 text-white rounded hover:bg-orange-700"
                title={t('modal.newQuestion')}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          {byType.question.length > 0 ? (
            <ul className="space-y-3">
              {byType.question.map(q => (
                <li key={q.id} className="border-l-2 border-orange-200 pl-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800">{(q as any).content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getUserName(q.authorId)} • {formatDateTime(q.createdAt)}
                      </div>
                    </div>
                    {canPerformInteractionAction(currentUser, 'edit', q) && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onEditInteraction?.(q)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="編輯"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteInteraction?.(q)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">{t('interaction.noContent')}</p>
          )}
        </section>

        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              <h3 className="font-semibold">{t('interaction.weeklyInsight')} ({byType.weeklyInsight.length})</h3>
            </div>
            {onAddInsight && (
              <button
                onClick={onAddInsight}
                className="inline-flex items-center justify-center w-6 h-6 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                title={t('modal.newInsight')}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          {byType.weeklyInsight.length > 0 ? (
            <ul className="space-y-3">
              {byType.weeklyInsight.map(w => (
                <li key={w.id} className="border-l-2 border-yellow-200 pl-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800">{(w as any).content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getUserName(w.authorId)} • {formatDateTime(w.createdAt)}
                      </div>
                    </div>
                    {canPerformInteractionAction(currentUser, 'edit', w) && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onEditInteraction?.(w)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="編輯"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteInteraction?.(w)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">{t('interaction.noContent')}</p>
          )}
        </section>

        <section className="bg-white border rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <h3 className="font-semibold">{t('interaction.speakerFeedback')} ({byType.speakerFeedback.length})</h3>
            </div>
            {onAddSpeakerFeedback && (
              <button
                onClick={onAddSpeakerFeedback}
                className="inline-flex items-center justify-center w-6 h-6 bg-red-600 text-white rounded hover:bg-red-700"
                title={t('modal.newFeedback')}
              >
                <Plus className="w-3 h-3" />
              </button>
            )}
          </div>
          {byType.speakerFeedback.length > 0 ? (
            <ul className="space-y-3">
              {byType.speakerFeedback.map(f => (
                <li key={f.id} className="border-l-2 border-red-200 pl-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800">{(f as any).content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getUserName(f.authorId)} • {formatDateTime(f.createdAt)}
                      </div>
                    </div>
                    {canPerformInteractionAction(currentUser, 'edit', f) && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onEditInteraction?.(f)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="編輯"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteInteraction?.(f)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">{t('interaction.noContent')}</p>
          )}
        </section>

        {!!byType.outlineSuggestion.length && (
          <section className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4" />
              <h3 className="font-semibold">大綱建議 ({byType.outlineSuggestion.length})</h3>
            </div>
            <ul className="space-y-3">
              {byType.outlineSuggestion.map(s => (
                <li key={s.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-gray-800">{(s as any).content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {getUserName(s.authorId)} • {formatDateTime(s.createdAt)}
                      </div>
                    </div>
                    {canPerformInteractionAction(currentUser, 'edit', s) && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onEditInteraction?.(s)}
                          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="編輯"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteInteraction?.(s)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="刪除"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* 出席者清單模態框 */}
      {showAttendeesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">場次出席狀況</h3>
              <button
                onClick={() => setShowAttendeesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded">
              <div className="font-medium text-gray-900">{session.scope}</div>
              <div className="text-sm text-gray-600">{session.startDateTime}</div>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-gray-700 mb-3">
                主題成員出席狀況：
              </div>
              
              {topic.attendees.map(memberId => {
                const isAttended = session.attendees?.includes(memberId) || false;
                return (
                  <div key={memberId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isAttended ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        <span className={`text-sm font-medium ${
                          isAttended ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {getUserName(memberId)[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-900">{getUserName(memberId)}</span>
                    </div>
                    <div className="flex items-center">
                      {isAttended ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <Check className="w-4 h-4" />
                          <span className="text-sm">已出席</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400">
                          <XIcon className="w-4 h-4" />
                          <span className="text-sm">未出席</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <div className="font-medium text-blue-800 mb-1">出席統計</div>
              <div className="text-blue-700">
                {t('session.attendees')}: {session.attendees?.length || 0} / 
                總成員：{topic.attendees.length} 人 
                ({Math.round(((session.attendees?.length || 0) / topic.attendees.length) * 100)}%)
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAttendeesModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetail;
