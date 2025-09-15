import { PrismaClient, UserRole, IntervalType, InteractionType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create only admin users
  const adminPassword = await bcrypt.hash('password', 12);
  
  // Default admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learning.com' },
    update: {
      name: 'Admin',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Admin',
      email: 'admin@learning.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {
      name: 'Alice Chen',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.ADMIN,
    },
    create: {
      name: 'Alice Chen',
      email: 'alice@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      role: UserRole.ADMIN,
    },
  });

  // Create topics
  const reactTopic = await prisma.topic.create({
    data: {
      title: 'React 進階開發',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-04-30'),
      intervalType: 'WEEKLY',
      outline: '深入學習 React 的進階概念，包括 Hook、Context、Performance 等',
      referenceUrls: ['https://reactjs.org', 'https://react.dev'],
      keywords: ['React', 'JavaScript', 'Frontend'],
      createdBy: alice.id,
    },
  });

  const aiTopic = await prisma.topic.create({
    data: {
      title: 'AI 與機器學習入門',
      startDate: new Date('2024-03-01'),
      endDate: new Date('2024-06-30'),
      intervalType: 'BIWEEKLY',
      outline: '從基礎概念開始學習人工智慧和機器學習',
      referenceUrls: ['https://scikit-learn.org', 'https://tensorflow.org'],
      keywords: ['AI', 'Machine Learning', 'Python'],
      createdBy: alice.id,
    },
  });

  // Create sessions for React topic
  const reactSession1 = await prisma.session.create({
    data: {
      topicId: reactTopic.id,
      presenterId: alice.id,
      startDateTime: new Date('2024-02-05T19:00:00'),
      scope: 'React Hooks 深入解析',
      outline: '探討 useState, useEffect, useContext 等核心 Hooks 的使用技巧',
      noteLinks: ['https://github.com/alice/react-hooks-demo'],
      references: [],
    },
  });

  const reactSession2 = await prisma.session.create({
    data: {
      topicId: reactTopic.id,
      presenterId: admin.id,
      startDateTime: new Date('2024-02-12T19:00:00'),
      scope: 'React Performance 優化',
      outline: '使用 useMemo, useCallback, React.memo 等技術優化應用效能',
      noteLinks: [],
      references: [],
    },
  });

  // Create sessions for AI topic
  const aiSession1 = await prisma.session.create({
    data: {
      topicId: aiTopic.id,
      presenterId: admin.id,
      startDateTime: new Date('2024-03-05T19:00:00'),
      scope: 'AI 基礎概念介紹',
      outline: '機器學習、深度學習、神經網路等基本概念說明',
      noteLinks: [],
      references: [],
    },
  });

  // Create interactions for sessions
  await prisma.interaction.create({
    data: {
      type: 'QUESTION',
      sessionId: reactSession1.id,
      authorId: admin.id,
      content: 'useState 和 useReducer 什麼時候使用比較適合？',
    },
  });

  await prisma.interaction.create({
    data: {
      type: 'WEEKLY_INSIGHT',
      sessionId: reactSession1.id,
      authorId: alice.id,
      content: '這週學習到 React Hooks 的組合使用可以讓程式碼更簡潔易懂',
    },
  });

  await prisma.interaction.create({
    data: {
      type: 'NOTE_LINK',
      sessionId: reactSession1.id,
      authorId: alice.id,
      label: 'React Hooks 官方文件',
      description: '詳細的 Hooks 使用指南',
      url: 'https://react.dev/reference/react',
    },
  });

  await prisma.interaction.create({
    data: {
      type: 'REFERENCE',
      sessionId: reactSession2.id,
      authorId: admin.id,
      label: 'React Performance 最佳實務',
      description: '效能優化的完整指南',
      url: 'https://react.dev/learn/render-and-commit',
    },
  });

  await prisma.interaction.create({
    data: {
      type: 'SPEAKER_FEEDBACK',
      sessionId: aiSession1.id,
      authorId: alice.id,
      content: 'AI 概念解釋得很清楚，建議可以加入更多實際案例',
    },
  });

  console.log('Database has been seeded with admin users, topics, sessions, and interactions!');
  console.log('Admin users created:');
  console.log('- admin@learning.com (password: password)');
  console.log('- alice@example.com (password: password123)');
  console.log('Topics created:');
  console.log('- React 進階開發');
  console.log('- AI 與機器學習入門');
  console.log('Sessions created:');
  console.log('- React Hooks 深入解析');
  console.log('- React Performance 優化');
  console.log('- AI 基礎概念介紹');
  console.log('Interactions created: 5 sample interactions');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });