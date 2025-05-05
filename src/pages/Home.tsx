import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Heart,
  HeartOff,
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  route_path: string;
  is_premium?: boolean;
  disabled?: boolean;
}

interface Category {
  tools: Tool[];
}

const Home = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<{ is_premium: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const location = useLocation();

  // Extract search query from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('query') || '';
    setSearchTerm(query);
  }, [location.search]);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/categories-with-tools');
        if (!response.ok) throw new Error('Failed to fetch tools');
        const data = await response.json();
        const allTools: Tool[] = data.flatMap((category: Category) => category.tools);
        setTools(allTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await fetch('/api/favorites', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            setFavorites([]);
            return;
          }
          throw new Error('Failed to fetch favorites');
        }
        const data = await response.json();
        setFavorites(data.map((fav: { id: string }) => fav.id));
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    const fetchUser = async () => {
      try {
        const response = await fetch('/api/user', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchTools();
    fetchFavorites();
    fetchUser();
  }, []);

  const toggleFavorite = async (toolId: string) => {
    if (!localStorage.getItem('token')) {
      alert('You must be logged in to interact with favorites.');
      return;
    }

    try {
      const isFavorite = favorites.includes(toolId);
      const response = await fetch(`/api/favorites/${toolId}`, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to update favorite');
      setFavorites((prev) =>
        isFavorite ? prev.filter((id) => id !== toolId) : [...prev, toolId]
      );
    } catch (err) {
      console.error('Error updating favorite:', err);
    }
  };

  const filteredTools = tools
    .filter((tool) =>
      tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((tool) => {
      if (tool.is_premium && (!user || !user.is_premium)) {
        return { ...tool, disabled: true }; // Mark premium tools as disabled for non-premium users or unauthenticated users
      }
      return tool;
    });

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6">Available Tools</h1>

      {/* Search input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search tools..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className={`bg-white p-4 rounded shadow ${tool.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Link
              to={tool.route_path}
              className={`text-xl font-semibold mb-2 text-indigo-600 hover:underline ${tool.disabled ? 'pointer-events-none' : ''}`}
            >
              {tool.name}
            </Link>
            <p className="text-gray-700 mb-4">{tool.description}</p>
            <button
              onClick={() => toggleFavorite(tool.id)}
              className={`text-2xl flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 ${!localStorage.getItem('token') || tool.disabled
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-100'
                }`}
              disabled={!localStorage.getItem('token') || tool.disabled}
            >
              {favorites.includes(tool.id) ? (
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

export default Home;
