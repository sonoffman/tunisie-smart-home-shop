
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image: string | null;
  created_at: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        // Check if it's a "no rows returned" error
        if (error.code === 'PGRST116') {
          // Return dummy content for the requested slug
          setPost(getDummyPostBySlug(slug));
        } else {
          throw error;
        }
      } else {
        setPost(data as BlogPost);
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: `Impossible de charger l'article: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Dummy posts data
  const getDummyPostBySlug = (requestedSlug: string | undefined) => {
    const dummyPosts: Record<string, BlogPost> = {
      'comment-demarrer-avec-la-domotique-sonoff': {
        id: '1',
        title: 'Comment démarrer avec la domotique SONOFF',
        slug: 'comment-demarrer-avec-la-domotique-sonoff',
        content: '<h2>Introduction à la domotique</h2><p>La domotique permet d\'automatiser et de contrôler différents éléments de votre maison comme l\'éclairage, le chauffage, ou encore les volets roulants. Avec les produits SONOFF, cette transition vers une maison intelligente n\'a jamais été aussi simple.</p><h2>Les premiers pas</h2><p>Pour commencer votre installation domotique, nous vous recommandons de vous équiper d\'abord des modules SONOFF BASIC qui permettent de contrôler vos lumières et appareils électriques. Ces modules sont faciles à installer et à configurer via l\'application eWeLink.</p><p>Une fois que vous maîtrisez ces bases, vous pourrez évoluer vers des modules plus spécifiques comme des interrupteurs muraux, des prises connectées, ou encore des capteurs de température.</p><h2>Choisir ses appareils</h2><p>Il existe de nombreux appareils SONOFF pour répondre à tous vos besoins en matière de domotique. Voici quelques-uns des plus populaires :</p><ul><li>SONOFF BASIC : un interrupteur connecté simple et abordable</li><li>SONOFF MINI : un mini interrupteur qui peut être installé derrière vos interrupteurs muraux existants</li><li>SONOFF POW : un interrupteur qui permet également de mesurer la consommation électrique</li><li>SONOFF 4CH : un interrupteur à quatre canaux pour contrôler plusieurs appareils</li></ul><p>Prenez le temps de bien définir vos besoins avant de faire votre choix.</p>',
        featured_image: 'https://placehold.co/800x400/jpg',
        created_at: '2023-05-15T10:00:00.000Z',
      },
      'les-avantages-des-interrupteurs-connectes-sonoff': {
        id: '2',
        title: 'Les avantages des interrupteurs connectés SONOFF',
        slug: 'les-avantages-des-interrupteurs-connectes-sonoff',
        content: '<h2>Contrôle à distance</h2><p>Les interrupteurs connectés SONOFF offrent de nombreux avantages par rapport aux interrupteurs traditionnels. Tout d\'abord, ils vous permettent de contrôler vos lumières à distance via votre smartphone ou votre tablette. Fini le temps où vous deviez vous lever pour éteindre une lumière oubliée!</p><h2>Programmation et automatisation</h2><p>Ces interrupteurs peuvent également être programmés pour s\'allumer ou s\'éteindre à certaines heures de la journée, ce qui peut être pratique pour simuler une présence lorsque vous êtes en vacances. Ils peuvent aussi être contrôlés par la voix si vous les associez à un assistant vocal comme Alexa ou Google Home.</p><h2>Facilité d\'installation</h2><p>Enfin, les interrupteurs SONOFF sont très faciles à installer et ne nécessitent pas de travaux importants dans votre maison. La plupart des modèles peuvent être installés en quelques minutes, même si vous n\'avez pas de connaissances particulières en électricité.</p><h2>Économies d\'énergie</h2><p>En contrôlant précisément quand vos appareils sont allumés, vous pouvez réaliser d\'importantes économies d\'énergie. Par exemple, vous pouvez programmer vos lumières pour qu\'elles s\'éteignent automatiquement lorsque vous quittez une pièce, ou régler votre chauffage pour qu\'il s\'allume juste avant votre retour à la maison.</p>',
        featured_image: 'https://placehold.co/800x400/jpg',
        created_at: '2023-06-20T11:30:00.000Z',
      },
      'securisez-votre-maison-avec-les-capteurs-sonoff': {
        id: '3',
        title: 'Sécurisez votre maison avec les capteurs SONOFF',
        slug: 'securisez-votre-maison-avec-les-capteurs-sonoff',
        content: '<h2>L\'importance de la sécurité domestique</h2><p>La sécurité est une préoccupation majeure pour tous les propriétaires. Les capteurs SONOFF peuvent vous aider à renforcer la sécurité de votre maison de manière simple et abordable.</p><h2>Détecteurs d\'ouverture</h2><p>Les détecteurs d\'ouverture SONOFF DW2 vous alertent immédiatement lorsqu\'une porte ou une fenêtre est ouverte. Vous pouvez recevoir ces alertes directement sur votre smartphone, où que vous soyez. Ces capteurs sont sans fil et très faciles à installer.</p><h2>Détecteurs de mouvement</h2><p>Pour une sécurité encore plus complète, vous pouvez ajouter des détecteurs de mouvement SONOFF PIRS2. Ces capteurs détectent tout mouvement dans leur champ de vision et peuvent déclencher une alarme ou allumer automatiquement les lumières.</p><h2>Créer un système intégré</h2><p>En combinant ces différents capteurs et en les intégrant à votre système domotique existant, vous pouvez créer un système de sécurité personnalisé qui répond parfaitement à vos besoins. Vous pouvez par exemple programmer vos lumières pour qu\'elles s\'allument automatiquement si un mouvement est détecté la nuit, ou recevoir une notification si une porte est ouverte alors que vous êtes absent.</p><p>Avec les produits SONOFF, vous pouvez avoir l\'esprit tranquille en sachant que votre maison est bien protégée, que vous soyez chez vous ou à l\'autre bout du monde.</p>',
        featured_image: 'https://placehold.co/800x400/jpg',
        created_at: '2023-07-05T09:15:00.000Z',
      }
    };

    // Default post if the slug doesn't match any known posts
    const defaultPost: BlogPost = {
      id: '404',
      title: 'Article non trouvé',
      slug: '404',
      content: '<p>Désolé, l\'article que vous cherchez n\'existe pas ou a été déplacé.</p>',
      featured_image: null,
      created_at: new Date().toISOString(),
    };

    return dummyPosts[requestedSlug || ''] || defaultPost;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <p className="text-center">Chargement de l'article...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="bg-red-50 p-4 rounded-md">
            <h1 className="text-2xl font-bold text-red-700">Article non trouvé</h1>
            <p className="mt-2 text-red-600">
              Désolé, l'article que vous cherchez n'existe pas ou a été déplacé.
            </p>
            <Link to="/blog">
              <Button className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au blog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <Link to="/blog">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au blog
          </Button>
        </Link>
        
        <article className="bg-white rounded-lg overflow-hidden shadow">
          {post.featured_image && (
            <div className="relative h-64 md:h-96 overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-sonoff-blue">{post.title}</h1>
            
            <div className="flex items-center text-sm text-gray-500 mb-6">
              <Calendar className="mr-1 h-4 w-4" />
              <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
            </div>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPost;
