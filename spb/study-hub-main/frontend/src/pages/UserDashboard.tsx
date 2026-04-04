import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Resource } from '@/lib/mock-data';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import SearchBar, { SearchFilters } from '@/components/SearchBar';
import ResourceCard from '@/components/ResourceCard';
import ResourcePreviewModal from '@/components/ResourcePreviewModal';
import ChatBot from '@/components/ChatBot';
import { LayoutGrid, List, BookOpen, Clock, Bookmark, Download, Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navigate } from 'react-router-dom';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({ subject: '', type: '', gradeLevel: '', sortBy: 'relevance' });
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/resources');
        if (response.ok) {
          const data = await response.json();
          setResources(data.resources || []);
        } else {
          setResources([]);
        }
      } catch (error) {
        // Failed to fetch resources
        setResources([]);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const filteredResources = useMemo(() => {
    let result = [...resources];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(t => t.includes(q)));
    }
    if (filters.subject) result = result.filter(r => r.subject === filters.subject);
    if (filters.type) result = result.filter(r => r.type === filters.type);
    if (filters.gradeLevel) result = result.filter(r => r.gradeLevel === filters.gradeLevel);
    if (filters.sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    if (filters.sortBy === 'downloads') result.sort((a, b) => b.downloadCount - a.downloadCount);
    if (filters.sortBy === 'date') result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    return result;
  }, [searchQuery, filters, resources]);

  if (!isAuthenticated || user?.role !== 'user') return <Navigate to="/login/user" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground">Welcome back, {user?.name}! 👋</h1>
          <p className="text-muted-foreground mt-1">Continue your learning journey</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: BookOpen, label: 'Resources Viewed', value: '24' },
            { icon: Download, label: 'Downloads', value: '12' },
            { icon: Bookmark, label: 'Bookmarks', value: '8' },
            { icon: Clock, label: 'Study Hours', value: '36h' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-card shadow-card border border-border/50">
              <s.icon className="w-5 h-5 text-accent mb-2" />
              <p className="font-serif text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">Browse Resources</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="browse">
            {/* Search + View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
              <div className="flex-1 w-full">
                <SearchBar onSearch={(q, f) => { setSearchQuery(q); setFilters(f); }} />
              </div>
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <Button size="icon" variant={viewMode === 'grid' ? 'default' : 'ghost'} onClick={() => setViewMode('grid')} className="h-8 w-8">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button size="icon" variant={viewMode === 'list' ? 'default' : 'ghost'} onClick={() => setViewMode('list')} className="h-8 w-8">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{loading ? 'Loading...' : `${filteredResources.length} resources found`}</p>

            {loading ? (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3 animate-pulse" />
                <p className="text-muted-foreground">Loading resources...</p>
              </div>
            ) : (
              <>
                <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
                  {filteredResources.map(r => (
                    <ResourceCard key={r.id} resource={r} viewMode={viewMode} onPreview={setPreviewResource} />
                  ))}
                </div>
                {filteredResources.length === 0 && (
                  <div className="text-center py-16">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground">No resources found. Try adjusting your search.</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="bookmarks">
            <div className="text-center py-16">
              <Bookmark className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">Your bookmarked resources will appear here</p>
              <p className="text-sm text-muted-foreground mt-1">Click the bookmark icon on any resource to save it</p>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <div className="max-w-lg">
              <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold">{user?.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Edit Profile</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatBot />
      <ResourcePreviewModal resource={previewResource} open={!!previewResource} onClose={() => setPreviewResource(null)} />
    </div>
  );
};

export default UserDashboard;
