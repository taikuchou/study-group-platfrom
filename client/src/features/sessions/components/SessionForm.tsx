import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { User, Topic } from '../../../types';
import { useTranslation } from '../../../context/LanguageContext';

type Session = Topic['sessions'][number];

type Props = {
  open: boolean;
  onClose: () => void;
  initialValue?: Session | null;
  topic: Topic;
  users: User[];
  onSubmit: (value: Omit<Session, 'id' | 'topicId'>) => Promise<void>;
};

const SessionForm: React.FC<Props> = ({
  open,
  onClose,
  initialValue,
  topic,
  users,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    presenterId: 0,
    startDateTime: '',
    scope: '',
    outline: '',
    noteLinks: [] as string[],
    references: [] as string[],
    attendees: [] as number[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValue) {
      // Convert datetime for input (remove timezone info)
      const dateTime = new Date(initialValue.startDateTime);
      const localDateTime = new Date(dateTime.getTime() - dateTime.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      
      setFormData({
        presenterId: initialValue.presenterId,
        startDateTime: localDateTime,
        scope: initialValue.scope,
        outline: initialValue.outline,
        noteLinks: initialValue.noteLinks || [],
        references: initialValue.references || [],
        attendees: initialValue.attendees || []
      });
    } else {
      const now = new Date();
      const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 16);
      
      setFormData({
        presenterId: users[0]?.id || 0,
        startDateTime: localDateTime,
        scope: '',
        outline: '',
        noteLinks: [],
        references: [],
        attendees: []
      });
    }
  }, [initialValue, open, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        topicId: topic.id,
        startDateTime: formData.startDateTime.replace('T', ' ')
      });
      onClose();
    } catch (error) {
      console.error('Error saving session:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId]
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">
            {initialValue ? t('session.editSession') : t('session.newSession')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="font-medium text-gray-900">{topic.title}</div>
          <div className="text-sm text-gray-600">{topic.startDate} ~ {topic.endDate}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.scope')} *
            </label>
            <input
              type="text"
              required
              value={formData.scope}
              onChange={(e) => setFormData(prev => ({ ...prev, scope: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.scopePlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.startDateTime')} *
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startDateTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startDateTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.presenter')} *
            </label>
            <select
              required
              value={formData.presenterId}
              onChange={(e) => setFormData(prev => ({ ...prev, presenterId: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>{t('form.selectPresenter')}</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.outline')}
            </label>
            <textarea
              rows={4}
              value={formData.outline}
              onChange={(e) => setFormData(prev => ({ ...prev, outline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.sessionOutlinePlaceholder')}
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('form.attendees')}
            </label>
            <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 mb-2 last:mb-0">
                  <input
                    type="checkbox"
                    checked={formData.attendees.includes(user.id)}
                    onChange={() => toggleAttendee(user.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{user.name}</span>
                  <span className="text-xs text-gray-500">({user.email})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              {t('form.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('form.saving') : t('form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { SessionForm };