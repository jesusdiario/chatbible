
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import ChatHeader from "@/components/ChatHeader";
import { useSidebarControl } from "@/hooks/useSidebarControl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSubscription } from "@/hooks/useSubscription";
import { 
  CalendarIcon, 
  RefreshCw, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Shield,
  MessageCircle,
  Users,
  Sparkles
} from "lucide-react";
import { useMessageCount } from "@/hooks/useMessageCount";

const Profile = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebarControl();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshingSubscription, setIsRefreshingSubscription] = useState(false);
  
  const { 
    isLoading: subscriptionLoading,
    subscribed, 
    subscriptionTier, 
    subscriptionEnd,
    messageLimit, 
    refreshSubscription,
    openCustomerPortal,
    plans,
    subscription_data
  } = useSubscription();
  
  const { messageCount, loading: messageCountLoading } = useMessageCount(messageLimit);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        const { data } = await supabase
          .from('user_profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();
          
        if (data) {
          setDisplayName(data.display_name || "");
        }
      }
    };
    
    fetchUserData();
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          display_name: displayName,
          role: 'user'
        });
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;
      
      toast({
        title: "Redefinição de senha",
        description: "Enviamos um email com instruções para redefinir sua senha."
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleRefreshSubscription = async () => {
    setIsRefreshingSubscription(true);
    await refreshSubscription();
    setIsRefreshingSubscription(false);
    toast({
      title: "Assinatura atualizada",
      description: "Informações de assinatura atualizadas com sucesso."
    });
  };
  
  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  // Encontrar o plano atual e gratuito
  const currentPlan = plans.find(plan => plan.name === subscriptionTier) || plans.find(plan => plan.stripe_price_id === 'free_plan');
  const freePlan = plans.find(plan => plan.stripe_price_id === 'free_plan');

  const getSubscriptionStatusColor = () => {
    if (subscribed) return "text-green-600";
    return "text-amber-500";
  };

  const getSubscriptionBadge = () => {
    if (subscribed) {
      return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Ativo</span>;
    }
    return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">Gratuito</span>;
  };

  const getPlanBenefits = (planName: string | null) => {
    switch (planName) {
      case "Pro":
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: `${messageLimit} mensagens por mês` },
          { icon: <Shield className="h-4 w-4" />, text: "Acesso a todos os livros da Bíblia" },
          { icon: <Users className="h-4 w-4" />, text: "Uso para grupos e ministérios" },
          { icon: <Sparkles className="h-4 w-4" />, text: "Geração de conteúdo avançado" }
        ];
      default:
        return [
          { icon: <MessageCircle className="h-4 w-4" />, text: `${messageLimit} mensagens por mês` },
          { icon: <Shield className="h-4 w-4" />, text: "Acesso básico aos livros bíblicos" }
        ];
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        chatHistory={[]}
        onChatSelect={() => {}}
        currentPath="/profile"
      />
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
        <ChatHeader isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
        <div className="pt-[70px] px-4 md:px-8 max-w-3xl mx-auto pb-10">
          <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
          
          <Tabs defaultValue="account">
            <TabsList className="mb-4">
              <TabsTrigger value="account">Conta</TabsTrigger>
              <TabsTrigger value="subscription">Assinatura</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Conta</CardTitle>
                  <CardDescription>Atualize suas informações pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback>{displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Button variant="outline" size="sm" disabled>Alterar foto</Button>
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="name" className="text-sm font-medium">Nome</label>
                    <Input
                      id="name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Seu nome"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <label htmlFor="email" className="text-sm font-medium">Email</label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      readOnly
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={handlePasswordReset}>
                    Alterar senha
                  </Button>
                  <Button onClick={updateProfile} disabled={isUpdating}>
                    {isUpdating ? "Salvando..." : "Salvar alterações"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="subscription">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>Minha Assinatura</CardTitle>
                      {getSubscriptionBadge()}
                    </div>
                    <CardDescription>Gerencie seu plano</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleRefreshSubscription}
                    disabled={isRefreshingSubscription}
                    title="Atualizar informações"
                  >
                    {isRefreshingSubscription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardHeader>
                
                <CardContent>
                  {subscriptionLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Plano atual */}
                        <div className="flex-1 border rounded-lg p-6 relative">
                          {subscribed && (
                            <div className="absolute -right-2 -top-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                              Ativo
                            </div>
                          )}
                          <h3 className="font-bold text-xl mb-2">{subscriptionTier || "Gratuito"}</h3>
                          
                          {subscribed ? (
                            <>
                              <div className="flex items-center gap-2 text-sm text-green-600 mb-4">
                                <CheckCircle className="h-4 w-4" />
                                <span>Assinatura ativa</span>
                              </div>
                              {subscriptionEnd && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                                  <CalendarIcon className="h-4 w-4" />
                                  <span>Renovação em {new Date(subscriptionEnd).toLocaleDateString('pt-BR')}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                              <AlertCircle className="h-4 w-4" />
                              <span>Plano básico</span>
                            </div>
                          )}
                          
                          <ul className="space-y-2 mb-6">
                            {getPlanBenefits(subscriptionTier).map((benefit, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{benefit.text}</span>
                              </li>
                            ))}
                          </ul>
                          
                          {subscribed ? (
                            <Button onClick={handleManageSubscription} className="w-full">
                              <CreditCard className="h-4 w-4 mr-2" />
                              Gerenciar assinatura
                            </Button>
                          ) : (
                            <Button onClick={() => openCustomerPortal()} className="w-full">
                              Fazer upgrade
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {/* Histórico de pagamentos - placeholder */}
                      {subscribed && (
                        <div className="mt-8">
                          <h3 className="font-medium text-lg mb-3">Histórico de pagamentos</h3>
                          <div className="border rounded-lg p-4">
                            <div className="text-center py-6 text-gray-500">
                              As informações de pagamento estão disponíveis no Portal do Cliente.
                            </div>
                            <div className="mt-4 flex justify-center">
                              <Button variant="outline" onClick={handleManageSubscription}>
                                Ver histórico no Portal do Cliente
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Uso de Mensagens</CardTitle>
                  <CardDescription>Monitoramento do seu uso</CardDescription>
                </CardHeader>
                <CardContent>
                  {messageCountLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Mensagens utilizadas</span>
                          <span className="font-medium">{messageCount} de {messageLimit}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${
                              messageCount / messageLimit >= 0.9 ? 'bg-red-500' : 
                              messageCount / messageLimit >= 0.7 ? 'bg-amber-500' : 
                              'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min((messageCount / messageLimit) * 100, 100)}%` }}
                          />
                        </div>
                        
                        {messageCount / messageLimit >= 0.7 && (
                          <div className={`text-sm ${messageCount / messageLimit >= 0.9 ? 'text-red-500' : 'text-amber-500'} mt-1`}>
                            {messageCount / messageLimit >= 0.9 
                              ? 'Você está prestes a atingir seu limite mensal!' 
                              : 'Você está se aproximando do seu limite mensal.'}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Plano atual: {subscriptionTier || "Gratuito"}</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          {subscribed 
                            ? `Seu plano ${subscriptionTier} inclui ${messageLimit} mensagens por mês.` 
                            : `O plano Gratuito inclui ${messageLimit} mensagens por mês.`}
                        </p>
                        
                        {!subscribed && (
                          <Button onClick={() => openCustomerPortal()} className="w-full">
                            Fazer upgrade
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Profile;
