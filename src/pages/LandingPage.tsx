
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, CheckCircle, MessageSquare, Users, Star, ShieldCheck, Rocket, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white min-h-screen flex flex-col text-stone-700">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-stone-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <img
                src="/lovable-uploads/logo-jd-bible-chat.png"
                alt="Bible Chat Logo"
                className="h-8 w-auto"
              />
              <span className="ml-3 text-lg font-medium text-stone-800">Bible Chat</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-stone-600 hover:text-stone-900 text-sm">Recursos</a>
              <a href="#benefits" className="text-stone-600 hover:text-stone-900 text-sm">Benefícios</a>
              <a href="#testimonials" className="text-stone-600 hover:text-stone-900 text-sm">Depoimentos</a>
              <a href="#pricing" className="text-stone-600 hover:text-stone-900 text-sm">Planos</a>
            </div>
            <div className="flex items-center">
              <Link to="/auth">
                <Button variant="minimalOutline" size="sm" className="mr-2">Entrar</Button>
              </Link>
              <Link to="/auth?signup=true">
                <Button variant="minimal" size="sm">Criar Conta</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="lp-section pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-stone-800 mb-6 leading-tight">
              Dialogue com a Bíblia como nunca antes
            </h1>
            <p className="text-lg md:text-xl text-stone-600 mb-8 leading-relaxed">
              Explore os textos sagrados através de conversas intuitivas, obtenha insights profundos e crie conteúdos inspiradores para seu ministério em segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="minimal" size="minimal">
                Comece Gratuitamente
              </Button>
              <Button variant="minimalOutline" size="minimal">
                Ver demonstração
              </Button>
            </div>
          </div>
          <div className="md:w-1/2 rounded-lg overflow-hidden shadow-md">
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
              {/* Placeholder para vídeo ou imagem de demonstração */}
              <div className="flex items-center justify-center h-full bg-stone-50 text-stone-400">
                <img
                  src="/lovable-uploads/a70bfdc8-5c4c-4f43-8597-b7a62b57f00e.png"
                  alt="Bible Chat Interface"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problema/Solução */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Transformando o estudo bíblico</h2>
            <p className="lp-subheading">
              Bible Chat resolve os principais desafios do estudo bíblico moderno
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
              <h3 className="text-xl font-medium text-stone-800 mb-4">O Desafio</h3>
              <p className="text-stone-600 mb-4">
                Muitas pessoas sentem dificuldade em compreender textos bíblicos complexos, encontrar respostas específicas ou aplicar os ensinamentos ao cotidiano moderno.
              </p>
              <ul className="space-y-3">
                {["Falta de tempo para estudos aprofundados", "Dúvidas sem respostas imediatas", "Dificuldade em preparar material para aulas ou pregações"].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-red-500 mr-2">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-stone-100">
              <h3 className="text-xl font-medium text-stone-800 mb-4">Nossa Solução</h3>
              <p className="text-stone-600 mb-4">
                Bible Chat oferece uma experiência interativa com a Bíblia, permitindo conversas naturais que aprofundam seu conhecimento e inspiram sua jornada espiritual.
              </p>
              <ul className="space-y-3">
                {["Respostas imediatas a qualquer dúvida bíblica", "Conteúdo personalizado para estudos e ensinamentos", "Compreensão clara de passagens complexas"].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="benefits" className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Benefícios Transformadores</h2>
            <p className="lp-subheading">
              Descubra como o Bible Chat pode revolucionar sua conexão com as Escrituras
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <BookOpen className="h-6 w-6" />,
                title: "Conhecimento Aprofundado",
                description: "Acesse explicações detalhadas sobre qualquer texto bíblico, compreendendo contextos históricos e significados originais."
              },
              {
                icon: <MessageSquare className="h-6 w-6" />,
                title: "Diálogo Natural",
                description: "Converse com a Bíblia como se estivesse falando com um mentor espiritual, fazendo perguntas em linguagem cotidiana."
              },
              {
                icon: <Rocket className="h-6 w-6" />,
                title: "Produtividade Ministerial",
                description: "Crie esboços de sermões, planos de aula e estudos bíblicos em fração do tempo que levaria tradicionalmente."
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Ensino Facilitado",
                description: "Transforme conceitos bíblicos complexos em explicações acessíveis para diferentes faixas etárias e níveis de conhecimento."
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Confiabilidade Doutrinária",
                description: "Conteúdo baseado em interpretações teologicamente sólidas, respeitando a integridade das Escrituras."
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "Experiência Personalizada",
                description: "Estudos e respostas adaptados ao seu nível de conhecimento, interesses e necessidades específicas."
              }
            ].map((benefit, index) => (
              <div key={index} className="lp-card flex flex-col items-start">
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-50 mb-6">
                  <div className="text-chatgpt-accent">
                    {benefit.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-stone-800 mb-3">{benefit.title}</h3>
                <p className="text-stone-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cinco Pilares (Nova Seção) */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Os Cinco Pilares do Bible Chat</h2>
            <p className="lp-subheading">
              Fundamentado em princípios que garantem uma experiência transformadora
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              {
                number: "01",
                title: "Fidelidade Bíblica",
                description: "Respeito absoluto ao texto sagrado e sua interpretação contextualizada"
              },
              {
                number: "02",
                title: "Acessibilidade",
                description: "Conteúdo teológico profundo em linguagem compreensível para todos"
              },
              {
                number: "03",
                title: "Aplicabilidade",
                description: "Conexão direta entre o texto antigo e os desafios contemporâneos"
              },
              {
                number: "04",
                title: "Personalização",
                description: "Experiência adaptada às necessidades específicas de cada usuário"
              },
              {
                number: "05",
                title: "Crescimento",
                description: "Foco no desenvolvimento espiritual contínuo e transformador"
              }
            ].map((pilar, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                <div className="text-4xl font-light text-chatgpt-accent mb-4">{pilar.number}</div>
                <h3 className="text-xl font-medium text-stone-800 mb-3">{pilar.title}</h3>
                <p className="text-stone-600 text-sm">{pilar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Crescimento Espiritual (Nova Seção) */}
      <section className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h2 className="text-3xl md:text-4xl font-medium text-stone-800 mb-6">Acelere seu crescimento espiritual</h2>
              <p className="text-stone-600 mb-6">
                O Bible Chat foi projetado para ajudar você a desenvolver uma compreensão mais profunda das Escrituras, permitindo um diálogo contínuo que fortalece sua fé e transforma seu entendimento.
              </p>
              <ul className="space-y-4">
                {[
                  "Estabeleça um hábito diário de reflexão bíblica guiada",
                  "Aprofunde sua compreensão teológica em seu próprio ritmo",
                  "Conecte os ensinamentos bíblicos à sua realidade cotidiana",
                  "Desenvolva uma visão mais ampla do plano divino através das Escrituras"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chatgpt-accent mr-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/5dc8a9a6-6f14-4883-b9e9-30341e4efc9c.png" 
                alt="Crescimento espiritual" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Impacto Ministerial (Nova Seção) */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pl-12">
              <h2 className="text-3xl md:text-4xl font-medium text-stone-800 mb-6">Potencialize seu ministério</h2>
              <p className="text-stone-600 mb-6">
                Bible Chat oferece ferramentas poderosas para líderes, pastores e professores que desejam maximizar o impacto de seu ministério com recursos que economizam tempo e aprofundam conteúdos.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  "Sermões impactantes",
                  "Estudos bíblicos profundos",
                  "Devocional personalizado",
                  "Conteúdo para redes sociais",
                  "Material para células",
                  "Mentoria contextualizada",
                  "Respostas apologéticas",
                  "Aconselhamento bíblico"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-chatgpt-accent mr-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/b7516a63-b1e6-46bc-93c9-927bf0c2accf.png" 
                alt="Impacto ministerial" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Apoio ao Ensino (Nova Seção) */}
      <section className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Suporte completo para educação bíblica</h2>
            <p className="lp-subheading">
              Ferramentas especializadas para diferentes contextos de ensino
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Escola Dominical",
                features: [
                  "Planos de aula estruturados",
                  "Atividades interativas por faixa etária",
                  "Material visual complementar",
                  "Aplicações práticas contextualizadas"
                ]
              },
              {
                title: "Discipulado",
                features: [
                  "Roteiros progressivos de mentoria",
                  "Questões para reflexão e debate",
                  "Acompanhamento de desenvolvimento",
                  "Conteúdo adaptado ao nível espiritual"
                ]
              },
              {
                title: "Pregação",
                features: [
                  "Estruturas de sermões temáticos",
                  "Ilustrações e analogias relevantes",
                  "Insights contextuais e históricos",
                  "Aplicações contemporâneas da mensagem"
                ]
              }
            ].map((item, index) => (
              <div key={index} className="lp-card">
                <h3 className="text-xl font-medium text-stone-800 mb-6 pb-4 border-b border-stone-100">{item.title}</h3>
                <ul className="space-y-3">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-chatgpt-accent mr-3 flex-shrink-0" />
                      <span className="text-stone-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformação Pessoal (Nova Seção) */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl md:text-4xl font-medium text-stone-800 mb-8">Experiências transformadoras</h2>
            <p className="text-lg text-stone-600 max-w-3xl mb-12">
              O Bible Chat não é apenas uma ferramenta, mas um companheiro para sua jornada espiritual, ajudando a promover mudanças significativas em diferentes áreas da sua vida:
            </p>
            
            <div className="grid md:grid-cols-4 gap-6 w-full">
              {[
                {
                  area: "Conhecimento",
                  before: "Compreensão fragmentada dos textos",
                  after: "Visão integrada e contextualizada"
                },
                {
                  area: "Devoção",
                  before: "Leitura ocasional e superficial",
                  after: "Hábito consistente e profundo"
                },
                {
                  area: "Aplicação",
                  before: "Dificuldade em conectar texto e vida",
                  after: "Implementação prática dos princípios"
                },
                {
                  area: "Compartilhamento",
                  before: "Insegurança ao explicar passagens",
                  after: "Confiança para ensinar e inspirar outros"
                }
              ].map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                  <h3 className="text-lg font-medium text-chatgpt-accent mb-4">{item.area}</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="text-sm text-stone-400 mb-1">Antes</div>
                      <p className="text-stone-600">{item.before}</p>
                    </div>
                    <div className="h-0.5 w-full bg-stone-100"></div>
                    <div>
                      <div className="text-sm text-stone-400 mb-1">Depois</div>
                      <p className="text-stone-700 font-medium">{item.after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promessas / Garantias */}
      <section className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Nosso Compromisso</h2>
            <p className="lp-subheading">
              O que você pode esperar ao utilizar o Bible Chat
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Fidelidade Bíblica",
                description: "Compromisso com a integridade do texto sagrado e sua interpretação responsável."
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: "Qualidade Teológica",
                description: "Conteúdo baseado em sólidos princípios hermenêuticos e estudo acadêmico."
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "Experiência Transformadora",
                description: "Interações que não apenas informam, mas inspiram crescimento espiritual."
              }
            ].map((promise, index) => (
              <div key={index} className="lp-card flex flex-col items-start">
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-50 mb-6">
                  <div className="text-chatgpt-accent">
                    {promise.icon}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-stone-800 mb-3">{promise.title}</h3>
                <p className="text-stone-600">{promise.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Facilidades */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h2 className="text-3xl md:text-4xl font-medium text-stone-800 mb-6">Projetado para simplicidade</h2>
              <p className="text-stone-600 mb-6">
                Uma interface intuitiva que permite que você se concentre no que realmente importa: sua conexão com as Escrituras e seu crescimento espiritual.
              </p>
              <ul className="space-y-4">
                {[
                  "Acesso instantâneo a todos os 66 livros da Bíblia",
                  "Histórico completo de suas conversas e estudos",
                  "Templates prontos para diferentes necessidades ministeriais",
                  "Exportação fácil de conteúdos para uso em outros formatos"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chatgpt-accent mr-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/lovable-uploads/fb2119a5-5937-4cb3-9f11-bea6e009930f.png" 
                alt="Interface do Bible Chat" 
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Demo Interativa */}
      <section className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Experimente o Bible Chat</h2>
            <p className="lp-subheading">
              Veja como é simples obter respostas e insights bíblicos
            </p>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden max-w-3xl mx-auto">
            <div className="bg-stone-50 border-b border-stone-200 p-4 flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 text-sm text-stone-500">Demonstração do Bible Chat</div>
            </div>
            <div className="p-6">
              <div className="flex mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-chatgpt-accent mr-4">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="bg-stone-100 rounded-lg p-4 text-stone-700 max-w-[80%]">
                  <p>Olá! Como posso ajudar você com a Bíblia hoje?</p>
                </div>
              </div>
              <div className="flex justify-end mb-6">
                <div className="bg-chatgpt-accent text-white rounded-lg p-4 max-w-[80%]">
                  <p>Pode me explicar a parábola do semeador?</p>
                </div>
              </div>
              <div className="flex mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-chatgpt-accent mr-4">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div className="bg-stone-100 rounded-lg p-4 text-stone-700 max-w-[80%]">
                  <p>
                    A parábola do semeador (Mateus 13:1-23, Marcos 4:1-20, Lucas 8:4-15) é uma história que Jesus contou sobre um agricultor que espalhou sementes em diferentes tipos de solo.
                  </p>
                  <p className="mt-2">
                    As sementes representam a Palavra de Deus, e os diferentes solos simbolizam como as pessoas respondem à mensagem:
                  </p>
                  <ul className="mt-2 space-y-2">
                    <li>• <strong>Beira do caminho:</strong> Pessoas que ouvem mas não entendem; o inimigo rouba a semente.</li>
                    <li>• <strong>Solo pedregoso:</strong> Recebem com alegria mas sem raiz; desistem nas dificuldades.</li>
                    <li>• <strong>Entre espinhos:</strong> A Palavra é sufocada por preocupações e riquezas.</li>
                    <li>• <strong>Terra boa:</strong> Ouvem, entendem e produzem frutos abundantes.</li>
                  </ul>
                  <p className="mt-2">
                    Essa parábola nos ensina sobre a importância de cultivar um coração receptivo à Palavra de Deus para que ela possa frutificar em nossas vidas.
                  </p>
                </div>
              </div>
              <div className="relative mt-8">
                <input 
                  type="text" 
                  placeholder="Faça sua pergunta sobre a Bíblia..." 
                  className="w-full border border-stone-200 rounded-full py-3 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-chatgpt-accent focus:border-transparent"
                />
                <button className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-chatgpt-accent text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <p className="text-stone-500 mb-4">Experimente agora mesmo com acesso completo</p>
            <Button variant="minimal" size="minimal">
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </section>

      {/* Casos de Uso */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Como usar o Bible Chat</h2>
            <p className="lp-subheading">
              Diversas aplicações para enriquecer sua jornada espiritual
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Estudo Pessoal",
                description: "Aprofunde seu conhecimento bíblico através de perguntas e reflexões direcionadas."
              },
              {
                title: "Preparação de Sermões",
                description: "Desenvolva esboços, encontre ilustrações e organize pontos principais para pregações."
              },
              {
                title: "Ensino Infantil",
                description: "Adapte histórias bíblicas para crianças com linguagem e aplicações adequadas."
              },
              {
                title: "Grupos de Estudo",
                description: "Crie roteiros para discussão em grupo com perguntas instigantes e aplicações práticas."
              },
              {
                title: "Aconselhamento",
                description: "Encontre princípios bíblicos para situações específicas de aconselhamento pastoral."
              },
              {
                title: "Devocionais",
                description: "Gere reflexões diárias baseadas em passagens específicas para seu crescimento espiritual."
              }
            ].map((useCase, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                <h3 className="text-xl font-medium text-stone-800 mb-3">{useCase.title}</h3>
                <p className="text-stone-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="testimonials" className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">O que nossos usuários dizem</h2>
            <p className="lp-subheading">
              Descubra como o Bible Chat tem transformado a relação das pessoas com as Escrituras
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "O Bible Chat revolucionou minha preparação de sermões. O que antes me tomava horas, agora consigo fazer em minutos, com insights muito mais profundos.",
                author: "Pastor Carlos Silva",
                role: "Igreja Batista Central"
              },
              {
                quote: "Como professora da Escola Dominical, encontrei no Bible Chat um parceiro incrível. As explicações simples para crianças e as atividades sugeridas são perfeitas!",
                author: "Márcia Oliveira",
                role: "Educadora Cristã"
              },
              {
                quote: "Meus estudos pessoais ganharam outra dimensão. Consigo explorar temas e passagens com uma profundidade que nunca imaginei ser possível.",
                author: "Ricardo Mendes",
                role: "Líder de Jovens"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                <div className="text-chatgpt-accent mb-4">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.5 20H7.5C6.83696 20 6.20107 19.7366 5.73223 19.2678C5.26339 18.7989 5 18.163 5 17.5V12.5C5 11.837 5.26339 11.2011 5.73223 10.7322C6.20107 10.2634 6.83696 10 7.5 10H12.5C13.163 10 13.7989 10.2634 14.2678 10.7322C14.7366 11.2011 15 11.837 15 12.5V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M32.5 20H27.5C26.837 20 26.2011 19.7366 25.7322 19.2678C25.2634 18.7989 25 18.163 25 17.5V12.5C25 11.837 25.2634 11.2011 25.7322 10.7322C26.2011 10.2634 26.837 10 27.5 10H32.5C33.163 10 33.799 10.2634 34.2678 10.7322C34.7366 11.2011 35 11.837 35 12.5V25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="lp-testimonial">{testimonial.quote}</p>
                <p className="lp-testimonial-author">{testimonial.author}</p>
                <p className="text-sm text-stone-500">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-stone-50 lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Perguntas Frequentes</h2>
            <p className="lp-subheading">
              Esclarecendo suas dúvidas sobre o Bible Chat
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {[
              {
                question: "O Bible Chat substitui a leitura da Bíblia?",
                answer: "Não. O Bible Chat é uma ferramenta complementar que visa enriquecer sua leitura e estudo bíblico, nunca substituí-los. Incentivamos sempre a leitura direta da Palavra de Deus como fonte primária."
              },
              {
                question: "Qual tradução bíblica o Bible Chat utiliza?",
                answer: "O Bible Chat tem acesso a diversas traduções, incluindo NVI, ARA, NTLH, ARC e outras. Você pode especificar sua tradução preferida durante as conversas."
              },
              {
                question: "As respostas são teologicamente confiáveis?",
                answer: "Sim. Nosso sistema é treinado com base em interpretações teológicas sólidas e tradicionais do texto bíblico, evitando posicionamentos extremos ou controversos."
              },
              {
                question: "Posso usar o conteúdo gerado em minhas pregações?",
                answer: "Absolutamente! Todo conteúdo gerado pelo Bible Chat pode ser utilizado livremente em seus sermões, aulas, estudos e publicações, sem necessidade de atribuição."
              },
              {
                question: "Preciso ter conhecimento bíblico prévio?",
                answer: "Não. O Bible Chat é projetado para atender pessoas em qualquer nível de conhecimento bíblico, desde iniciantes até estudiosos avançados."
              }
            ].map((item, index) => (
              <div key={index} className="mb-6 bg-white rounded-lg p-6 shadow-sm border border-stone-100">
                <h3 className="text-lg font-medium text-stone-800 mb-3">{item.question}</h3>
                <p className="text-stone-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="pricing" className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="lp-heading">Planos simples e acessíveis</h2>
            <p className="lp-subheading">
              Escolha o plano que melhor atende às suas necessidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Plano Gratuito */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-stone-200">
              <div className="text-lg text-stone-800 font-medium mb-4">Plano Gratuito</div>
              <div className="text-4xl font-bold text-stone-800 mb-6">R$ 0<span className="text-lg font-normal text-stone-500">/mês</span></div>
              <p className="text-stone-600 mb-6">Perfeito para quem está começando sua jornada de estudos bíblicos</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Acesso a 10 livros bíblicos",
                  "50 mensagens por dia",
                  "Histórico limitado a 7 dias",
                  "Funcionalidades básicas de estudo"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="minimalOutline" className="w-full">Começar Grátis</Button>
            </div>

            {/* Plano Premium */}
            <div className="bg-blue-50 rounded-xl shadow-md p-8 border border-blue-100 relative transform md:scale-105">
              <div className="absolute -top-3 right-8 bg-chatgpt-accent text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <div className="text-lg text-stone-800 font-medium mb-4">Plano Premium</div>
              <div className="text-4xl font-bold text-stone-800 mb-6">R$ 19<span className="text-lg font-normal text-stone-500">/mês</span></div>
              <p className="text-stone-600 mb-6">Acesso completo para uso individual intensivo</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Acesso a todos os 66 livros bíblicos",
                  "Mensagens ilimitadas",
                  "Histórico completo permanente",
                  "Exportação em PDF e Word",
                  "Geração de sermões e estudos",
                  "Suporte prioritário"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-chatgpt-accent mr-3 flex-shrink-0" />
                    <span className="text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="minimal" className="w-full">Assinar Agora</Button>
            </div>

            {/* Plano Ministério */}
            <div className="bg-white rounded-xl shadow-sm p-8 border border-stone-200">
              <div className="text-lg text-stone-800 font-medium mb-4">Plano Ministério</div>
              <div className="text-4xl font-bold text-stone-800 mb-6">R$ 49<span className="text-lg font-normal text-stone-500">/mês</span></div>
              <p className="text-stone-600 mb-6">Ideal para equipes ministeriais e igrejas</p>
              <ul className="space-y-3 mb-8">
                {[
                  "Tudo do plano Premium",
                  "Até 5 usuários",
                  "Biblioteca compartilhada",
                  "Templates ministeriais exclusivos",
                  "Treinamento personalizado",
                  "API para integração com sistemas"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-stone-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button variant="minimalOutline" className="w-full">Contatar Vendas</Button>
            </div>
          </div>

          <div className="text-center mt-12 text-stone-500">
            <p>Todos os planos incluem atualizações gratuitas. Garantia de reembolso em 14 dias.</p>
          </div>
        </div>
      </section>

      {/* Vídeo Depoimentos */}
      <section className="bg-stone-900 text-white lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">Histórias inspiradoras</h2>
            <p className="text-xl text-stone-300 max-w-3xl mx-auto">
              Veja como o Bible Chat tem transformado ministérios e vidas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((video, index) => (
              <div key={index} className="bg-stone-800 rounded-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-stone-700">
                  <div className="flex items-center justify-center h-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white opacity-80" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Depoimento de Usuário {index + 1}</h3>
                  <p className="text-stone-400 text-sm">"O Bible Chat transformou completamente a forma como eu estudo as Escrituras e preparo minhas aulas."</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="lp-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl p-10 md:p-16 text-white text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Comece sua jornada bíblica transformadora hoje</h2>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Junte-se a milhares de cristãos que estão aprofundando seu conhecimento bíblico e enriquecendo seus ministérios com Bible Chat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                variant="default"
                size="lg"
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                Criar Conta Gratuita
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white/10"
              >
                Ver Demonstração
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img
                src="/lovable-uploads/logo-jd-bible-chat.png"
                alt="Bible Chat Logo"
                className="h-8 w-auto mb-4"
              />
              <p className="text-stone-400 text-sm">
                Revolucionando a maneira como cristãos estudam e aplicam a Palavra de Deus através da tecnologia.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Produto</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-white">Recursos</a></li>
                <li><a href="#" className="hover:text-white">Planos</a></li>
                <li><a href="#" className="hover:text-white">Depoimentos</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Suporte</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-white">Documentação</a></li>
                <li><a href="#" className="hover:text-white">Tutoriais</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Legal</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-12 pt-8 text-center text-stone-400 text-sm">
            <p>© {new Date().getFullYear()} Bible Chat. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
