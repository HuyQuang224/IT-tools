import React, { useState, useEffect } from 'react';

const Admin = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [toolName, setToolName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [routePath, setRoutePath] = useState('');
  const [fileCode, setFileCode] = useState('');
  const [message, setMessage] = useState('');
  const [tools, setTools] = useState<{ id: string; name: string; is_premium: boolean; is_active: boolean }[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/categories-with-tools');
        if (!response.ok) {
          throw new Error('Failed to fetch tools');
        }
        const data = await response.json();
        const allTools = data.flatMap((category: { tools: any[] }) => category.tools);
        setTools(allTools);
      } catch (err) {
        console.error('Error fetching tools:', err);
      }
    };

    fetchTools();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/upgrade-requests');
        if (!response.ok) {
          throw new Error('Failed to fetch upgrade requests');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error('Error fetching upgrade requests:', err);
      }
    };

    fetchRequests();
  }, []);

  interface ToolPayload {
    name: string;
    category_id: string;
    description: string;
    route_path: string;
    file_code: string;
  }

  const handleAddTool = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      const payload: ToolPayload = {
        name: toolName,
        category_id: categoryId,
        description,
        route_path: routePath,
        file_code: fileCode,
      };

      const response = await fetch('/api/add-tool', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add tool');
      }

      setMessage('Tool added successfully! Reloading the page...');
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      setToolName('');
      setCategoryId('');
      setDescription('');
      setRoutePath('');
      setFileCode('');

      // Fetch updated tools to reflect changes in the Sidebar
      const toolsResponse = await fetch('/api/categories-with-tools');
      if (toolsResponse.ok) {
        const updatedTools = await toolsResponse.json();
        console.log('Updated tools:', updatedTools); // Log updated tools
      }
    } catch (err) {
      console.error('Error adding tool:', err);
      setMessage('Error adding tool');
    }
  };

  const toggleToolStatus = async (toolId: string, field: 'is_premium' | 'is_active') => {
    try {
      const response = await fetch(`/api/tools/${toolId}/toggle-${field}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to toggle ${field}`);
      }
      setTools((prevTools) =>
        prevTools.map((tool) =>
          tool.id === toolId ? { ...tool, [field]: !tool[field] } : tool
        )
      );
    } catch (err) {
      console.error(`Error toggling ${field}:`, err);
    }
  };

  interface DeleteToolResponse {
    ok: boolean;
  }

  const deleteTool = async (toolId: string): Promise<void> => {
    try {
      const response: DeleteToolResponse = await fetch(`/api/delete-tool/${toolId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete tool');
      }
      alert('Tool deleted successfully!');
      window.location.reload(); // Reload the page after successful deletion
    } catch (err) {
      console.error('Error deleting tool:', err);
      alert('Failed to delete tool.');
    }
  };

  interface ApproveRequestResponse {
    ok: boolean;
  }

  const handleApprove = async (userId: string): Promise<void> => {
    try {
      const response: ApproveRequestResponse = await fetch(`/api/approve-request/${userId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to approve request');
      }
      setRequests((prev: Request[]) => prev.filter((req: Request) => req.user_id !== userId));
      alert('Request approved successfully!');
    } catch (err) {
      console.error('Error approving request:', err);
      alert('Failed to approve request.');
    }
  };

  interface RejectRequestResponse {
    ok: boolean;
  }

  interface Request {
    user_id: string;
    username: string;
  }

  const handleReject = async (userId: string): Promise<void> => {
    try {
      const response: RejectRequestResponse = await fetch(`/api/reject-request/${userId}`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to reject request');
      }
      setRequests((prev: Request[]) => prev.filter((req: Request) => req.user_id !== userId));
      alert('Request rejected successfully!');
    } catch (err) {
      console.error('Error rejecting request:', err);
      alert('Failed to reject request.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Admin - Add Tool</h1>
      {message && <p className="mb-4 text-green-500">{message}</p>}
      <form onSubmit={handleAddTool} className="space-y-4">
        <div>
          <label htmlFor="toolName" className="block text-sm font-medium text-gray-700">
            Tool Name
          </label>
          <input
            type="text"
            id="toolName"
            value={toolName}
            onChange={(e) => setToolName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="routePath" className="block text-sm font-medium text-gray-700">
            Route Path
          </label>
          <input
            type="text"
            id="routePath"
            value={routePath}
            onChange={(e) => setRoutePath(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <div>
          <label htmlFor="fileCode" className="block text-sm font-medium text-gray-700">
            File Code (Upload from your computer)
          </label>
          <input
            type="file"
            id="fileCode"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = (event) => {
                  if (event.target && event.target.result) {
                    setFileCode(event.target.result as string);
                  }
                };
                reader.readAsText(file);
              }
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Add Tool
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Manage Tools</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Tool Name</th>
              <th className="px-4 py-2 border-b">Premium</th>
              <th className="px-4 py-2 border-b">Active</th>
              <th className="px-4 py-2 border-b">Delete</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td className="px-4 py-2 border-b">{tool.name}</td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => toggleToolStatus(tool.id, 'is_premium')}
                    className={`px-2 py-1 rounded ${tool.is_premium ? 'bg-green-500 text-white' : 'bg-gray-300 text-black'}`}
                  >
                    {tool.is_premium ? 'Yes' : 'No'}
                  </button>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => toggleToolStatus(tool.id, 'is_active')}
                    className={`px-2 py-1 rounded ${tool.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                  >
                    {tool.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2 border-b text-center">
                  <button
                    onClick={() => deleteTool(tool.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-100 p-4 rounded shadow mt-10">
        <h2 className="text-xl font-semibold mb-4">Upgrade Requests</h2>
        {requests.length === 0 ? (
          <p>No upgrade requests available.</p>
        ) : (
          <ul>
            {requests.map((request) => (
              <li key={request.user_id} className="mb-4">
                <p>Username: {request.username}</p>
                <div className="flex space-x-4 mt-2">
                  <button
                    onClick={() => handleApprove(request.user_id)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.user_id)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Admin;