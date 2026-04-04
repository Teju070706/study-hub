import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SUBJECTS, RESOURCE_TYPES, GRADE_LEVELS } from '@/lib/mock-data';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  variant?: 'hero' | 'compact';
}

export interface SearchFilters {
  subject: string;
  type: string;
  gradeLevel: string;
  sortBy: string;
}

const SearchBar = ({ onSearch, variant = 'compact' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    subject: '', type: '', gradeLevel: '', sortBy: 'relevance',
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const isHero = variant === 'hero';

  return (
    <div className={`w-full ${isHero ? 'max-w-2xl mx-auto' : ''}`}>
      <div className={`flex gap-2 ${isHero ? 'p-2 rounded-2xl glass shadow-elevated' : ''}`}>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
          <Input
            placeholder="Search textbooks, papers, study guides..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className={`pl-10 ${isHero ? 'h-12 text-base border-0 bg-transparent focus-visible:ring-0' : 'h-10'}`}
          />
        </div>
        <Button onClick={() => setShowFilters(!showFilters)} variant="ghost" size="icon" className="shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </Button>
        <Button onClick={handleSearch} className={isHero ? 'h-12 px-6 rounded-xl' : ''}>
          Search
        </Button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 ${isHero ? 'px-2' : ''}`}>
              <Select value={filters.subject} onValueChange={v => setFilters(f => ({ ...f, subject: v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Subject" /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.type} onValueChange={v => setFilters(f => ({ ...f, type: v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  {RESOURCE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.gradeLevel} onValueChange={v => setFilters(f => ({ ...f, gradeLevel: v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Grade Level" /></SelectTrigger>
                <SelectContent>
                  {GRADE_LEVELS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filters.sortBy} onValueChange={v => setFilters(f => ({ ...f, sortBy: v }))}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Sort by" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance</SelectItem>
                  <SelectItem value="date">Newest</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="downloads">Most Downloaded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(filters.subject || filters.type || filters.gradeLevel) && (
              <div className="flex items-center gap-2 mt-2 px-2">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                {filters.subject && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    {filters.subject} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, subject: '' }))} />
                  </span>
                )}
                {filters.type && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    {filters.type} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, type: '' }))} />
                  </span>
                )}
                {filters.gradeLevel && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary flex items-center gap-1">
                    {filters.gradeLevel} <X className="w-3 h-3 cursor-pointer" onClick={() => setFilters(f => ({ ...f, gradeLevel: '' }))} />
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
