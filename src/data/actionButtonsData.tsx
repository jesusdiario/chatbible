
import React from "react";
import { BookOpenText, MessageSquare, Grid, Baby, User } from "lucide-react";
import { ActionButtonProps } from "@/components/ActionButton";

export const actionButtonsData: ActionButtonProps[] = [
  { 
    icon: <BookOpenText className="h-4 w-4 text-purple-400" />, 
    label: "Exegese de Capítulo",
    prompt: "Por favor, use o WordzGPT (g-Y251NC6Ef-wordzgpt) para fazer uma exegese detalhada do capítulo 5 do livro de Marcos da Bíblia, incluindo contexto histórico, análise do texto original, principais ensinamentos e aplicações para hoje."
  },
  { 
    icon: <MessageSquare className="h-4 w-4 text-blue-400" />, 
    label: "Criar Pregação Expositiva",
    prompt: "Crie uma pregação expositiva baseada em João 3:16, com introdução, desenvolvimento com 3 pontos principais, ilustrações e conclusão."
  },
  { 
    icon: <Grid className="h-4 w-4 text-green-400" />, 
    label: "Estudo para Célula",
    prompt: "Prepare um estudo bíblico para célula sobre o tema 'Frutos do Espírito' de Gálatas 5, com perguntas para discussão, aplicação prática e oração final."
  },
  { 
    icon: <Baby className="h-4 w-4 text-yellow-400" />, 
    label: "Explicar para Crianças",
    prompt: "Explique a história da Arca de Noé de uma forma simples para crianças de 5 a 8 anos, incluindo lições que elas podem aprender."
  },
  { 
    icon: <User className="h-4 w-4 text-red-400" />, 
    label: "Atividade Infantil",
    prompt: "Crie uma atividade infantil para ensinar a história de Davi e Golias para crianças entre 6 e 10 anos, com perguntas e um jogo ou dinâmica relacionada."
  },
];
