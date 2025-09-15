import zhTW from './zh-TW.json';
import en from './en.json';
import ja from './ja.json';
import ko from './ko.json';
import es from './es.json';
import fr from './fr.json';

export type Language = 'zh-TW' | 'en' | 'ja' | 'ko' | 'es' | 'fr';

export const languages: Record<Language, any> = {
  'zh-TW': zhTW,
  'en': en,
  'ja': ja,
  'ko': ko,
  'es': es,
  'fr': fr
};

export const languageNames: Record<Language, string> = {
  'zh-TW': '繁體中文',
  'en': 'English',
  'ja': '日本語',
  'ko': '한국어',
  'es': 'Español',
  'fr': 'Français'
};

export const defaultLanguage: Language = 'zh-TW';