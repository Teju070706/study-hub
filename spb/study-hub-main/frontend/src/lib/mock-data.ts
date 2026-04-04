export interface Resource {
  id: string;
  title: string;
  description: string;
  author: string;
  type: 'textbook' | 'research_paper' | 'study_guide' | 'video' | 'article';
  subject: string;
  gradeLevel: string;
  rating: number;
  reviewCount: number;
  downloadCount: number;
  tags: string[];
  thumbnail: string;
  fileSize: string;
  uploadDate: string;
  language: string;
}

export interface Review {
  id: string;
  resourceId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  unhelpful: number;
}

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Literature', 'History', 'Economics', 'Psychology', 'Engineering',
  'Philosophy', 'Art & Design',
];

export const RESOURCE_TYPES = [
  { value: 'textbook', label: 'Textbook', icon: '📘' },
  { value: 'research_paper', label: 'Research Paper', icon: '📄' },
  { value: 'study_guide', label: 'Study Guide', icon: '📝' },
  { value: 'video', label: 'Video Lecture', icon: '🎬' },
  { value: 'article', label: 'Article', icon: '📰' },
];

export const GRADE_LEVELS = [
  'High School', 'Undergraduate', 'Graduate', 'Professional', 'All Levels',
];

export const mockResources: Resource[] = [
  {
    id: '1', title: 'Introduction to Linear Algebra', description: 'A comprehensive textbook covering vectors, matrices, determinants, eigenvalues, and linear transformations with real-world applications.',
    author: 'Dr. Sarah Mitchell', type: 'textbook', subject: 'Mathematics', gradeLevel: 'Undergraduate', rating: 4.8, reviewCount: 234, downloadCount: 12500,
    tags: ['algebra', 'linear algebra', 'matrices'], thumbnail: '', fileSize: '45 MB', uploadDate: '2025-12-15', language: 'English',
  },
  {
    id: '2', title: 'Quantum Computing: A Modern Approach', description: 'Cutting-edge research paper exploring quantum algorithms, qubit manipulation, and practical quantum computing applications.',
    author: 'Prof. James Chen', type: 'research_paper', subject: 'Computer Science', gradeLevel: 'Graduate', rating: 4.6, reviewCount: 89, downloadCount: 4200,
    tags: ['quantum', 'computing', 'algorithms'], thumbnail: '', fileSize: '12 MB', uploadDate: '2026-01-20', language: 'English',
  },
  {
    id: '3', title: 'Organic Chemistry Study Guide', description: 'Essential study guide with practice problems, reaction mechanisms, and molecular structure visualizations.',
    author: 'Dr. Maria Rodriguez', type: 'study_guide', subject: 'Chemistry', gradeLevel: 'Undergraduate', rating: 4.9, reviewCount: 567, downloadCount: 28300,
    tags: ['organic chemistry', 'reactions', 'study guide'], thumbnail: '', fileSize: '32 MB', uploadDate: '2025-11-08', language: 'English',
  },
  {
    id: '4', title: 'Machine Learning Fundamentals', description: 'Video lecture series covering supervised learning, neural networks, deep learning, and practical ML implementations.',
    author: 'Dr. Alan Park', type: 'video', subject: 'Computer Science', gradeLevel: 'Graduate', rating: 4.7, reviewCount: 312, downloadCount: 15800,
    tags: ['machine learning', 'AI', 'neural networks'], thumbnail: '', fileSize: '2.1 GB', uploadDate: '2026-02-01', language: 'English',
  },
  {
    id: '5', title: 'World History: Ancient Civilizations', description: 'Comprehensive textbook exploring Mesopotamia, Egypt, Greece, Rome, and their lasting impact on modern society.',
    author: 'Prof. Elizabeth Warren', type: 'textbook', subject: 'History', gradeLevel: 'High School', rating: 4.5, reviewCount: 178, downloadCount: 9400,
    tags: ['history', 'ancient', 'civilizations'], thumbnail: '', fileSize: '67 MB', uploadDate: '2025-10-22', language: 'English',
  },
  {
    id: '6', title: 'Statistical Methods in Psychology', description: 'Research paper on modern statistical techniques used in psychological research and behavioral analysis.',
    author: 'Dr. Robert Kim', type: 'research_paper', subject: 'Psychology', gradeLevel: 'Graduate', rating: 4.3, reviewCount: 65, downloadCount: 3100,
    tags: ['psychology', 'statistics', 'research methods'], thumbnail: '', fileSize: '8 MB', uploadDate: '2026-01-05', language: 'English',
  },
  {
    id: '7', title: 'Classical Mechanics Explained', description: 'Study guide with solved problems covering Newtonian mechanics, Lagrangian and Hamiltonian formulations.',
    author: 'Prof. David Liu', type: 'study_guide', subject: 'Physics', gradeLevel: 'Undergraduate', rating: 4.7, reviewCount: 421, downloadCount: 19200,
    tags: ['physics', 'mechanics', 'Newton'], thumbnail: '', fileSize: '28 MB', uploadDate: '2025-09-30', language: 'English',
  },
  {
    id: '8', title: 'Microeconomics: Theory & Practice', description: 'In-depth article exploring supply-demand dynamics, market structures, and consumer behavior theory.',
    author: 'Dr. Anna Thompson', type: 'article', subject: 'Economics', gradeLevel: 'Undergraduate', rating: 4.4, reviewCount: 142, downloadCount: 7600,
    tags: ['economics', 'microeconomics', 'markets'], thumbnail: '', fileSize: '5 MB', uploadDate: '2025-12-01', language: 'English',
  },
  {
    id: '9', title: 'Molecular Biology of the Cell', description: 'Comprehensive textbook with stunning illustrations covering cell structure, genetics, and molecular processes.',
    author: 'Dr. Patricia Nguyen', type: 'textbook', subject: 'Biology', gradeLevel: 'Undergraduate', rating: 4.9, reviewCount: 689, downloadCount: 35600,
    tags: ['biology', 'molecular', 'cells', 'genetics'], thumbnail: '', fileSize: '120 MB', uploadDate: '2025-08-15', language: 'English',
  },
];

export const mockReviews: Review[] = [
  { id: '1', resourceId: '1', userId: 'u1', userName: 'Alex Johnson', rating: 5, comment: 'Excellent textbook! Very clear explanations and great examples.', date: '2026-02-10', helpful: 24, unhelpful: 1 },
  { id: '2', resourceId: '1', userId: 'u2', userName: 'Priya Sharma', rating: 4, comment: 'Good resource, but could use more practice problems.', date: '2026-02-05', helpful: 12, unhelpful: 3 },
  { id: '3', resourceId: '3', userId: 'u3', userName: 'Carlos Mendez', rating: 5, comment: 'This study guide saved my semester! Highly recommend.', date: '2026-01-28', helpful: 45, unhelpful: 0 },
];

export const STATS = {
  totalResources: 12500,
  totalUsers: 45000,
  totalDownloads: 890000,
  totalSubjects: 42,
};
