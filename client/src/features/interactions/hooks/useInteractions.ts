import { useCallback } from 'react';
import { useData } from '../../../context/DataContext';
import type { Interaction } from '../../../types';

export type InteractionType = 'question' | 'noteLink' | 'reference' | 'speakerFeedback' | 'weeklyInsight' | 'outlineSuggestion';

export const useInteractions = () => {
  const { 
    interactions,
    createInteraction: createInteractionService,
    loading, 
    error
  } = useData();

  const createInteraction = useCallback(async (
    type: InteractionType,
    sessionId: number,
    content: string,
    additionalData?: Record<string, any>
  ) => {
    const newInteraction = {
      id: interactions.length + 1,
      type,
      sessionId,
      authorId: additionalData?.authorId || 1,
      content,
      createdAt: new Date().toISOString(),
      ...additionalData
    } as Interaction;
    
    return await createInteractionService(newInteraction);
  }, [interactions.length, createInteractionService]);

  const updateInteraction = useCallback(async (interaction: Interaction) => {
    // This would require adding updateInteraction to DataService
    console.log('Update interaction:', interaction);
  }, []);

  const deleteInteraction = useCallback(async (id: number) => {
    // This would require adding deleteInteraction to DataService  
    console.log('Delete interaction:', id);
  }, []);

  const getInteractionsBySessionId = useCallback((sessionId: number) => {
    return interactions.filter(i => i.sessionId === sessionId);
  }, [interactions]);

  return {
    interactions,
    loading,
    error,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    getInteractionsBySessionId
  };
};