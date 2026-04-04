import { motion } from 'framer-motion';
import { BookOpen, Users, Download, GraduationCap, ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { SUBJECTS } from '@/lib/mock-data';
import SearchBar from '@/components/SearchBar';
import ResourceCard from '@/components/ResourceCard';
import ResourcePreviewModal from '@/components/ResourcePreviewModal';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { useState, useEffect } from 'react';
import type { Resource } from '@/lib/mock-data';
import heroBg from '@/assets/hero-bg.jpg';

const SUBJECT_ICONS: Record<string, string> = {
  'Mathematics': '📐', 'Physics': '⚛️', 'Chemistry': '🧪', 'Biology': '🧬',
  'Computer Science': '💻', 'Literature': '📖', 'History': '🏛️', 'Economics': '📊',
  'Psychology': '🧠', 'Engineering': '⚙️', 'Philosophy': '💭', 'Art & Design': '🎨',
};

const statItems = [
  { label: 'Resources', value: 0, icon: BookOpen },
  { label: 'Users', value: 0, icon: Users },
  { label: 'Downloads', value: 0, icon: Download },
  { label: 'Subjects', value: 42, icon: GraduationCap },
];

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const LandingPage = () => {
  const navigate = useNavigate();
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalResources: 0, totalUsers: 0, totalDownloads: 0, totalSubjects: 42 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resourcesRes = await fetch('http://localhost:3001/api/resources?limit=6');
        if (resourcesRes.ok) {
          const resourcesData = await resourcesRes.json();
          setResources(resourcesData.resources || []);
        }
        const statsRes = await fetch('http://localhost:3001/api/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
      } catch (error) {
        // Failed to fetch data
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updatedStatItems = [
    { label: 'Resources', value: stats.totalResources, icon: BookOpen },
    { label: 'Users', value: stats.totalUsers, icon: Users },
    { label: 'Downloads', value: stats.totalDownloads, icon: Download },
    { label: 'Subjects', value: stats.totalSubjects, icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <motion.div initial="hidden" animate="show" variants={stagger} className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 text-sm text-primary-foreground/90">
              <BookOpen className="w-4 h-4" /> Your Gateway to Knowledge
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-serif text-4xl md:text-6xl font-bold text-primary-foreground leading-tight">
              Discover, Learn &<br />
              <span className="text-gradient">Grow Together</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-primary-foreground/80 max-w-xl mx-auto">
              Access thousands of textbooks, research papers, and study guides. Your all-in-one educational resource library.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8">
              <SearchBar onSearch={() => navigate('/dashboard')} variant="hero" />
            </motion.div>
            <motion.div variants={fadeUp} className="mt-6 flex items-center justify-center gap-4">
              <Button size="lg" onClick={() => navigate('/register/user')} className="rounded-xl px-8 gradient-accent text-accent-foreground shadow-amber border-0 hover:opacity-90">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/login/admin')} className="rounded-xl text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10">
                Admin Access
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {updatedStatItems.map(s => (
            <motion.div key={s.label} variants={fadeUp} className="p-5 rounded-xl bg-card shadow-card border border-border/50 text-center">
              <s.icon className="w-6 h-6 mx-auto text-accent mb-2" />
              <p className="font-serif text-2xl font-bold text-foreground">{s.value.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-10">
            <h2 className="font-serif text-3xl font-bold text-foreground">Browse by Subject</h2>
            <p className="text-muted-foreground mt-2">Explore resources across dozens of academic disciplines</p>
          </motion.div>
          <motion.div variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SUBJECTS.map(subject => (
              <motion.button
                key={subject}
                variants={fadeUp}
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => navigate('/dashboard')}
                className="p-4 rounded-xl bg-card shadow-card border border-border/50 hover:shadow-elevated hover:border-accent/30 transition-all text-center group"
              >
                <span className="text-2xl block mb-2">{SUBJECT_ICONS[subject] || '📚'}</span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{subject}</span>
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Featured Resources */}
      <section className="container mx-auto px-4 pb-20">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground">Featured Resources</h2>
              <p className="text-muted-foreground mt-1">Handpicked by our editorial team</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {resources.map(r => (
              <ResourceCard key={r.id} resource={r} onPreview={setPreviewResource} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary-foreground">Ready to Start Learning?</h2>
            <p className="text-primary-foreground/70 mt-3 max-w-lg mx-auto">Join thousands of students and educators on EduVault today.</p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button size="lg" onClick={() => navigate('/register/user')} className="rounded-xl px-8 gradient-accent text-accent-foreground border-0">
                Sign Up as Student
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/register/admin')} className="rounded-xl text-primary-foreground hover:bg-primary-foreground/10">
                Register as Admin
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-serif text-lg font-bold">EduVault</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2026 EduVault. Empowering education through technology.</p>
          </div>
        </div>
      </footer>

      <ChatBot />
      <ResourcePreviewModal resource={previewResource} open={!!previewResource} onClose={() => setPreviewResource(null)} />
    </div>
  );
};

export default LandingPage;
