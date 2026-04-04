import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Resource, RESOURCE_TYPES, mockReviews } from '@/lib/mock-data';
import { Star, Download, Bookmark, Share2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

interface Props {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
}

const ResourcePreviewModal = ({ resource, open, onClose }: Props) => {
  const [userRating, setUserRating] = useState(0);
  const [review, setReview] = useState('');

  if (!resource) return null;
  const typeInfo = RESOURCE_TYPES.find(t => t.value === resource.type);
  const reviews = mockReviews.filter(r => r.resourceId === resource.id);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center text-3xl shrink-0">
              {typeInfo?.icon}
            </div>
            <div className="flex-1">
              <DialogTitle className="font-serif text-xl">{resource.title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{resource.author} · {resource.subject}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{typeInfo?.label}</Badge>
                <Badge variant="outline">{resource.gradeLevel}</Badge>
                <Badge variant="outline">{resource.language}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-secondary text-center">
              <div className="flex items-center justify-center gap-1 text-accent">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-semibold">{resource.rating}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{resource.reviewCount} reviews</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary text-center">
              <Download className="w-4 h-4 mx-auto text-primary" />
              <p className="text-xs text-muted-foreground mt-0.5">{resource.downloadCount.toLocaleString()} downloads</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary text-center">
              <p className="font-semibold text-sm">{resource.fileSize}</p>
              <p className="text-xs text-muted-foreground mt-0.5">File size</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-serif font-semibold mb-2">About this resource</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {resource.tags.map(tag => (
              <span key={tag} className="text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">#{tag}</span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
            <Button variant="outline">
              <Bookmark className="w-4 h-4 mr-2" /> Bookmark
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
          </div>

          {/* Reviews */}
          <div>
            <h4 className="font-serif font-semibold mb-3">Reviews</h4>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="p-3 rounded-lg bg-secondary/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                        {r.userName[0]}
                      </div>
                      <span className="text-sm font-medium">{r.userName}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-3 h-3 ${s <= r.rating ? 'fill-accent text-accent' : 'text-border'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{r.comment}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <ThumbsUp className="w-3 h-3" /> {r.helpful}
                    </button>
                    <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      <ThumbsDown className="w-3 h-3" /> {r.unhelpful}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Write review */}
            <div className="mt-4 p-4 rounded-lg border border-border/50">
              <h5 className="text-sm font-semibold mb-2">Write a Review</h5>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setUserRating(s)}>
                    <Star className={`w-5 h-5 transition-colors ${s <= userRating ? 'fill-accent text-accent' : 'text-border hover:text-accent/50'}`} />
                  </button>
                ))}
              </div>
              <Textarea
                value={review}
                onChange={e => setReview(e.target.value)}
                placeholder="Share your thoughts about this resource..."
                className="text-sm"
                rows={3}
              />
              <Button size="sm" className="mt-2" disabled={!userRating || !review.trim()}>
                Submit Review
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResourcePreviewModal;
