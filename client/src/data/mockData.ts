import { User, Topic, Session, Interaction, ReferenceLink, ReferenceCategory } from "../types";

export const mockUsers: User[] = [
  {
    id: 1,
    name: "Alice Chen",
    email: "alice@example.com",
    role: "admin",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Bob Lin",
    email: "bob@example.com",
    role: "user",
    createdAt: "2024-01-16",
  },
  {
    id: 3,
    name: "Carol Wu",
    email: "carol@example.com",
    role: "user",
    createdAt: "2024-01-17",
  },
  {
    id: 4,
    name: "David Chang",
    email: "david@example.com",
    role: "user",
    createdAt: "2024-01-18",
  },
];

export const mockTopics: Topic[] = [
  {
    id: 1,
    title: "React 進階開發",
    startDate: "2024-02-01",
    endDate: "2024-04-30",
    intervalType: "WEEKLY",
    outline: "深入學習 React 的進階概念，包括 Hook、Context、Performance 等",
    referenceUrls: ["https://reactjs.org", "https://react.dev"],
    keywords: ["React", "JavaScript", "Frontend"],
    attendees: [1, 2, 3],
    createdBy: 1,
    createdAt: "2024-01-20",
    sessions: [
      {
        id: 1,
        topicId: 1,
        presenterId: 2,
        startDateTime: "2024-02-08 19:00",
        scope: "React Hooks 基礎",
        outline: "useState, useEffect 的深入使用",
        noteLinks: [],
        references: [],
        attendees: [1, 2, 3],
      },
      {
        id: 2,
        topicId: 1,
        presenterId: 3,
        startDateTime: "2024-02-15 19:00",
        scope: "Custom Hooks",
        outline: "如何建立和使用自定義 Hook",
        noteLinks: [],
        references: [],
        attendees: [1, 2, 3],
      },
    ],
  },
  {
    id: 2,
    title: "AI 與機器學習入門",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    intervalType: "BIWEEKLY",
    outline: "從基礎概念開始學習人工智慧和機器學習",
    referenceUrls: ["https://scikit-learn.org", "https://tensorflow.org"],
    keywords: ["AI", "Machine Learning", "Python"],
    attendees: [1, 3, 4],
    createdBy: 1,
    createdAt: "2024-02-25",
    sessions: [
      {
        id: 3,
        topicId: 2,
        presenterId: 4,
        startDateTime: "2024-03-07 19:00",
        scope: "AI 基礎概念",
        outline: "什麼是人工智慧？機器學習 vs 深度學習",
        noteLinks: [],
        references: [],
        attendees: [1, 3, 4],
      },
    ],
  },
];

export const mockSessions: Session[] = [
  {
    id: 1,
    topicId: 1,
    presenterId: 2,
    startDateTime: "2024-02-08 19:00",
    scope: "React Hooks 基礎",
    outline: "useState, useEffect 的深入使用",
    noteLinks: [],
    references: [
      {
        label: "React 官方文檔 - Hooks",
        description: "官方 Hook 使用指南和最佳實踐",
        url: "https://react.dev/reference/react",
        category: "web" as ReferenceCategory
      },
      {
        label: "學習 React - 第二版",
        description: "React 學習必備書籍，涵蓋 Hooks 和現代最佳實踐",
        url: "https://www.books.com.tw/products/react-learning",
        category: "book" as ReferenceCategory
      }
    ],
    attendees: [1, 2, 3],
  },
  {
    id: 2,
    topicId: 1,
    presenterId: 3,
    startDateTime: "2024-02-15 19:00",
    scope: "Custom Hooks",
    outline: "如何建立和使用自定義 Hook",
    noteLinks: [],
    references: [
      {
        label: "Custom Hooks 指南",
        description: "深入了解如何建立自定義 Hook",
        url: "https://react.dev/learn/reusing-logic-with-custom-hooks",
        category: "web" as ReferenceCategory
      },
      {
        label: "React Hooks 論文集",
        description: "學術論文：重用性和狀態管理的新範式",
        url: "https://doi.org/10.1145/react-hooks-2023",
        category: "paper" as ReferenceCategory
      }
    ],
    attendees: [1, 2, 3],
  },
  {
    id: 3,
    topicId: 2,
    presenterId: 4,
    startDateTime: "2024-03-07 19:00",
    scope: "AI 基礎概念",
    outline: "什麼是人工智慧？機器學習 vs 深度學習",
    noteLinks: [],
    references: [
      {
        label: "機器學習基礎",
        description: "AI 和機器學習的基本概念介紹",
        url: "https://scikit-learn.org/stable/tutorial/basic/tutorial.html",
        category: "web" as ReferenceCategory
      },
      {
        label: "人工智慧：現代方法",
        description: "機器學習和深度學習的系統性介紹",
        url: "https://www.books.com.tw/products/ai-modern-approach",
        category: "book" as ReferenceCategory
      }
    ],
    attendees: [1, 3, 4],
  },
];

export const mockInteractions: Interaction[] = [
  {
    id: 1,
    type: "question",
    sessionId: 1,
    authorId: 3,
    content: "useEffect 的 dependency array 為空時會發生什麼？",
    createdAt: "2024-02-08 19:30",
  },
  {
    id: 2,
    type: "noteLink",
    sessionId: 1,
    authorId: 2,
    label: "React Hooks 官方文件",
    description: "官方 Hook 使用指南",
    url: "https://react.dev/reference/react",
    createdAt: "2024-02-08 20:00",
  },
  {
    id: 3,
    type: "weeklyInsight",
    sessionId: 1,
    authorId: 1,
    content: "這週學到了 Hook 的執行順序很重要，不能在條件語句中使用。",
    createdAt: "2024-02-09 10:00",
  },
  {
    id: 4,
    type: "reference",
    sessionId: 1,
    authorId: 3,
    label: "React 測試工具庫",
    description: "如何測試 React Hook 組件",
    url: "https://testing-library.com/docs/react-testing-library/intro/",
    category: "web" as ReferenceCategory,
    createdAt: "2024-02-08 21:00",
  },
  {
    id: 6,
    type: "reference",
    sessionId: 1,
    authorId: 2,
    label: "React 深入淺出",
    description: "React 技術的全面指南書籍",
    url: "https://www.books.com.tw/products/react-deep-dive",
    category: "book" as ReferenceCategory,
    createdAt: "2024-02-08 22:00",
  },
  {
    id: 5,
    type: "reference",
    sessionId: 2,
    authorId: 4,
    label: "useHooks.ts 實例庫",
    description: "現成的 Custom Hook 實例庫",
    url: "https://usehooks-ts.com/",
    category: "web" as ReferenceCategory,
    createdAt: "2024-02-15 20:30",
  },
  {
    id: 7,
    type: "reference",
    sessionId: 2,
    authorId: 3,
    label: "Custom Hooks 設計模式",
    description: "學術研究：React Hooks 的設計模式與最佳實踐",
    url: "https://doi.org/10.1109/TSE.2023.hooks-patterns",
    category: "paper" as ReferenceCategory,
    createdAt: "2024-02-15 21:15",
  },
];
