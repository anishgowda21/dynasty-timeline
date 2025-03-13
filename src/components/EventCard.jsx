import { Link, useNavigate } from "react-router-dom";
import { formatDate, formatYear } from "../utils/dateUtils";
import { getEventTypeClass, getImportanceClass } from "../utils/styleUtils";
import { useState } from "react";
import { useDynasty } from "../context/DynastyContext";
import ConfirmationDialog from "./ConfirmationDialog";
import { Trash } from "lucide-react";

const EventCard = ({ event, kings = [], showLink = true }) => {
  const { deleteEvent } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  // Format the date
  const formattedDate = event.date ? formatDate(event.date) : "";

  // Check if the date is just a year (4 digits)
  const isYearOnly = event.date && /^-?\d{1,4}$/.test(event.date.toString());

  // If it's just a year, use formatYear instead
  const displayDate = isYearOnly
    ? formatYear(parseInt(event.date))
    : formattedDate;

  const handleKingClick = (e, king) => {
    e.preventDefault();
    e.stopPropagation();

    // Only navigate if the king exists and is not a one-time ruler
    if (king.id && !king.isOneTime) {
      navigate(`/kings/${king.id}`);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking delete
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    deleteEvent(event.id);
    setShowDeleteConfirm(false);
  };

  const handleCancelDelete = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDeleteConfirm(false);
  };

  // Card content - shared between both versions
  const cardContent = (
    <>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold dark:text-white">{event.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            {displayDate && (
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {displayDate}
              </span>
            )}
            {event.type && (
              <span
                className={`text-xs px-2 py-1 rounded-full ${getEventTypeClass(event.type)}`}
              >
                {event.type}
              </span>
            )}
          </div>
          <button
            onClick={handleDeleteClick}
            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
            title="Delete Event"
          >
            <Trash className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {event.importance && (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceClass(event.importance)}`}
          >
            {event.importance.charAt(0).toUpperCase() +
              event.importance.slice(1)}{" "}
            Importance
          </span>
        )}
      </div>

      {kings && kings.length > 0 && (
        <div className="mb-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Related Rulers:
          </div>
          <div className="flex flex-wrap gap-1">
            {kings.map((king) => (
              <div
                key={king.id || `king-${king.name}`}
                className="flex items-center"
              >
                <span
                  onClick={king.id && !king.isOneTime ? (e) => handleKingClick(e, king) : undefined}
                  className={
                    "text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200 " +
                    (king.id && !king.isOneTime
                      ? "hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer"
                      : "opacity-75")
                  }
                >
                  {king.name} {king.dynastyName ? `(${king.dynastyName})` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {event.description && (
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {event.description}
        </p>
      )}
    </>
  );

  // The shared card style
  const cardStyle =
    "p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800";

  return (
    <>
      {showLink && event.id ? (
        <Link
          to={`/events/${event.id}`}
          className={`block ${cardStyle} hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors`}
        >
          {cardContent}
        </Link>
      ) : (
        <div className={cardStyle}>{cardContent}</div>
      )}

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Event"
        message={`Are you sure you want to delete the event "${event.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
};

export default EventCard;
