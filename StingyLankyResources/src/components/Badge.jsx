const Badge = ({ badge, size = 'normal' }) => {
  const getBadgeColor = (badge) => {
    switch (badge?.toLowerCase()) {
      case 'initiate':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'novice':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'member':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'veteran':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'expert':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'legend':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'admin':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const sizeClasses = size === 'small' ? 'text-xs px-1 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span 
      className={`inline-flex items-center rounded-full border font-medium ${getBadgeColor(badge)} ${sizeClasses}`}
    >
      {badge || 'Initiate'}
    </span>
  );
};

export default Badge;