import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDynasty } from "../context/DynastyContext";
import { formatYear } from "../utils/dateUtils";
import ConfirmationDialog from "./ConfirmationDialog";
import { Trash } from "lucide-react";

const WarCard = ({ war, currentKingId, kings, showLink = true }) => {
  const { deleteWar } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Format the years
  const startYear = war.startYear ? formatYear(parseInt(war.startYear)) : "";
  const endYear = war.endYear ? formatYear(parseInt(war.endYear)) : "Ongoing";
  const timespan = `${startYear} - ${endYear}`;

  // Get the kings involved in the war with proper details
  const participantKings = war.participants || [];

  const getImportanceClass = () => {
    switch (war.importance) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTypeClass = () => {
    switch (war.type) {
      case "Conquest":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Civil War":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "Succession":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Religious":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Trade":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Naval":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "Colonial":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Territorial":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "victor":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "defeated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "participant":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ally":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "neutral":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking delete
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleKingClick = (e, king) => {
    e.preventDefault();
    e.stopPropagation();

    if (king.kingId && !king.isOneTime) {
      navigate(`/kings/${king.kingId}`);
      console.log("Navigation function called");
    }
  };

  const handleCancelDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDeleteConfirm(false);
  };

  const handleConfirmDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    deleteWar(war.id);
    setShowDeleteConfirm(false);
  };

  // Card content - shared between both versions
  const cardContent = (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">{war.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            {timespan && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {timespan}
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
            onClick={handleDeleteClick}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
            title="Delete War"
          >
            <Trash className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {war.importance && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceClass()}`}
          >
            {war.importance.charAt(0).toUpperCase() + war.importance.slice(1)}{" "}
            Importance
          </span>
        )}
        {war.location && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            {war.location}
          </span>
        )}
      </div>

      {/* Participants/Kings Section */}
      {participantKings && participantKings.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Participants:
          </div>
          <div className="flex flex-wrap gap-1">
            {participantKings.map((king, index) => (
              <div
                key={king.kingId || `participant-${index}`}
                className="flex items-center"
              >
                <span
                  onClick={(e) => handleKingClick(e, king)}
                  className={`text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 
          ${
            !king.isOneTime
              ? "hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
              : ""
          }`}
                >
                  {king.name} {king.dynastyName ? `(${king.dynastyName})` : ""}
                </span>
                {king.role && (
                  <span
                    className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${getRoleClass(
                      king.role
                    )}`}
                  >
                    {king.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check if current king is involved and show his outcome */}
      {currentKingId && war.participants && Array.isArray(war.participants) && (
        <>
          {war.participants.some(
            (p) => p.kingId === currentKingId && p.outcome
          ) && (
            <div className="mb-3 p-2 border dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Outcome for{" "}
                {kings.find((k) => k.id === currentKingId)?.name ||
                  "Current Ruler"}
                :
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {
                  war.participants.find((p) => p.kingId === currentKingId)
                    ?.outcome
                }
              </p>
            </div>
          )}
        </>
      )}

      {/* War results if available */}
      {war.results && (
        <div className="mb-3 mt-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            War Results:
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {war.results}
          </p>
        </div>
      )}

      {/* Description */}
      {war.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {war.description}
        </p>
      )}
    </>
  );

  // The shared card style
  const cardStyle =
    "p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";

  return (
    <>
      {showLink && war.id ? (
        <Link
          to={`/wars/${war.id}`}
          className={`block ${cardStyle} hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors`}
        >
          {cardContent}
        </Link>
      ) : (
        <div className={cardStyle}>{cardContent}</div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete War"
        message={`Are you sure you want to delete the war "${war.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default WarCard;
