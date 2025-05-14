
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, Check, RefreshCw, Download, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import translationPT from "@/locales/pt-BR/translation.json";
import translationEN from "@/locales/en/translation.json";
import translationES from "@/locales/es/translation.json";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const TranslationManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<"en" | "es">("en");
  const [progress, setProgress] = useState(0);
  const [translationResult, setTranslationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Função para acionar a tradução automática
  const handleTranslate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setProgress(0);
      setTranslationResult(null);

      // Cria um aviso de início
      toast({
        title: "Tradução iniciada",
        description: `Traduzindo de português para ${currentLanguage === "en" ? "inglês" : "espanhol"}...`,
      });

      // Chama a função Edge de tradução automática
      const { data, error } = await supabase.functions.invoke("auto-translate", {
        body: {
          sourceJson: translationPT,
          targetLanguage: currentLanguage,
          chunkSize: 10,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.success) {
        throw new Error("Falha na tradução automática");
      }

      // Atualiza o estado com o resultado
      setTranslationResult(data.translatedJson);
      setProgress(100);

      toast({
        title: "Tradução concluída",
        description: "O arquivo de tradução foi gerado com sucesso!",
        variant: "success",
      });

    } catch (err) {
      console.error("Erro ao traduzir:", err);
      setError(err.message || "Erro desconhecido durante a tradução");
      
      toast({
        title: "Erro na tradução",
        description: err.message || "Ocorreu um erro durante o processo de tradução",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para baixar o arquivo de tradução JSON
  const handleDownload = () => {
    if (!translationResult) return;

    // Cria um blob com o conteúdo do JSON
    const blob = new Blob([JSON.stringify(translationResult, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Cria um link para download
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation_${currentLanguage}_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Limpa
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O arquivo JSON de tradução está sendo baixado",
    });
  };

  return (
    <div className="container mx-auto py-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Gerenciador de Traduções Automáticas</CardTitle>
          <CardDescription>
            Use a API da OpenAI para traduzir automaticamente as strings do sistema para outros idiomas
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="en" onValueChange={(val) => setCurrentLanguage(val as "en" | "es")}>
            <TabsList className="mb-4">
              <TabsTrigger value="en">Inglês</TabsTrigger>
              <TabsTrigger value="es">Espanhol</TabsTrigger>
            </TabsList>
            
            <TabsContent value="en" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Tradução para Inglês</h3>
                  <p className="text-sm text-muted-foreground">
                    Traduz o arquivo de português para inglês usando IA
                  </p>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  {Object.keys(translationEN).length} chaves existentes
                </Badge>
              </div>
            </TabsContent>
            
            <TabsContent value="es" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Tradução para Espanhol</h3>
                  <p className="text-sm text-muted-foreground">
                    Traduz o arquivo de português para espanhol usando IA
                  </p>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500">
                  {Object.keys(translationES).length} chaves existentes
                </Badge>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {isLoading && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando tradução... Isso pode levar alguns minutos.</span>
              </div>
            </div>
          )}
          
          {translationResult && !isLoading && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <Check className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-700">Tradução Concluída</AlertTitle>
              <AlertDescription className="text-green-600">
                Tradução automática finalizada com {Object.keys(translationResult).length} chaves.
                Use o botão de download para salvar o arquivo.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setTranslationResult(null)}
            disabled={isLoading || !translationResult}
          >
            Limpar
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isLoading || !translationResult}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar JSON
            </Button>
            
            <Button 
              onClick={handleTranslate} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traduzindo...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Traduzir para {currentLanguage === "en" ? "Inglês" : "Espanhol"}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TranslationManager;
