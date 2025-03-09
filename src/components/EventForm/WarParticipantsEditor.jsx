import React from 'react';

const WarParticipantsEditor = ({
  participants,
  selectedKings,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
  preselectedKingId = null,
  error = null
}) => {
  const participantRoles = [
    { value: 'victor', label: 'Victor' },
    { value: 'defeated', label: 'Defeated' },
    { value: 'participant', label: 'Participant' },
    { value: 'ally', label: 'Ally' },
    { value: 'neutral', label: 'Neutral Observer' }
  ];

  // Find kings who have not been added as participants yet
  const kingsWithoutDetails = selectedKings.filter(king => 
    !participants.some(p => p.kingId === king.id)
  );
  
  return (
    <div className="mt-4">
      <h4 className="font-medium text-sm mb-2">Participant Details</h4>
      
      {participants.length > 0 ? (
        <div className="space-y-3">
          {participants.map(participant => {
            const king = selectedKings.find(k => k.id === participant.kingId);
            const isPreselected = king && king.id === preselectedKingId;
            
            return (
              <div key={participant.kingId} className="border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-medium">{king?.name}</span>
                    {king?.dynastyName && (
                      <span className="text-gray-500 text-sm ml-1">({king.dynastyName})</span>
                    )}
                    {isPreselected && (
                      <span className="ml-2 text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        Preselected
                      </span>
                    )}
                  </div>
                  {!isPreselected && (
                    <button
                      type="button"
                      onClick={() => onRemoveParticipant(participant.kingId)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                    <select
                      value={participant.role}
                      onChange={(e) => onUpdateParticipant(participant.kingId, 'role', e.target.value)}
                      className="w-full p-1 text-sm border border-gray-300 rounded-md"
                    >
                      {participantRoles.map(role => (
                        <option key={role.value} value={role.value}>{role.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Side/Faction (Optional)</label>
                    <input
                      type="text"
                      value={participant.side}
                      onChange={(e) => onUpdateParticipant(participant.kingId, 'side', e.target.value)}
                      placeholder="e.g., Allies, Central Powers"
                      className="w-full p-1 text-sm border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes (Optional)</label>
                  <input
                    type="text"
                    value={participant.notes}
                    onChange={(e) => onUpdateParticipant(participant.kingId, 'notes', e.target.value)}
                    placeholder="e.g., Led naval forces, Negotiated peace treaty"
                    className="w-full p-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
          <p className="text-sm text-gray-500 mb-2">
            No participant details added yet. Please add details for each participant.
          </p>
          {kingsWithoutDetails.length === 0 ? (
            <p className="text-sm text-gray-400">
              (Select rulers above first)
            </p>
          ) : (
            <div className="space-y-2">
              {kingsWithoutDetails.map(king => (
                <div key={king.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-200">
                  <div>
                    <span className="font-medium">{king.name}</span>
                    {king.dynastyName && (
                      <span className="text-gray-500 text-sm ml-1">({king.dynastyName})</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onAddParticipant(king)}
                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default WarParticipantsEditor;
