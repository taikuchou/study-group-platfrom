import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { User, Topic } from '../../../types';
import { useTranslation } from '../../../context/LanguageContext';

type Props = {
  open: boolean;
  onClose: () => void;
  initialValue?: Topic | null;
  users: User[];
  currentUser: User;
  onSubmit: (value: Omit<Topic, 'id' | 'createdAt' | 'sessions'>) => Promise<void>;
};

const TopicForm: React.FC<Props> = ({
  open,
  onClose,
  initialValue,
  users,
  currentUser,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    startDate: '',
    endDate: '',
    intervalType: 'WEEKLY' as 'WEEKLY' | 'BIWEEKLY',
    outline: '',
    referenceUrls: [''],
    keywords: [''],
    attendees: [] as number[]
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setFormData({
        title: initialValue.title,
        startDate: initialValue.startDate,
        endDate: initialValue.endDate,
        intervalType: initialValue.intervalType,
        outline: initialValue.outline,
        referenceUrls: initialValue.referenceUrls.length > 0 ? initialValue.referenceUrls : [''],
        keywords: initialValue.keywords.length > 0 ? initialValue.keywords : [''],
        attendees: initialValue.attendees || []
      });
    } else {
      setFormData({
        title: '',
        startDate: '',
        endDate: '',
        intervalType: 'WEEKLY',
        outline: '',
        referenceUrls: [''],
        keywords: [''],
        attendees: []
      });
    }
  }, [initialValue, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit({
        ...formData,
        referenceUrls: formData.referenceUrls.filter(url => url.trim() !== ''),
        keywords: formData.keywords.filter(keyword => keyword.trim() !== ''),
        createdBy: currentUser.id
      });
      onClose();
    } catch (error) {
      console.error('Error saving topic:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReferenceUrl = () => {
    setFormData(prev => ({
      ...prev,
      referenceUrls: [...prev.referenceUrls, '']
    }));
  };

  const removeReferenceUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceUrls: prev.referenceUrls.filter((_, i) => i !== index)
    }));
  };

  const updateReferenceUrl = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      referenceUrls: prev.referenceUrls.map((url, i) => i === index ? value : url)
    }));
  };

  const addKeyword = () => {
    setFormData(prev => ({
      ...prev,
      keywords: [...prev.keywords, '']
    }));
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter((_, i) => i !== index)
    }));
  };

  const updateKeyword = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.map((keyword, i) => i === index ? value : keyword)
    }));
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
            {initialValue ? t('topic.editTopic') : t('topic.newTopic')}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.title')} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.titlePlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.startDate')} *
              </label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.endDate')} *
              </label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.intervalType')} *
            </label>
            <select
              value={formData.intervalType}
              onChange={(e) => setFormData(prev => ({ ...prev, intervalType: e.target.value as 'WEEKLY' | 'BIWEEKLY' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="WEEKLY">{t('form.weekly')}</option>
              <option value="BIWEEKLY">{t('form.biweekly')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('form.outline')}
            </label>
            <textarea
              rows={3}
              value={formData.outline}
              onChange={(e) => setFormData(prev => ({ ...prev, outline: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t('form.outlinePlaceholder')}
            />
          </div>

          {/* Reference URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('form.referenceUrls')}
              </label>
              <button
                type="button"
                onClick={addReferenceUrl}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t('form.addUrl')}
              </button>
            </div>
            {formData.referenceUrls.map((url, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => updateReferenceUrl(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://..."
                />
                {formData.referenceUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReferenceUrl(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Keywords */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('form.keywords')}
              </label>
              <button
                type="button"
                onClick={addKeyword}
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                <Plus className="w-4 h-4 inline mr-1" />
                {t('form.addKeyword')}
              </button>
            </div>
            {formData.keywords.map((keyword, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => updateKeyword(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('form.keywordPlaceholder')}
                />
                {formData.keywords.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeKeyword(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
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

export { TopicForm };