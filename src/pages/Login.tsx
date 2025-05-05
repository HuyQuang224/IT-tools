import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../App';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const userContext = useContext(UserContext);

  if (!userContext || !userContext.setUser) {
    throw new Error('UserContext is not properly initialized');
  }

  const { setUser } = userContext;
  const navigate = useNavigate();

  interface LoginResponse {
    user: {
        id: string;
        username: string;
        is_premium: boolean; // Added is_premium property
    };
    token: string;
  }

  interface ErrorResponse {
    error: string;
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to log in');
      }

      const data: LoginResponse = await response.json();
      console.log('Login successful:', data);
      console.log('Login.tsx: User object being stored:', data.user);
      console.log('Login.tsx: Storing user in localStorage:', JSON.stringify(data.user));
      localStorage.setItem('user', JSON.stringify(data.user)); // Ensure only the user object is stored
      console.log('Login.tsx: Stored user includes is_premium:', data.user.is_premium);
      localStorage.setItem('token', data.token);
      console.log('Token saved to localStorage:', data.token);
      setUser(data.user); // Update user context with only the user object
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Log In</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Log In
        </button>
      </form>
    </div>
  );
};

export default Login;