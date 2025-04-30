import React, { useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";

const LanguageSection = () => {
  const { t, i18n } = useTranslation();
  const { currentLanguage, changeLanguage, supportedLanguages, loading } = useLanguage();

  const handleLanguageChange = (language: string) => {
    changeLanguage(language as any);
  };

  // Effect to keep UI in sync with language changes
  useEffect(() => {
    const handleLanguageChanged = () => {
      // Force re-render when language changes
      console.log("Language changed event detected in LanguageSection");
    };
    
    // Listen for language change events
    document.addEventListener('languageChanged', handleLanguageChanged);
    
    return () => {
      document.removeEventListener('languageChanged', handleLanguageChanged);
    };
  }, []);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">{t('profile.language')}</h2>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('profile.language')}</CardTitle>
              <CardDescription>{t('profile.selectLanguage')}</CardDescription>
            </div>
            <Globe className="h-5 w-5 text-muted-foreground" />
          </div>
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
                    {lang.code === currentLanguage && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200" variant="outline">
                        {t('common.active')}
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {t('profile.languageInfo')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageSection;
