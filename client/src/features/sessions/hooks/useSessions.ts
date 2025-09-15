import { useCallback } from 'react';
import { useData } from '../../../context/DataContext';
import type { Topic } from '../../../types';

type Session = Topic['sessions'][number];

export const useSessions = () => {
  const { 
    topics,
    updateTopic,
    loading, 
    error
  } = useData();

  const createSession = useCallback(async (topicId: number, sessionData: Omit<Session, 'id'>) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    const newSession = {
      id: Math.max(...topic.sessions.map(s => s.id), 0) + 1,
      ...sessionData,
      topicId
    } as Session;

    const updatedTopic = {
      ...topic,
      sessions: [...topic.sessions, newSession]
    };

    await updateTopic(updatedTopic);
    return newSession;
  }, [topics, updateTopic]);

  const updateSession = useCallback(async (topicId: number, sessionId: number, sessionData: Partial<Session>) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    const sessionIndex = topic.sessions.findIndex(s => s.id === sessionId);
    if (sessionIndex === -1) {
      throw new Error('Session not found');
    }

    const updatedSession = {
      ...topic.sessions[sessionIndex],
      ...sessionData
    };

    const updatedTopic = {
      ...topic,
      sessions: topic.sessions.map(s => s.id === sessionId ? updatedSession : s)
    };

    await updateTopic(updatedTopic);
    return updatedSession;
  }, [topics, updateTopic]);

  const deleteSession = useCallback(async (topicId: number, sessionId: number) => {
    const topic = topics.find(t => t.id === topicId);
    if (!topic) {
      throw new Error('Topic not found');
    }

    const updatedTopic = {
      ...topic,
      sessions: topic.sessions.filter(s => s.id !== sessionId)
    };

    await updateTopic(updatedTopic);
  }, [topics, updateTopic]);

  const getSessionsByTopicId = useCallback((topicId: number) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.sessions || [];
  }, [topics]);

  const getSessionById = useCallback((topicId: number, sessionId: number) => {
    const topic = topics.find(t => t.id === topicId);
    return topic?.sessions.find(s => s.id === sessionId);
  }, [topics]);

  return {
    sessions: topics.flatMap(t => t.sessions),
    loading,
    error,
    createSession,
    updateSession,
    deleteSession,
    getSessionsByTopicId,
    getSessionById
  };
};