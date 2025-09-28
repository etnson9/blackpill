import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsProvider';

const categories = [
  { name: 'CONFIDENCE', description: 'Build mental fortitude and social dominance' },
  { name: 'FITNESS', description: 'Workouts, nutrition, and physique optimization' },
  { name: 'STYLE', description: 'Fashion, grooming, and appearance improvement' },
  { name: 'MINDFULNESS', description: 'Mental clarity, meditation, and focus' },
  { name: 'TECH', description: 'Gadgets, software, and tech trends' },
  { name: 'HOBBIES', description: 'Skills, interests, and leisure activities' },
  { name: 'NEWS', description: 'Current events and analysis' },
  { name: 'OFF-TOPIC', description: 'Random discussions' },
  { name: 'PEPTIDES & SARMS', description: 'Body optimization, hormones, supplements' },
  { name: 'BONE STRUCTURE / FACE SHAPE', description: 'Facial aesthetics, jawline, symmetry' },
  { name: 'SELF-OPTIMIZATION', description: 'Maximizing potential in all areas' },
  { name: 'ANON DISCUSSIONS', description: 'Completely anonymous posts' }
];

const Sidebar = () => {
  const location = useLocation();
  const { toggleNSFW, showNSFW } = useSettings();

  return (
    <aside className="w-64 hidden lg:block">
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 mb-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-dark-text">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <Link
              key={category.name}
              to={`/category/${encodeURIComponent(category.name)}`}
              className={`block p-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-dark-bg-secondary ${
                location.pathname === `/category/${encodeURIComponent(category.name)}`
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-dark-text'
              }`}
            >
              <div className="font-medium">{category.name}</div>
              <div className="text-xs text-gray-500 dark:text-dark-text-secondary">{category.description}</div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-dark-text">Settings</h3>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showNSFW}
            onChange={toggleNSFW}
            className="rounded"
          />
          <span className="text-sm text-gray-700 dark:text-dark-text">Show NSFW Content</span>
        </label>
      </div>
    </aside>
  );
};

export default Sidebar;