
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Testament } from '@/types/bible';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface TestamentSelectorProps {
  testaments: Testament[];
  selectedTestament: string | null;
  onTestamentSelect: (testamentId: string) => void;
}

const TestamentSelector: React.FC<TestamentSelectorProps> = ({
  testaments,
  selectedTestament,
  onTestamentSelect,
}) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">{t('bible.selectTestament')}</h2>
        <div className="flex flex-wrap gap-2">
          {testaments.map((testament) => (
            <Button
              key={testament.slug}
              variant={selectedTestament === testament.slug ? "default" : "outline"}
              onClick={() => onTestamentSelect(testament.slug)}
              className="flex-grow"
            >
              {testament.title}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestamentSelector;
