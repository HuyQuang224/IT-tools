import React, { createContext, lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Favourite from './pages/Favourite';
import ProtectedRoute from './components/ProtectedRoute';

interface UserContextType {
  user: any; // Replace 'any' with a specific type if you know the structure of 'user'
  setUser: React.Dispatch<React.SetStateAction<any>>; // Replace 'any' with the same type as 'user'
}

export const UserContext = createContext<UserContextType | null>(null);

function App() {
  const [user, setUser] = useState(null);
  interface DynamicRoute {
    id?: string; // Include the tool ID
    path: string;
    component: React.LazyExoticComponent<React.ComponentType<any>>;
    is_active: boolean;
    is_premium?: boolean; // Add the is_premium property
  }

  const [dynamicRoutes, setDynamicRoutes] = useState<DynamicRoute[]>([]);

  useEffect(() => {
    console.log('App.tsx: Checking localStorage for user and token...');
    console.log('App.tsx: localStorage user:', localStorage.getItem('user'));
    console.log('App.tsx: localStorage token:', localStorage.getItem('token'));
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedData = JSON.parse(storedUser);
        console.log('App.tsx: Restoring user from localStorage:', parsedData);
        setUser(parsedData); // Directly set the parsed user object
      } catch (error) {
        console.error('App.tsx: Failed to parse user from localStorage:', error);
        localStorage.removeItem('user'); // Clear invalid user data
      }
    } else {
      console.log('App.tsx: No user found in localStorage');
    }

    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log('App.tsx: Restoring token from localStorage:', storedToken);
    } else {
      console.log('App.tsx: No token found in localStorage');
    }
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/categories-with-tools');
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        const data = await response.json();
        console.log('Fetched tools:', data); // Log dữ liệu nhận được
        interface Tool {
          id: string; // Include the tool ID
          route_path: string;
          name: string;
          is_active: boolean;
          is_premium?: boolean; // Add the is_premium property
        }

        interface Category {
          tools: Tool[];
        }

        const routes: DynamicRoute[] = data.flatMap((category: Category) =>
          category.tools.map((tool: Tool) => ({
            id: tool.id, // Include the tool ID
            path: tool.route_path,
            component: lazy(() => import(`./pages/${tool.name.replace(/\s+/g, '')}.tsx`)),
            is_active: tool.is_active,
            is_premium: tool.is_premium, // Map the is_premium property
          }))
        );
        console.log('Generated routes:', routes); // Log các route được tạo
        setDynamicRoutes(routes);
      } catch (err) {
        console.error('Error fetching tools:', err);
      }
    };

    fetchTools();
  }, []);

  const handleLogout = () => {
    setUser(null); // Clear the user state
    localStorage.removeItem('user'); // Remove user data from localStorage
    console.log('User logged out successfully');
  };

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/favourite" element={<Favourite />} />
                  <Route path="/favourites" element={<Favourite />} />
                  {dynamicRoutes.map((route) => (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <ProtectedRoute toolId={route.id ?? ''} isPremium={route.is_premium ?? false}>
                          <route.component />
                        </ProtectedRoute>
                      }
                    />
                  ))}
                </Routes>
              </Suspense>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;