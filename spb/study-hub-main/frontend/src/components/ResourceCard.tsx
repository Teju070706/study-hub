import { motion } from 'framer-motion';
import { Resource, RESOURCE_TYPES } from '@/lib/mock-data';
import { Star, Download, Eye, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { toast } from 'sonner';

interface ResourceCardProps {
  resource: Resource;
  viewMode?: 'grid' | 'list';
  onPreview?: (resource: Resource) => void;
}

const ResourceCard = ({ resource, viewMode = 'grid', onPreview }: ResourceCardProps) => {
  const [bookmarked, setBookmarked] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const typeInfo = RESOURCE_TYPES.find(t => t.value === resource.type);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const token = localStorage.getItem('eduvault_token');

      // If user is logged in, track the download
      if (token) {
        await fetch(`http://localhost:3001/api/resources/${resource.id}/download`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Create an anchor element and trigger actual file download
      const link = document.createElement('a');
      link.href = `http://localhost:3001/api/resources/${resource.id}/download-file`;
      link.setAttribute('download', resource.title);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
    } catch (error) {
      // Download error
      toast.error('Failed to download file');
    } finally {
      setDownloading(false);
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-4 p-4 rounded-lg bg-card shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50"
      >
        <div className="w-16 h-16 rounded-lg gradient-hero flex items-center justify-center text-2xl shrink-0">
          {typeInfo?.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-semibold text-foreground truncate">{resource.title}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">{resource.author} · {resource.subject}</p>
            </div>
            <div className="flex items-center gap-1 text-accent shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">{resource.rating}</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{resource.description}</p>
          <div className="flex items-center gap-3 mt-2">
            <Badge variant="secondary" className="text-xs">{typeInfo?.label}</Badge>
            <span className="text-xs text-muted-foreground">{resource.fileSize}</span>
            <span className="text-xs text-muted-foreground">{resource.downloadCount.toLocaleString()} downloads</span>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group rounded-xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50 overflow-hidden"
    >
      {/* Thumbnail */}
      <div className="h-36 gradient-hero relative flex items-center justify-center">
        <span className="text-5xl">{typeInfo?.icon}</span>
        <div className="absolute top-3 right-3 flex gap-1.5">
          <button
            onClick={() => setBookmarked(!bookmarked)}
            className="w-8 h-8 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-accent text-accent' : 'text-primary-foreground'}`} />
          </button>
        </div>
        <Badge className="absolute bottom-3 left-3 bg-card/90 text-foreground text-xs backdrop-blur-sm border-0">
          {typeInfo?.label}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-serif font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">{resource.author}</p>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{resource.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className={`w-3.5 h-3.5 ${star <= Math.round(resource.rating) ? 'fill-accent text-accent' : 'text-border'}`} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({resource.reviewCount})</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {resource.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{tag}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button size="sm" className="flex-1 text-xs" onClick={() => onPreview?.(resource)}>
            <Eye className="w-3.5 h-3.5 mr-1" /> Preview
          </Button>
          <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={handleDownload} disabled={downloading}>
            <Download className="w-3.5 h-3.5 mr-1" /> {downloading ? '...' : 'Download'}
          </Button>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <span className="text-xs text-muted-foreground">{resource.fileSize}</span>
          <span className="text-xs text-muted-foreground">{resource.downloadCount.toLocaleString()} downloads</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ResourceCard;
