import { formatDate } from '../utils/dateUtils';

const EventCard = ({ event, kings }) => {
  const getImportanceClass = () => {
    switch (event.importance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeClass = () => {
    switch (event.type) {
      case 'Battle':
        return 'bg-red-100 text-red-800';
      case 'Religious':
        return 'bg-purple-100 text-purple-800';
      case 'Political':
        return 'bg-blue-100 text-blue-800';
      case 'Cultural':
        return 'bg-green-100 text-green-800';
      case 'Economic':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <div className="flex space-x-2">
          {event.importance && (
            <span className={`text-xs px-2 py-1 rounded-full ${getImportanceClass()}`}>
              {event.importance.charAt(0).toUpperCase() + event.importance.slice(1)}
            </span>
          )}
          {event.type && (
            <span className={`text-xs px-2 py-1 rounded-full ${getTypeClass()}`}>
              {event.type}
            </span>
          )}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-2">
        {formatDate(event.date)}
      </p>

      <p className="text-gray-700 mb-3">
        {event.description}
      </p>

      {kings && kings.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium mb-1">Related Rulers:</p>
          <div className="flex flex-wrap gap-2">
            {kings.map(king => (
              <span 
                key={king.id} 
                className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full"
              >
                {king.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCard;
