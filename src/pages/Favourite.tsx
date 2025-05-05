import { useState, useEffect } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favourite = () => {
  interface Tool {
    id: number;
    name?: string;
    description?: string;
    route_path?: string;
    is_premium?: boolean;
  }
  
  const [favorites, setFavorites] = useState<Tool[]>([]);
  const [user, setUser] = useState<{ is_premium: boolean } | null>(null);

  useEffect(() => {
    console.log('Favourite component mounted');

    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found in localStorage');
          throw new Error('User is not logged in');
        }

        console.log('Fetching favorites with token:', token);
        const response = await fetch('/api/favorites', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch favorites, status:', response.status);
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        console.log('Fetched favorites:', data);
        setFavorites(data);
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.warn('No token found in localStorage');
          throw new Error('User is not logged in');
        }

        console.log('Fetching user with token:', token);
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          console.error('Failed to fetch user, status:', response.status);
          throw new Error('Failed to fetch user');
        }
        const data = await response.json();
        console.log('Fetched user:', data);
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchFavorites();
    fetchUser();
  }, []);

  const toggleFavorite = async (toolId: number): Promise<void> => {
    try {
      const token: string | null = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not logged in');
      }

      const isFavorite: boolean = favorites.some((tool) => tool.id === toolId);
      const response: Response = await fetch(`/api/favorites/${toolId}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update favorite');
      }

      setFavorites((prev: Tool[]) =>
        isFavorite
          ? prev.filter((tool) => tool.id !== toolId)
          : [...prev, { id: toolId }]
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const filteredFavorites = favorites.filter((tool) => {
    if (tool.is_premium && (!user || !user.is_premium)) {
      return false; // Exclude premium tools for non-premium users or unauthenticated users
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Favourite Tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFavorites.map((tool) => (
          <div key={tool.id} className="bg-white p-4 rounded shadow">
            <Link to={tool.route_path || '#'} className="text-xl font-semibold mb-2 text-indigo-600 hover:underline">{tool.name}</Link>
            <p className="text-gray-700 mb-4">{tool.description}</p>
            <button
              onClick={() => toggleFavorite(tool.id)}
              className="text-2xl flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 hover:bg-gray-100"
            >
              {favorites.some((fav) => fav.id === tool.id) ? (
                <Heart className="text-red-500" />
              ) : (
                <HeartOff className="text-gray-500" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favourite;