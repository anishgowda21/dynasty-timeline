import { Link } from 'react-router-dom';
import { useDynasty } from '../context/DynastyContext';
import { getTimeSpan } from '../utils/dateUtils';

const WarCard = ({ war }) => {
  const { kings, dynasties } = useDynasty();
  
  // Get the kings involved in the war
  const getKingInfo = (kingId) => {
    return kings.find(king => king.id === kingId) || null;
  };
  
  // Get the dynasty a king belongs to
  const getDynastyInfo = (dynastyId) => {
    return dynasties.find(dynasty => dynasty.id === dynastyId) || null;
  };
  
  const getImportanceClass = () => {
    switch (war.importance) {
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
    switch (war.type) {
      case 'Conquest':
        return 'bg-red-100 text-red-800';
      case 'Civil War':
        return 'bg-orange-100 text-orange-800';
      case 'Religious':
        return 'bg-purple-100 text-purple-800';
      case 'Succession':
        return 'bg-blue-100 text-blue-800';
      case 'Naval':
        return 'bg-indigo-100 text-indigo-800';
      case 'Colonial':
        return 'bg-green-100 text-green-800';
      case 'Trade':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleClass = (role) => {
    switch (role) {
      case 'victor':
        return 'bg-green-100 text-green-800';
      case 'defeated':
        return 'bg-red-100 text-red-800';
      case 'participant':
        return 'bg-blue-100 text-blue-800';
      case 'ally':
        return 'bg-indigo-100 text-indigo-800';
      case 'neutral':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Group participants by side/faction
  const groupedParticipants = war.participants.reduce((acc, participant) => {
    const side = participant.side || 'Unspecified Faction';
    if (!acc[side]) {
      acc[side] = [];
    }
    acc[side].push(participant);
    return acc;
  }, {});
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{war.name}</h3>
        <div className="flex space-x-2">
          {war.importance && (
            <span className={`text-xs px-2 py-1 rounded-full ${getImportanceClass()}`}>
              {war.importance.charAt(0).toUpperCase() + war.importance.slice(1)}
            </span>
          )}
          {war.type && (
            <span className={`text-xs px-2 py-1 rounded-full ${getTypeClass()}`}>
              {war.type}
            </span>
          )}
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-2">
        {war.startYear}{war.endYear ? ` - ${war.endYear}` : ''} 
        {war.endYear ? ` (${war.endYear - war.startYear} years)` : ''}
        {war.location && <span className="ml-2">• {war.location}</span>}
      </p>
      
      {war.description && (
        <p className="text-gray-700 mb-4">{war.description}</p>
      )}
      
      <div className="mt-3">
        <h4 className="font-medium text-sm mb-2">Participants:</h4>
        {Object.entries(groupedParticipants).map(([side, participants]) => (
          <div key={side} className="mb-3">
            <h5 className="text-xs font-medium text-gray-500 mb-1">{side}</h5>
            <div className="flex flex-wrap gap-1">
              {participants.map((participant, idx) => {
                const king = participant.kingId ? getKingInfo(participant.kingId) : null;
                const dynasty = king?.dynastyId ? getDynastyInfo(king.dynastyId) : null;
                
                return (
                  <div key={idx} className="flex items-center">
                    {king ? (
                      <Link to={`/kings/${king.id}`} className="inline-flex items-center text-xs rounded-full px-2 py-1 border border-gray-200 hover:bg-gray-50">
                        <span>{king.name}</span>
                        {dynasty && <span className="ml-1 text-gray-500">({dynasty.name})</span>}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center text-xs rounded-full px-2 py-1 border border-gray-200">
                        <span>{participant.name || 'Unknown'}</span>
                        {participant.dynastyName && <span className="ml-1 text-gray-500">({participant.dynastyName})</span>}
                      </span>
                    )}
                    
                    {participant.role && (
                      <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${getRoleClass(participant.role)}`}>
                        {participant.role}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WarCard;
