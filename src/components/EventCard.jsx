import { formatDate } from '../utils/dateUtils';
import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';
import ConfirmationDialog from './ConfirmationDialog';

const EventCard = ({ event, kings }) => {
  const { deleteEvent } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      case 'War':
        return 'bg-red-100 text-red-800';
      case 'Military':
        return 'bg-red-100 text-red-800';
      case 'Religious':
        return 'bg-purple-100 text-purple-800';
      case 'Political':
        return 'bg-blue-100 text-blue-800';
      case 'Cultural':
        return 'bg-green-100 text-green-800';
      case 'Economic':
        return 'bg-yellow-100 text-yellow-800';
      case 'Scientific':
        return 'bg-indigo-100 text-indigo-800';
      case 'Diplomatic':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <div className="flex items-center space-x-2">
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
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Event"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
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
      
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${event.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          deleteEvent(event.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default EventCard;
