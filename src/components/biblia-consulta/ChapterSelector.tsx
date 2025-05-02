
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChapterSelectorProps {
  chapterCount: number;
  selectedChapter: number;
  onChapterSelect: (chapter: number) => void;
}

const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapterCount,
  selectedChapter,
  onChapterSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t('bible.selectChapter')}</h2>
        <ScrollArea className="h-auto max-h-[200px] pr-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: chapterCount }, (_, i) => i + 1).map((chapter) => (
              <Button
                key={chapter}
                variant={selectedChapter === chapter ? "default" : "outline"}
                onClick={() => onChapterSelect(chapter)}
                size="sm"
                className="min-w-[40px]"
              >
                {chapter}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChapterSelector;
