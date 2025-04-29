
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const UsageSection = () => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-semibold mb-4">Uso</h2>
      <Card>
        <CardHeader>
          <CardTitle>Utilização</CardTitle>
          <CardDescription>Seu histórico de uso da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Suas estatísticas de uso aparecem aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageSection;
