import React from "react";
import { Link } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { getTimeSpan, formatYear } from "../utils/dateUtils";
import { useState } from "react";
import ConfirmationDialog from "./ConfirmationDialog";

const WarCard = ({ war, currentKingId, kings, dynasties }) => {
  const { deleteWar } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Get the kings involved in the war
  const getKingInfo = (kingId) => {
    return kings.find((king) => king.id === kingId) || null;
  };

  // Get the dynasty a king belongs to
  const getDynastyInfo = (dynastyId) => {
    return dynasties.find((dynasty) => dynasty.id === dynastyId) || null;
  };

  // Helper function to get the name of a king's dynasty
  const getDynastyName = (kingId) => {
    const king = kings.find((k) => k.id === kingId);
    if (king && king.dynastyId) {
      const dynasty = dynasties.find((d) => d.id === king.dynastyId);
      return dynasty ? dynasty.name : null;
    }
    return null;
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

  // Group participants by side - add null checks
  const sides =
    war.participants && Array.isArray(war.participants)
      ? war.participants.reduce((acc, p) => {
          const side = p.side || "Unspecified";
          if (!acc[side]) acc[side] = [];

          // Add null check for kings array
          if (kings && Array.isArray(kings)) {
            const king = kings.find((k) => k.id === p.kingId);
            if (king) {
              acc[side].push({
                ...p,
                king,
                isCurrent: p.kingId === currentKingId,
              });
            }
          }

          return acc;
        }, {})
      : {};

  // Get outcome for current king if available - add null checks
  const currentKingParticipant =
    war.participants && Array.isArray(war.participants)
      ? war.participants.find((p) => p.kingId === currentKingId)
      : null;
  const outcome = currentKingParticipant
    ? currentKingParticipant.outcome
    : null;

  const Card = ({ children }) => {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">{children}</div>
      </div>
    );
  };

  return (
    <Card>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold dark:text-white">{war.name}</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {war.startYear} - {war.endYear || "Ongoing"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getImportanceClass()}`}
          >
            {war.importance || "medium"}
          </span>
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

      <p className="text-gray-700 dark:text-gray-300 my-2">{war.description}</p>

      <div className="mt-3">
        <h4 className="font-medium text-sm mb-2">Participants:</h4>
        {Object.keys(sides).map((sideName) => (
          <div key={sideName} className="mb-3">
            <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              {sideName} Side
            </h5>
            <div className="flex flex-wrap gap-1">
              {sides[sideName].map((participant, idx) => {
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
                        className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs rounded-full"
                      >
                        <span>{king.name}</span>
                        {dynasty && (
                          <span className="ml-1 text-gray-500 dark:text-gray-400">
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

      {outcome && (
        <div className="mt-4 p-3 border dark:border-gray-700 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            Outcome for{" "}
            {kings.find((k) => k.id === currentKingId)?.name || "Current King"}
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{outcome}</p>
        </div>
      )}

      {war.results && (
        <div className="mt-4 p-3 border dark:border-gray-700 rounded-md">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            War Results
          </h4>
          <p className="text-gray-700 dark:text-gray-300">{war.results}</p>
        </div>
      )}

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
