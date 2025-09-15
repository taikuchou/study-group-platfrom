import { useCallback } from 'react';
import { useData } from '../../../context/DataContext';
import type { Topic } from '../../../types';

export const useTopics = () => {
  const { 
    topics, 
    loading, 
    error, 
    createTopic: createTopicService, 
    updateTopic: updateTopicService, 
    deleteTopic: deleteTopicService 
  } = useData();

  const createTopic = useCallback(async (topicData: Omit<Topic, 'id' | 'createdAt' | 'sessions'>) => {
    const newTopic = {
      id: topics.length + 1,
      ...topicData,
      createdAt: new Date().toISOString(),
      sessions: []
    } as Topic;
    
    return await createTopicService(newTopic);
  }, [topics.length, createTopicService]);

  const updateTopic = useCallback(async (topic: Topic) => {
    return await updateTopicService(topic);
  }, [updateTopicService]);

  const deleteTopic = useCallback(async (id: number) => {
    await deleteTopicService(id);
  }, [deleteTopicService]);

  return {
    topics,
    loading,
    error,
    createTopic,
    updateTopic,
    deleteTopic
  };
};