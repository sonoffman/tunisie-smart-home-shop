
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft } from "lucide-react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-6xl font-bold text-gray-900 mb-4">404</CardTitle>
            <h2 className="text-2xl font-semibold text-gray-700">Page non trouvée</h2>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <p className="text-gray-600">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
            </p>
            <p className="text-sm text-gray-500">
              URL demandée : <code className="bg-gray-100 px-2 py-1 rounded">{location.pathname}</code>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="flex items-center gap-2">
                <Link to="/">
                  <Home className="h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Page précédente
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFound;
