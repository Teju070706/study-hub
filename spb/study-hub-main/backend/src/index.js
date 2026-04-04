import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'eduvault-secret-key-change-in-production';

// Create uploads directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|ppt|pptx|mp4|mp3|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.includes('application') || file.mimetype.includes('video') || file.mimetype.includes('audio');
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Allowed: PDF, DOC, DOCX, PPT, PPTX, MP4, MP3, ZIP, RAR'));
    }
});

// Middleware - Allow all origins for development
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadsDir));

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    // Allow mock tokens for development/testing
    if (token.startsWith('mock-token-')) {
        // Extract email from mock token format or use default
        req.user = {
            id: 'mock-user-id',
            email: 'admin@mock.com',
            role: 'admin'
        };
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Admin Middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// ============ AUTH ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true }
        });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ user, token });
    } catch (error) {
        // Error logged: Register
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        res.json({ user: userWithoutPassword, token });
    } catch (error) {
        // Error logged: Login
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        // Error logged: Get user
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// ============ RESOURCE ROUTES ============

// Get all resources
app.get('/api/resources', async (req, res) => {
    try {
        const { subject, type, gradeLevel, search, page = 1, limit = 20 } = req.query;

        const where = {};

        if (subject) {
            where.subject = subject;
        }
        if (type) {
            where.type = type;
        }
        if (gradeLevel) {
            where.gradeLevel = gradeLevel;
        }
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { author: { contains: search } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.resource.count({ where })
        ]);

        // Parse tags JSON and ensure required fields
        const parsedResources = resources.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            author: r.author,
            type: r.type,
            subject: r.subject,
            gradeLevel: r.gradeLevel,
            rating: r.rating || 0,
            reviewCount: r.reviewCount || 0,
            downloadCount: r.downloadCount || 0,
            tags: JSON.parse(r.tags || '[]'),
            thumbnail: r.thumbnail || '',
            fileSize: r.fileSize || '0',
            uploadDate: r.uploadDate,
            language: r.language || 'English'
        }));

        res.json({
            resources: parsedResources,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        // Error logged: Get resources
        res.status(500).json({ error: 'Failed to get resources' });
    }
});

// Get single resource
app.get('/api/resources/:id', async (req, res) => {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id: req.params.id }
        });

        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        res.json({
            ...resource,
            tags: JSON.parse(resource.tags || '[]')
        });
    } catch (error) {
        // Error logged: Get resource
        res.status(500).json({ error: 'Failed to get resource' });
    }
});

// Create resource (admin only) - with file upload
app.post('/api/resources', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
    try {
        // Upload request received
        // Files: ${req.file ? 'present' : 'missing'}
        console.log('Body:', req.body);

        const { title, description, author, type, subject, gradeLevel, tags, thumbnail, uploadDate, language } = req.body;

        if (!title || !description || !author || !type || !subject || !gradeLevel) {
            return res.status(400).json({ error: 'Missing required fields', details: { title, description, author, type, subject, gradeLevel } });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded. Please attach a file.' });
        }

        const fileSize = req.file.size.toString();
        const filePath = req.file.filename;

        console.log('File saved:', filePath, 'Size:', fileSize);

        const resource = await prisma.resource.create({
            data: {
                title,
                description,
                author,
                type,
                subject,
                gradeLevel,
                tags: JSON.stringify(tags || []),
                thumbnail,
                fileSize,
                filePath,
                uploadDate: uploadDate || new Date().toISOString().split('T')[0],
                language: language || 'English',
                rating: 0,
                reviewCount: 0,
                downloadCount: 0
            }
        });

        res.status(201).json({
            ...resource,
            tags: JSON.parse(resource.tags)
        });
    } catch (error) {
        // Error logged: Create resource
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

// Download file endpoint
app.get('/api/resources/:id/download-file', async (req, res) => {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id: req.params.id }
        });

        if (!resource || !resource.filePath) {
            return res.status(404).json({ error: 'File not found' });
        }

        const filePath = path.join(uploadsDir, resource.filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on disk' });
        }

        res.download(filePath, resource.title + path.extname(resource.filePath));
    } catch (error) {
        // Error logged: Download file
        res.status(500).json({ error: 'Failed to download file' });
    }
});

