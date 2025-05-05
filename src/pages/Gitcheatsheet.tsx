"use client"

import { useState, useEffect } from 'react';
import { Copy, Search } from 'lucide-react';

interface GitCommand {
  command: string;
  description: string;
  example?: string;
}

interface GitCommandCategory {
  name: string;
  commands: GitCommand[];
}

const GitCheatsheetTool = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Getting Started");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Git Cheatsheet');
        if (!response.ok) {
          throw new Error('Failed to fetch tool details');
        }
        const data = await response.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error('Error fetching tool details:', err);
      }
    };

    fetchToolDetails();
  }, []);

  const gitCommands: GitCommandCategory[] = [
    {
      name: "Getting Started",
      commands: [
        {
          command: "git init",
          description: "Initialize a new Git repository",
          example: "git init my-project",
        },
        {
          command: "git clone",
          description: "Clone a repository into a new directory",
          example: "git clone https://github.com/user/repo.git",
        },
        {
          command: "git config",
          description: "Set configuration options",
          example: "git config --global user.name 'Your Name'",
        },
      ],
    },
    // ... (keep all other categories and commands from the original file)
    {
      name: "Advanced",
      commands: [
        {
          command: "git cherry-pick",
          description: "Apply the changes introduced by some existing commits",
          example: "git cherry-pick commit-hash",
        },
        {
          command: "git reflog",
          description: "Manage reflog information",
          example: "git reflog",
        },
        {
          command: "git bisect",
          description: "Use binary search to find the commit that introduced a bug",
          example: "git bisect start\ngit bisect bad\ngit bisect good commit-hash",
        },
        {
          command: "git worktree",
          description: "Manage multiple working trees",
          example: "git worktree add ../path/to/directory branch-name",
        },
      ],
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filterCommands = (category: GitCommandCategory) => {
    if (!searchQuery) return category.commands;

    return category.commands.filter(
      (cmd) =>
        cmd.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cmd.example && cmd.example.toLowerCase().includes(searchQuery.toLowerCase())),
    );
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search Git commands..."
            className="pl-9 w-full p-2 border border-gray-300 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {gitCommands.map((category) => (
            <button
              key={category.name}
              className={`px-3 py-1 rounded ${activeCategory === category.name ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {gitCommands
            .filter((category) => category.name === activeCategory)
            .map((category) => (
              <div key={category.name}>
                {filterCommands(category).length > 0 ? (
                  filterCommands(category).map((cmd, index) => (
                    <div key={index} className="bg-white p-4 rounded shadow mb-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <code className="bg-gray-200 px-2 py-1 rounded font-mono text-sm">
                              {cmd.command}
                            </code>
                            <button
                              onClick={() => copyToClipboard(cmd.command)}
                              className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              <Copy className="h-3.5 w-3.5 mr-1" />
                              Copy
                            </button>
                          </div>
                          <p className="text-sm text-gray-700">{cmd.description}</p>
                          {cmd.example && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500 mb-1">Example:</p>
                              <div className="flex items-center">
                                <code className="bg-gray-200 px-2 py-1 rounded font-mono text-xs block w-full whitespace-pre">
                                  {cmd.example}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(cmd.example || "")}
                                  className="ml-2 flex items-center px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                >
                                  <Copy className="h-3.5 w-3.5 mr-1" />
                                  Copy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No commands found matching "{searchQuery}"
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default GitCheatsheetTool;