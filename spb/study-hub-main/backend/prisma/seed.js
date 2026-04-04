import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create subjects
    const subjects = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
        'Literature', 'History', 'Economics', 'Psychology', 'Engineering',
        'Philosophy', 'Art & Design'
    ];

    for (const name of subjects) {
        await prisma.subject.upsert({
            where: { name },
            update: {},
            create: { name }
        });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@eduvault.com' },
        update: {},
        create: {
            name: 'Admin',
            email: 'admin@eduvault.com',
            password: hashedPassword,
            role: 'admin'
        }
    });

    // Create sample users
    const users = [
        { name: 'Alex Johnson', email: 'alex@example.com' },
        { name: 'Priya Sharma', email: 'priya@example.com' },
        { name: 'Carlos Mendez', email: 'carlos@example.com' }
    ];

    for (const user of users) {
        const hashedPwd = await bcrypt.hash('password123', 10);
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: {
                name: user.name,
                email: user.email,
                password: hashedPwd,
                role: 'user'
            }
        });
    }

    // Create resources
    const resources = [
        {
            id: '1',
            title: 'Introduction to Linear Algebra',
            description: 'A comprehensive textbook covering vectors, matrices, determinants, eigenvalues, and linear transformations with real-world applications.',
            author: 'Dr. Sarah Mitchell',
            type: 'textbook',
            subject: 'Mathematics',
            gradeLevel: 'Undergraduate',
            rating: 4.8,
            reviewCount: 234,
            downloadCount: 12500,
            tags: JSON.stringify(['algebra', 'linear algebra', 'matrices']),
            fileSize: '45 MB',
            uploadDate: '2025-12-15',
            language: 'English'
        },
        {
            id: '2',
            title: 'Quantum Computing: A Modern Approach',
            description: 'Cutting-edge research paper exploring quantum algorithms, qubit manipulation, and practical quantum computing applications.',
            author: 'Prof. James Chen',
            type: 'research_paper',
            subject: 'Computer Science',
            gradeLevel: 'Graduate',
            rating: 4.6,
            reviewCount: 89,
            downloadCount: 4200,
            tags: JSON.stringify(['quantum', 'computing', 'algorithms']),
            fileSize: '12 MB',
            uploadDate: '2026-01-20',
            language: 'English'
        },
        {
            id: '3',
            title: 'Organic Chemistry Study Guide',
            description: 'Essential study guide with practice problems, reaction mechanisms, and molecular structure visualizations.',
            author: 'Dr. Maria Rodriguez',
            type: 'study_guide',
            subject: 'Chemistry',
            gradeLevel: 'Undergraduate',
            rating: 4.9,
            reviewCount: 567,
            downloadCount: 28300,
            tags: JSON.stringify(['organic chemistry', 'reactions', 'study guide']),
            fileSize: '32 MB',
            uploadDate: '2025-11-08',
            language: 'English'
        },
        {
            id: '4',
            title: 'Machine Learning Fundamentals',
            description: 'Video lecture series covering supervised learning, neural networks, deep learning, and practical ML implementations.',
            author: 'Dr. Alan Park',
            type: 'video',
            subject: 'Computer Science',
            gradeLevel: 'Graduate',
            rating: 4.7,
            reviewCount: 312,
            downloadCount: 15800,
            tags: JSON.stringify(['machine learning', 'AI', 'neural networks']),
            fileSize: '2.1 GB',
            uploadDate: '2026-02-01',
            language: 'English'
        },
        {
            id: '5',
            title: 'World History: Ancient Civilizations',
            description: 'Comprehensive textbook exploring Mesopotamia, Egypt, Greece, Rome, and their lasting impact on modern society.',
            author: 'Prof. Elizabeth Warren',
            type: 'textbook',
            subject: 'History',
            gradeLevel: 'High School',
            rating: 4.5,
            reviewCount: 178,
            downloadCount: 9400,
            tags: JSON.stringify(['history', 'ancient', 'civilizations']),
            fileSize: '67 MB',
            uploadDate: '2025-10-22',
            language: 'English'
        },
        {
            id: '6',
            title: 'Statistical Methods in Psychology',
            description: 'Research paper on modern statistical techniques used in psychological research and behavioral analysis.',
            author: 'Dr. Robert Kim',
            type: 'research_paper',
            subject: 'Psychology',
            gradeLevel: 'Graduate',
            rating: 4.3,
            reviewCount: 65,
            downloadCount: 3100,
            tags: JSON.stringify(['psychology', 'statistics', 'research methods']),
            fileSize: '8 MB',
            uploadDate: '2026-01-05',
            language: 'English'
        },
        {
            id: '7',
            title: 'Classical Mechanics Explained',
            description: 'Study guide with solved problems covering Newtonian mechanics, Lagrangian and Hamiltonian formulations.',
            author: 'Prof. David Liu',
            type: 'study_guide',
            subject: 'Physics',
            gradeLevel: 'Undergraduate',
            rating: 4.7,
            reviewCount: 421,
            downloadCount: 19200,
            tags: JSON.stringify(['physics', 'mechanics', 'Newton']),
            fileSize: '28 MB',
            uploadDate: '2025-09-30',
            language: 'English'
        },
        {
            id: '8',
            title: 'Microeconomics: Theory & Practice',
            description: 'In-depth article exploring supply-demand dynamics, market structures, and consumer behavior theory.',
            author: 'Dr. Anna Thompson',
            type: 'article',
            subject: 'Economics',
            gradeLevel: 'Undergraduate',
            rating: 4.4,
            reviewCount: 142,
            downloadCount: 7600,
            tags: JSON.stringify(['economics', 'microeconomics', 'markets']),
            fileSize: '5 MB',
            uploadDate: '2025-12-01',
            language: 'English'
        },
        {
            id: '9',
            title: 'Molecular Biology of the Cell',
            description: 'Comprehensive textbook with stunning illustrations covering cell structure, genetics, and molecular processes.',
            author: 'Dr. Patricia Nguyen',
            type: 'textbook',
            subject: 'Biology',
            gradeLevel: 'Undergraduate',
            rating: 4.9,
            reviewCount: 689,
            downloadCount: 35600,
            tags: JSON.stringify(['biology', 'molecular', 'cells', 'genetics']),
            fileSize: '120 MB',
            uploadDate: '2025-08-15',
            language: 'English'
        }
    ];

    for (const resource of resources) {
        await prisma.resource.upsert({
            where: { id: resource.id },
            update: {},
            create: resource
        });
    }

    // Get user IDs for reviews
    const alex = await prisma.user.findUnique({ where: { email: 'alex@example.com' } });
    const priya = await prisma.user.findUnique({ where: { email: 'priya@example.com' } });
    const carlos = await prisma.user.findUnique({ where: { email: 'carlos@example.com' } });

    // Create reviews
    const reviews = [
        {
            id: '1',
            resourceId: '1',
            userId: alex?.id,
            userName: 'Alex Johnson',
            rating: 5,
            comment: 'Excellent textbook! Very clear explanations and great examples.',
            date: '2026-02-10',
            helpful: 24,
            unhelpful: 1
        },
        {
            id: '2',
            resourceId: '1',
            userId: priya?.id,
            userName: 'Priya Sharma',
            rating: 4,
            comment: 'Good resource, but could use more practice problems.',
            date: '2026-02-05',
            helpful: 12,
            unhelpful: 3
        },
        {
            id: '3',
            resourceId: '3',
            userId: carlos?.id,
            userName: 'Carlos Mendez',
            rating: 5,
            comment: 'This study guide saved my semester! Highly recommend.',
            date: '2026-01-28',
            helpful: 45,
            unhelpful: 0
        }
    ];

    for (const review of reviews) {
        if (review.userId) {
            await prisma.review.upsert({
                where: { id: review.id },
                update: {},
                create: review
            });
        }
    }

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
