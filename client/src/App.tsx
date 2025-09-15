import React from 'react'
import StudyGroupPlatform from './components/StudyGroupPlatform'
import { DataProvider } from './context/DataContext';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <StudyGroupPlatform />
      </DataProvider>
    </LanguageProvider>
  )
}
