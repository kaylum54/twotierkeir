'use client';

interface Category {
  id: string;
  label: string;
  emoji: string;
}

interface CopeFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export const CopeFilters = ({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
}: CopeFiltersProps) => {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-typewriter transition-colors
                       ${
                         selectedCategory === cat.id
                           ? 'bg-purple-600 text-white'
                           : 'bg-white border border-gray-300 hover:border-purple-400'
                       }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border rounded px-3 py-1.5 text-sm bg-white"
        >
          <option value="votes">Most Votes</option>
          <option value="recent">Most Recent</option>
          <option value="cope_level">Highest Cope</option>
        </select>
      </div>
    </div>
  );
};
