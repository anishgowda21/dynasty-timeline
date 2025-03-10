import { Link } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { getTimeSpan, formatYear } from "../utils/dateUtils";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

const WarCard = ({ war }) => {
  const { kings, dynasties, deleteWar } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get the kings involved in the war
  const getKingInfo = (kingId) => {
    return kings.find((king) => king.id === kingId) || null;
  };

  // Get the dynasty a king belongs to
  const getDynastyInfo = (dynastyId) => {
    return dynasties.find((dynasty) => dynasty.id === dynastyId) || null;
  };

  const getImportanceClass = () => {
    switch (war.importance) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeClass = () => {
    switch (war.type) {
      case "Conquest":
        return "bg-red-100 text-red-800";
      case "Civil War":
        return "bg-orange-100 text-orange-800";
      case "Religious":
        return "bg-purple-100 text-purple-800";
      case "Succession":
        return "bg-blue-100 text-blue-800";
      case "Naval":
        return "bg-indigo-100 text-indigo-800";
      case "Colonial":
        return "bg-green-100 text-green-800";
      case "Trade":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "victor":
        return "bg-green-100 text-green-800";
      case "defeated":
        return "bg-red-100 text-red-800";
      case "participant":
        return "bg-blue-100 text-blue-800";
      case "ally":
        return "bg-indigo-100 text-indigo-800";
      case "neutral":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Group participants by side/faction
  const groupedParticipants = war.participants.reduce((acc, participant) => {
    const side = participant.side || "Unspecified Faction";
    if (!acc[side]) {
      acc[side] = [];
    }
    acc[side].push(participant);
    return acc;
  }, {});

  const Card = ({ children }) => {
    if (war.id) {
      return (
        <Link
          to={`/wars/${war.id}`}
          className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
        >
          {children}
        </Link>
      );
    }
    return (
      <div className="p-4 rounded-lg border border-gray-200">{children}</div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{war.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            {war.importance && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getImportanceClass()}`}
              >
                {war.importance.charAt(0).toUpperCase() +
                  war.importance.slice(1)}
              </span>
            )}
            {war.type && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getTypeClass()}`}
              >
                {war.type}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete War"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-2">
        {formatYear(war.startYear)} - {formatYear(war.endYear)}
        {war.endYear ? ` (${war.endYear - war.startYear} years)` : ""}
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
                const king = participant.kingId
                  ? getKingInfo(participant.kingId)
                  : null;
                const dynasty = king?.dynastyId
                  ? getDynastyInfo(king.dynastyId)
                  : null;

                return (
                  <div key={idx} className="flex items-center">
                    {king ? (
                      <Link
                        to={`/kings/${king.id}`}
                        className="inline-flex items-center text-xs rounded-full px-2 py-1 border border-gray-200 hover:bg-gray-50"
                      >
                        <span>{king.name}</span>
                        {dynasty && (
                          <span className="ml-1 text-gray-500">
                            ({dynasty.name})
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center text-xs rounded-full px-2 py-1 border border-gray-200">
                        <span>{participant.name || "Unknown"}</span>
                        {participant.dynastyName && (
                          <span className="ml-1 text-gray-500">
                            ({participant.dynastyName})
                          </span>
                        )}
                      </span>
                    )}

                    {participant.role && (
                      <span
                        className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${getRoleClass(
                          participant.role
                        )}`}
                      >
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

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete War"
        message={`Are you sure you want to delete the war "${war.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={() => {
          deleteWar(war.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </Card>
  );
};

export default WarCard;
