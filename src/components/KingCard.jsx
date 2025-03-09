import { Link } from 'react-router-dom';
import { getTimeSpan } from '../utils/dateUtils';

const KingCard = ({ king, dynastyColor, eventsCount }) => {
  return (
    <Link 
      to={`/kings/${king.id}`} 
      className="king-card hover:translate-y-[-2px]"
      style={{ borderLeftColor: dynastyColor || '#4F46E5' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold mb-1">{king.name}</h3>
          <p className="text-gray-600 text-sm mb-1">
            {getTimeSpan(king.startYear, king.endYear)}
          </p>
          {king.birthYear && king.deathYear && (
            <p className="text-gray-500 text-xs">
              Lived: {king.birthYear} - {king.deathYear} ({king.deathYear - king.birthYear} years)
            </p>
          )}
        </div>
        {eventsCount > 0 && (
          <div 
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: dynastyColor || '#4F46E5' }}
          >
            {eventsCount}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 text-sm mt-2 line-clamp-2">
        {king.description || 'No description available.'}
      </p>
      
      <div className="mt-2 text-dynasty-primary text-xs font-medium">
        View Details &rarr;
      </div>
    </Link>
  );
};

export default KingCard;
