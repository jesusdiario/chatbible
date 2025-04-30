
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useTranslation } from "react-i18next";

const LanguageSection = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages, loading } = useLanguage();

  const handleLanguageChange = (language: string) => {
    changeLanguage(language as any);
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{t('profile.language')}</h2>
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.language')}</CardTitle>
          <CardDescription>{t('profile.selectLanguage')}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Select
              value={currentLanguage}
              onValueChange={handleLanguageChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('profile.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSection;
