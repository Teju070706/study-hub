import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { Navigate } from 'react-router-dom';
import { SUBJECTS, RESOURCE_TYPES } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Upload, BarChart3, Users, FileText, Plus, Trash2, Edit, Eye,
  TrendingUp, Download, BookOpen, Star, Shield
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  id: string;
  title: string;
  subject: string;
  type: string;
  rating: number;
  downloadCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  downloads: number;
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', author: '', subject: '', type: '', gradeLevel: '', language: 'English' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({ totalResources: 0, totalUsers: 0, totalDownloads: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upload');

  const fetchResources = async () => {
    try {
      const token = localStorage.getItem('eduvault_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const resourcesRes = await fetch('http://localhost:3001/api/resources', { headers });
      if (resourcesRes.ok) {
        const data = await resourcesRes.json();
        setResources(data.resources || []);
      }
    } catch (error) {
      // Failed to fetch resources
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('eduvault_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const usersRes = await fetch('http://localhost:3001/api/users', { headers });
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      // Failed to fetch users
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('eduvault_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const statsRes = await fetch('http://localhost:3001/api/stats', { headers });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      // Failed to fetch stats
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchResources(), fetchUsers(), fetchStats()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (!isAuthenticated || user?.role !== 'admin') return <Navigate to="/login/admin" />;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title || !uploadForm.subject || !uploadForm.type) {
      toast.error('Please fill in required fields (Title, Subject, Type)');
      return;
    }

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('eduvault_token');
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('author', uploadForm.author || 'Unknown');
      formData.append('subject', uploadForm.subject);
      formData.append('type', uploadForm.type);
      formData.append('gradeLevel', uploadForm.gradeLevel || 'All Levels');
      formData.append('language', uploadForm.language);
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      // Uploading file: ${selectedFile.name}, Size: ${selectedFile.size}

      const response = await fetch('http://localhost:3001/api/resources', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      // Upload response: ${response.status}, ${data}

      if (response.ok) {
        toast.success('Resource uploaded successfully!');
        setUploadForm({ title: '', description: '', author: '', subject: '', type: '', gradeLevel: '', language: 'English' });
        setSelectedFile(null);
        // Refresh resources list and stats
        await fetchResources();
        await fetchStats();
        // Switch to resources tab to show the new resource
        setActiveTab('resources');
      } else {
        toast.error(data.error || 'Failed to upload resource');
      }
    } catch (error) {
      // Upload error
      toast.error('Failed to upload resource. Please check if the server is running.');
    } finally {
      setUploading(false);
    }
  };

  const analytics = [
    { icon: BookOpen, label: 'Total Resources', value: stats.totalResources.toLocaleString(), trend: '+12%' },
    { icon: Users, label: 'Active Users', value: stats.totalUsers.toLocaleString(), trend: '+8%' },
    { icon: Download, label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), trend: '+23%' },
    { icon: Star, label: 'Avg Rating', value: stats.avgRating.toFixed(1), trend: '+0.2' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Admin Panel</h1>
            <p className="text-muted-foreground text-sm">Manage resources, users, and analytics</p>
          </div>
        </motion.div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {analytics.map(a => (
            <motion.div key={a.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-card shadow-card border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <a.icon className="w-5 h-5 text-accent" />
                <span className="text-xs font-medium text-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {a.trend}
                </span>
              </div>
              <p className="font-serif text-2xl font-bold text-foreground">{a.value}</p>
              <p className="text-xs text-muted-foreground">{a.label}</p>
            </motion.div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1.5" /> Upload</TabsTrigger>
            <TabsTrigger value="resources"><FileText className="w-4 h-4 mr-1.5" /> Resources</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-1.5" /> Users</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart3 className="w-4 h-4 mr-1.5" /> Analytics</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <div className="max-w-2xl">
              <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
                <h3 className="font-serif text-xl font-bold mb-6">Upload New Resource</h3>
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Title *</Label>
                      <Input value={uploadForm.title} onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))} className="mt-1.5" placeholder="Resource title" />
                    </div>
                    <div>
                      <Label>Author</Label>
                      <Input value={uploadForm.author} onChange={e => setUploadForm(f => ({ ...f, author: e.target.value }))} className="mt-1.5" placeholder="Author name" />
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea value={uploadForm.description} onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))} className="mt-1.5" rows={3} placeholder="Brief description of the resource" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label>Subject *</Label>
                      <Select value={uploadForm.subject} onValueChange={v => setUploadForm(f => ({ ...f, subject: v }))}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Type *</Label>
                      <Select value={uploadForm.type} onValueChange={v => setUploadForm(f => ({ ...f, type: v }))}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{RESOURCE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Grade Level</Label>
                      <Select value={uploadForm.gradeLevel} onValueChange={v => setUploadForm(f => ({ ...f, gradeLevel: v }))}>
                        <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {['High School', 'Undergraduate', 'Graduate', 'Professional', 'All Levels'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* File Drop Zone */}
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.zip,.rar"
                    />
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                    {selectedFile ? (
                      <>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-foreground">Drag & drop files here</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, PPTX, MP4 up to 500MB</p>
                      </>
                    )}
                    <Button variant="outline" size="sm" className="mt-3" onClick={(e) => e.preventDefault()}>
                      {selectedFile ? 'Change File' : 'Browse Files'}
                    </Button>
                  </div>

                  <Button type="submit" className="w-full" disabled={uploading}>
                    <Plus className="w-4 h-4 mr-2" /> {uploading ? 'Uploading...' : 'Upload Resource'}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <div className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resources.map(r => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell><Badge variant="secondary">{r.subject}</Badge></TableCell>
                      <TableCell className="text-sm">{RESOURCE_TYPES.find(t => t.value === r.type)?.label}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-accent text-accent" /> {r.rating}</div>
                      </TableCell>
                      <TableCell>{r.downloadCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="w-3.5 h-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="rounded-xl bg-card shadow-card border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.status === 'active' ? 'default' : 'destructive'} className="text-xs">
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.downloads}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" className="text-xs h-7">
                            {u.status === 'active' ? 'Suspend' : 'Activate'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
                <h4 className="font-serif font-semibold mb-4">Popular Subjects</h4>
                <div className="space-y-3">
                  {['Computer Science', 'Mathematics', 'Biology', 'Physics', 'Chemistry'].map((s, i) => {
                    const width = [85, 72, 65, 58, 45][i];
                    return (
                      <div key={s}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>{s}</span>
                          <span className="text-muted-foreground">{width}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="h-full rounded-full gradient-accent"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 rounded-xl bg-card shadow-card border border-border/50">
                <h4 className="font-serif font-semibold mb-4">Recent Activity</h4>
                <div className="space-y-3">
                  {[
                    { text: 'New user registered', time: '2 hours ago' },
                    { text: 'Resource downloaded', time: '4 hours ago' },
                    { text: 'New review posted', time: '6 hours ago' },
                    { text: 'Resource updated', time: '1 day ago' },
                    { text: 'User status changed', time: '2 days ago' },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                      <div>
                        <p className="text-foreground">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <ChatBot />
    </div>
  );
};

export default AdminDashboard;
