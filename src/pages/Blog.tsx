
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Clock } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  created_at: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data as BlogPost[]);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de charger les articles: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to extract a summary from content (first 150 characters)
  const getSummary = (content: string) => {
    const strippedContent = content.replace(/<[^>]*>/g, '');
    return strippedContent.length > 150 
      ? `${strippedContent.substring(0, 150)}...` 
      : strippedContent;
  };

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Dummy posts for initial content
  const dummyPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Comment démarrer avec la domotique SONOFF',
      slug: 'comment-demarrer-avec-la-domotique-sonoff',
      content: '<p>La domotique permet d\'automatiser et de contrôler différents éléments de votre maison comme l\'éclairage, le chauffage, ou encore les volets roulants. Avec les produits SONOFF, cette transition vers une maison intelligente n\'a jamais été aussi simple.</p><p>Pour commencer votre installation domotique, nous vous recommandons de vous équiper d\'abord des modules SONOFF BASIC qui permettent de contrôler vos lumières et appareils électriques. Ces modules sont faciles à installer et à configurer via l\'application eWeLink.</p><p>Une fois que vous maîtrisez ces bases, vous pourrez évoluer vers des modules plus spécifiques comme des interrupteurs muraux, des prises connectées, ou encore des capteurs de température.</p>',
      featured_image: 'https://placehold.co/600x400/jpg',
      created_at: '2023-05-15T10:00:00.000Z',
    },
    {
      id: '2',
      title: 'Les avantages des interrupteurs connectés SONOFF',
      slug: 'les-avantages-des-interrupteurs-connectes-sonoff',
      content: '<p>Les interrupteurs connectés SONOFF offrent de nombreux avantages par rapport aux interrupteurs traditionnels. Tout d\'abord, ils vous permettent de contrôler vos lumières à distance via votre smartphone ou votre tablette. Fini le temps où vous deviez vous lever pour éteindre une lumière oubliée!</p><p>Ces interrupteurs peuvent également être programmés pour s\'allumer ou s\'éteindre à certaines heures de la journée, ce qui peut être pratique pour simuler une présence lorsque vous êtes en vacances. Ils peuvent aussi être contrôlés par la voix si vous les associez à un assistant vocal comme Alexa ou Google Home.</p><p>Enfin, les interrupteurs SONOFF sont très faciles à installer et ne nécessitent pas de travaux importants dans votre maison.</p>',
      featured_image: 'https://placehold.co/600x400/jpg',
      created_at: '2023-06-20T11:30:00.000Z',
    },
    {
      id: '3',
      title: 'Sécurisez votre maison avec les capteurs SONOFF',
      slug: 'securisez-votre-maison-avec-les-capteurs-sonoff',
      content: '<p>La sécurité est une préoccupation majeure pour tous les propriétaires. Les capteurs SONOFF peuvent vous aider à renforcer la sécurité de votre maison de manière simple et abordable.</p><p>Les détecteurs d\'ouverture SONOFF DW2 vous alertent immédiatement lorsqu\'une porte ou une fenêtre est ouverte. Vous pouvez recevoir ces alertes directement sur votre smartphone, où que vous soyez. Ces capteurs sont sans fil et très faciles à installer.</p><p>Pour une sécurité encore plus complète, vous pouvez ajouter des détecteurs de mouvement SONOFF PIRS2. Ces capteurs détectent tout mouvement dans leur champ de vision et peuvent déclencher une alarme ou allumer automatiquement les lumières.</p><p>En combinant ces différents capteurs et en les intégrant à votre système domotique existant, vous pouvez créer un système de sécurité personnalisé qui répond parfaitement à vos besoins.</p>',
      featured_image: 'https://placehold.co/600x400/jpg',
      created_at: '2023-07-05T09:15:00.000Z',
    }
  ];

  // If there are no posts and we're not loading, use dummy posts
  useEffect(() => {
    if (!loading && posts.length === 0) {
      setPosts(dummyPosts);
    }
  }, [loading, posts.length]);

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2 text-sonoff-blue">Blog</h1>
        <p className="text-gray-600 mb-8">Découvrez nos articles sur la domotique et les maisons connectées</p>
        
        {loading ? (
          <div className="flex justify-center">
            <p>Chargement des articles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-shadow">
                {post.featured_image && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={post.featured_image} 
                      alt={post.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <CardDescription className="flex items-center text-sm text-gray-500">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    {formatDate(post.created_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-gray-600">
                    {getSummary(post.content)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to={`/blog/${post.slug}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Lire l'article
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Blog;
