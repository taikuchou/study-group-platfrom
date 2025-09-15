"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const hashedPassword = await bcryptjs_1.default.hash('password123', 12);
    const alice = await prisma.user.create({
        data: {
            name: 'Alice Chen',
            email: 'alice@example.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.ADMIN,
        },
    });
    const bob = await prisma.user.create({
        data: {
            name: 'Bob Lin',
            email: 'bob@example.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.USER,
        },
    });
    const carol = await prisma.user.create({
        data: {
            name: 'Carol Wu',
            email: 'carol@example.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.USER,
        },
    });
    const david = await prisma.user.create({
        data: {
            name: 'David Chang',
            email: 'david@example.com',
            passwordHash: hashedPassword,
            role: client_1.UserRole.USER,
        },
    });
    const reactTopic = await prisma.topic.create({
        data: {
            title: 'React 進階開發',
            startDate: new Date('2024-02-01'),
            endDate: new Date('2024-04-30'),
            intervalType: client_1.IntervalType.WEEKLY,
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
            intervalType: client_1.IntervalType.BIWEEKLY,
            outline: '從基礎概念開始學習人工智慧和機器學習',
            referenceUrls: ['https://scikit-learn.org', 'https://tensorflow.org'],
            keywords: ['AI', 'Machine Learning', 'Python'],
            createdBy: alice.id,
        },
    });
    await prisma.topicAttendee.createMany({
        data: [
            { topicId: reactTopic.id, userId: alice.id },
            { topicId: reactTopic.id, userId: bob.id },
            { topicId: reactTopic.id, userId: carol.id },
            { topicId: aiTopic.id, userId: alice.id },
            { topicId: aiTopic.id, userId: carol.id },
            { topicId: aiTopic.id, userId: david.id },
        ],
    });
    const session1 = await prisma.session.create({
        data: {
            topicId: reactTopic.id,
            presenterId: bob.id,
            startDateTime: new Date('2024-02-08 19:00'),
            scope: 'React Hooks 基礎',
            outline: 'useState, useEffect 的深入使用',
            noteLinks: [],
            references: [],
        },
    });
    const session2 = await prisma.session.create({
        data: {
            topicId: reactTopic.id,
            presenterId: carol.id,
            startDateTime: new Date('2024-02-15 19:00'),
            scope: 'Custom Hooks',
            outline: '如何建立和使用自定義 Hook',
            noteLinks: [],
            references: [],
        },
    });
    const session3 = await prisma.session.create({
        data: {
            topicId: aiTopic.id,
            presenterId: david.id,
            startDateTime: new Date('2024-03-07 19:00'),
            scope: 'AI 基礎概念',
            outline: '什麼是人工智慧？機器學習 vs 深度學習',
            noteLinks: [],
            references: [],
        },
    });
    await prisma.sessionAttendee.createMany({
        data: [
            { sessionId: session1.id, userId: alice.id },
            { sessionId: session1.id, userId: bob.id },
            { sessionId: session1.id, userId: carol.id },
            { sessionId: session2.id, userId: alice.id },
            { sessionId: session2.id, userId: bob.id },
            { sessionId: session2.id, userId: carol.id },
            { sessionId: session3.id, userId: alice.id },
            { sessionId: session3.id, userId: carol.id },
            { sessionId: session3.id, userId: david.id },
        ],
    });
    await prisma.interaction.createMany({
        data: [
            {
                type: client_1.InteractionType.QUESTION,
                sessionId: session1.id,
                authorId: carol.id,
                content: 'useEffect 的 dependency array 為空時會發生什麼？',
            },
            {
                type: client_1.InteractionType.NOTE_LINK,
                sessionId: session1.id,
                authorId: bob.id,
                label: 'React Hooks 官方文件',
                description: '官方 Hook 使用指南',
                url: 'https://react.dev/reference/react',
            },
            {
                type: client_1.InteractionType.WEEKLY_INSIGHT,
                sessionId: session1.id,
                authorId: alice.id,
                content: '這週學到了 Hook 的執行順序很重要，不能在條件語句中使用。',
            },
        ],
    });
    console.log('Database has been seeded successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map