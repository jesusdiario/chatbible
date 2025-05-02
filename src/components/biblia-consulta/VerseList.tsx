
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Verse } from '@/types/bible';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VerseListProps {
  verses: Verse[];
}

const VerseList: React.FC<VerseListProps> = ({ verses }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copiedVerseId, setCopiedVerseId] = useState<number | null>(null);

  const copyVerseToClipboard = (verse: Verse) => {
    const text = `${verse.text} (${verse.chapter}:${verse.verse})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedVerseId(verse.id);
      toast({
        title: t('common.copied'),
        description: t('bible.verseCopied'),
      });
      
      setTimeout(() => {
        setCopiedVerseId(null);
      }, 2000);
    });
  };

  if (!verses || verses.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-gray-500">
          {t('bible.noVersesFound')}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">
          {verses[0] ? `${verses[0].chapter}` : t('bible.verses')}
        </h2>
        <div className="space-y-4">
          {verses.map(verse => (
            <div key={verse.id} className="flex group">
              <div className="mr-2 text-sm font-semibold text-gray-500 pt-1 w-6 shrink-0">
                {verse.verse}
              </div>
              <div className="flex-1">
                <p className="text-base">{verse.text}</p>
              </div>
              <div className="flex items-start ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyVerseToClipboard(verse)}
                  className="h-8 w-8"
                >
                  {copiedVerseId === verse.id ? <Check size={16} /> : <Copy size={16} />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Bookmark size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VerseList;
