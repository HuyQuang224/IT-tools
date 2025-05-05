import React, { useState, useEffect } from 'react';

interface EmojiCategory {
  name: string;
  emojis: Emoji[];
}

interface Emoji {
  emoji: string;
  description: string;
  category: string;
  aliases: string[];
  tags: string[];
}

const EmojiPicker = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<EmojiCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredEmojis, setFilteredEmojis] = useState<Emoji[]>([]);
  const [recentEmojis, setRecentEmojis] = useState<Emoji[]>([]);
  const [copiedEmoji, setCopiedEmoji] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Emoji Picker');
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

    // Load emoji data
    setTimeout(() => {
      const emojiData: Emoji[] = [
        { emoji: "😀", description: "Grinning Face", category: "smileys", aliases: ["grinning"], tags: ["happy", "smile"] },
        { emoji: "😃", description: "Grinning Face With Big Eyes", category: "smileys", aliases: ["smiley"], tags: ["happy", "joy"] },
        { emoji: "😄", description: "Grinning Face With Smiling Eyes", category: "smileys", aliases: ["smile"], tags: ["joy", "cheerful"] },
        { emoji: "😁", description: "Beaming Face With Smiling Eyes", category: "smileys", aliases: ["grin"], tags: ["smile", "happy"] },
        { emoji: "😆", description: "Grinning Squinting Face", category: "smileys", aliases: ["laughing"], tags: ["funny", "haha"] },
        { emoji: "😂", description: "Face With Tears of Joy", category: "smileys", aliases: ["joy"], tags: ["funny", "lol"] },
        { emoji: "🤣", description: "Rolling on the Floor Laughing", category: "smileys", aliases: ["rofl"], tags: ["lol", "funny"] },
        { emoji: "😊", description: "Smiling Face With Smiling Eyes", category: "smileys", aliases: ["blush"], tags: ["smile", "happy"] },
        { emoji: "😎", description: "Smiling Face With Sunglasses", category: "smileys", aliases: ["sunglasses"], tags: ["cool"] },
        { emoji: "❤️", description: "Red Heart", category: "symbols", aliases: ["heart"], tags: ["love", "like"] },
        { emoji: "🔥", description: "Fire", category: "symbols", aliases: ["fire"], tags: ["lit", "hot"] },
        { emoji: "🎉", description: "Party Popper", category: "activities", aliases: ["tada"], tags: ["celebration", "party"] },
        { emoji: "💯", description: "Hundred Points", category: "symbols", aliases: ["100"], tags: ["score", "perfect"] },
        { emoji: "👍", description: "Thumbs Up", category: "people", aliases: ["+1", "thumbsup"], tags: ["approve", "ok"] },
        { emoji: "👎", description: "Thumbs Down", category: "people", aliases: ["-1", "thumbsdown"], tags: ["disapprove", "bad"] },
        { emoji: "🙏", description: "Folded Hands", category: "people", aliases: ["pray"], tags: ["thanks", "please"] },
        { emoji: "👏", description: "Clapping Hands", category: "people", aliases: ["clap"], tags: ["praise", "applause"] },
        { emoji: "🤔", description: "Thinking Face", category: "smileys", aliases: ["thinking"], tags: ["hmm", "curious"] },
        { emoji: "😴", description: "Sleeping Face", category: "smileys", aliases: ["sleeping"], tags: ["tired", "zzz"] },
        { emoji: "👀", description: "Eyes", category: "people", aliases: ["eyes"], tags: ["look", "see"] }
      ];

      // Group emojis by category
      const categoryMap = new Map<string, Emoji[]>();
      emojiData.forEach((emoji) => {
        if (!categoryMap.has(emoji.category)) {
          categoryMap.set(emoji.category, []);
        }
        categoryMap.get(emoji.category)!.push(emoji);
      });

      // Convert map to array of categories
      const categoriesArray: EmojiCategory[] = [];
      categoryMap.forEach((emojis, name) => {
        categoriesArray.push({ name, emojis });
      });

      setCategories(categoriesArray);
      setFilteredEmojis(emojiData);
      setIsLoading(false);
    }, 500);
  }, []);

  // Filter emojis based on search query and active category
  useEffect(() => {
    let filtered: Emoji[] = [];

    // Get all emojis from all categories
    const allEmojis = categories.flatMap((category) => category.emojis);

    if (searchQuery) {
      // Filter by search query
      const query = searchQuery.toLowerCase();
      filtered = allEmojis.filter(
        (emoji) =>
          emoji.description.toLowerCase().includes(query) ||
          emoji.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
          emoji.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    } else if (activeCategory === "all") {
      // Show all emojis
      filtered = allEmojis;
    } else if (activeCategory === "recent") {
      // Show recent emojis
      filtered = recentEmojis;
    } else {
      // Filter by category
      filtered = allEmojis.filter((emoji) => emoji.category === activeCategory);
    }

    setFilteredEmojis(filtered);
  }, [searchQuery, activeCategory, categories, recentEmojis]);

  const handleEmojiClick = (emoji: Emoji) => {
    // Copy to clipboard
    navigator.clipboard.writeText(emoji.emoji);
    setCopiedEmoji(emoji.emoji);

    // Reset copied status after 2 seconds
    setTimeout(() => {
      setCopiedEmoji(null);
    }, 2000);

    // Add to recent emojis
    setRecentEmojis((prev) => {
      // Remove if already exists
      const filtered = prev.filter((e) => e.emoji !== emoji.emoji);
      // Add to beginning and limit to 24 recent emojis
      return [emoji, ...filtered].slice(0, 24);
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="relative mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="search"
            placeholder="Search emojis..."
            className="w-full p-2 pl-9 border border-gray-300 rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto mb-4">
          <button
            className={`px-3 py-1 whitespace-nowrap ${activeCategory === 'all' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          <button
            className={`px-3 py-1 whitespace-nowrap ${activeCategory === 'recent' ? 'bg-blue-500 text-white' : 'bg-white'}`}
            onClick={() => setActiveCategory('recent')}
          >
            Recent
          </button>
          {categories.map((category) => (
            <button
              key={category.name}
              className={`px-3 py-1 whitespace-nowrap ${activeCategory === category.name ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white p-4 rounded border">
          {isLoading ? (
            <div className="grid grid-cols-8 gap-2">
              {Array.from({ length: 40 }).map((_, index) => (
                <div key={index} className="aspect-square rounded-md bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : filteredEmojis.length > 0 ? (
            <div className="grid grid-cols-8 gap-2">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={index}
                  className="relative flex items-center justify-center aspect-square rounded-md hover:bg-gray-100 text-2xl"
                  onClick={() => handleEmojiClick(emoji)}
                  title={emoji.description}
                >
                  {emoji.emoji}
                  {copiedEmoji === emoji.emoji && (
                    <span className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-20 rounded-md">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              No emojis found matching "{searchQuery}"
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 mt-4">
          <p>Click on an emoji to copy it to clipboard.</p>
          <p className="mt-1">Tip: You can search by emoji name, alias, or tag.</p>
        </div>
      </div>
    </div>
  );
};

export default EmojiPicker;