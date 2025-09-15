import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Interaction } from '../../../types';
import type { InteractionType } from '../hooks/useInteractions';
import { useTranslation } from '../../../context/LanguageContext';

type Props = {
  open: boolean;
  onClose: () => void;
  type: InteractionType;
  initialValue?: Interaction | null;
  onSubmit: (content: string, additionalData?: any) => Promise<void>;
};

const InteractionForm: React.FC<Props> = ({
  open,
  onClose,
  type,
  initialValue,
  onSubmit
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    content: '',
    label: '',
    description: '',
    url: '',
    category: 'web' as 'web' | 'book' | 'paper'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setFormData({
        content: (initialValue as any).content || '',
        label: (initialValue as any).label || '',
        description: (initialValue as any).description || '',
        url: (initialValue as any).url || '',
        category: (initialValue as any).category || 'web'
      });
    } else {
      setFormData({
        content: '',
        label: '',
        description: '',
        url: '',
        category: 'web'
      });
    }
  }, [initialValue, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (type === 'noteLink' || type === 'reference') {
        await onSubmit('', {
          label: formData.label,
          description: formData.description,
          url: formData.url,
          category: formData.category
        });
      } else {
        await onSubmit(formData.content);
      }
      onClose();
    } catch (error) {
      console.error('Error saving interaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    const titles: Record<InteractionType, string> = {
      question: initialValue ? t('modal.editQuestion') : t('modal.newQuestion'),
      noteLink: initialValue ? t('modal.editNoteLink') : t('modal.newNoteLink'),
      reference: initialValue ? t('modal.editReference') : t('modal.newReference'),
      speakerFeedback: initialValue ? t('modal.editSpeakerFeedback') : t('modal.newSpeakerFeedback'),
      weeklyInsight: initialValue ? t('modal.editWeeklyInsight') : t('modal.newWeeklyInsight'),
      outlineSuggestion: initialValue ? t('modal.editOutlineSuggestion') : t('modal.newOutlineSuggestion')
    };
    return titles[type];
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">{getTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(type === 'noteLink' || type === 'reference') ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.linkLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('form.linkLabelPlaceholder')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.linkDescription')} {type === 'reference' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={2}
                  required={type === 'reference'}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('form.linkDescriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('form.linkUrl')} *
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://"
                />
              </div>
              
              {type === 'reference' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.referenceCategory')} *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as 'web' | 'book' | 'paper' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="web">{t('form.referenceCategoryWeb')}</option>
                    <option value="book">{t('form.referenceCategoryBook')}</option>
                    <option value="paper">{t('form.referenceCategoryPaper')}</option>
                  </select>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.content')} *
              </label>
              <textarea
                required
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t('form.contentPlaceholder')}
              />
            </div>
          )}

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

export { InteractionForm };