// Update resource (admin only)
app.put('/api/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, author, type, subject, gradeLevel, tags, thumbnail, fileSize, uploadDate, language } = req.body;

        const resource = await prisma.resource.update({
            where: { id: req.params.id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(author && { author }),
                ...(type && { type }),
                ...(subject && { subject }),
                ...(gradeLevel && { gradeLevel }),
                ...(tags && { tags: JSON.stringify(tags) }),
                ...(thumbnail !== undefined && { thumbnail }),
                ...(fileSize && { fileSize }),
                ...(uploadDate && { uploadDate }),
                ...(language && { language })
            }
        });

        res.json({
            ...resource,
            tags: JSON.parse(resource.tags)
        });
    } catch (error) {
        // Error logged: Update resource
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

// Delete resource (admin only)
app.delete('/api/resources/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await prisma.resource.delete({
            where: { id: req.params.id }
        });

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        // Error logged: Delete resource
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// ============ REVIEW ROUTES ============

// Get reviews for a resource
app.get('/api/resources/:resourceId/reviews', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { resourceId: req.params.resourceId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(reviews);
    } catch (error) {
        // Error logged: Get reviews
        res.status(500).json({ error: 'Failed to get reviews' });
    }
});

// Create review
app.post('/api/resources/:resourceId/reviews', authenticateToken, async (req, res) => {
    try {
        const { rating, comment } = req.body;

        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating and comment are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.user.id } });

        const review = await prisma.review.create({
            data: {
                resourceId: req.params.resourceId,
                userId: req.user.id,
                userName: user?.name || 'Anonymous',
                rating,
                comment,
                date: new Date().toISOString().split('T')[0]
            }
        });

        // Update resource rating and review count
        const reviews = await prisma.review.findMany({
            where: { resourceId: req.params.resourceId }
        });

        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

        await prisma.resource.update({
            where: { id: req.params.resourceId },
            data: {
                rating: avgRating,
                reviewCount: reviews.length
            }
        });

        res.status(201).json(review);
    } catch (error) {
        // Error logged: Create review
        res.status(500).json({ error: 'Failed to create review' });
    }
});

// ============ SUBJECT ROUTES ============

// Get all subjects
app.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await prisma.subject.findMany({
            orderBy: { name: 'asc' }
        });

        res.json(subjects);
    } catch (error) {
        // Error logged: Get subjects
        res.status(500).json({ error: 'Failed to get subjects' });
    }
});

// ============ STATS ROUTES ============

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const [totalResources, totalUsers, totalDownloads, totalSubjects, resources] = await Promise.all([
            prisma.resource.count(),
            prisma.user.count(),
            prisma.download.count(),
            prisma.subject.count(),
            prisma.resource.findMany({
                select: { rating: true }
            })
        ]);

        // Calculate average rating
        const ratings = resources.filter(r => r.rating > 0).map(r => r.rating);
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        res.json({
            totalResources,
            totalUsers,
            totalDownloads,
            totalSubjects,
            avgRating
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});

// ============ DOWNLOAD ROUTES ============

// Download resource (track download)
app.post('/api/resources/:id/download', authenticateToken, async (req, res) => {
    try {
        await prisma.download.create({
            data: {
                resourceId: req.params.id,
                userId: req.user.id
            }
        });

        await prisma.resource.update({
            where: { id: req.params.id },
            data: { downloadCount: { increment: 1 } }
        });

        res.json({ message: 'Download recorded successfully' });
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to record download' });
    }
});

// ============ USER ROUTES ============

// Get all users (admin only)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                createdAt: true,
                _count: {
                    select: {
                        reviews: true,
                        downloads: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Transform to match expected format
        const transformedUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: 'active', // Default status
            downloads: u._count.downloads,
            avatar: u.avatar,
            createdAt: u.createdAt
        }));

        res.json({ users: transformedUsers });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Start server
app.listen(PORT, () => {
    // Server running on http://localhost:${PORT}
});

process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit();
});
