import { Link } from "react-router-dom";
import { formatDate, formatYear } from "../utils/dateUtils";
import { useState } from "react";
import { useDynasty } from "../context/DynastyContext";
import ConfirmationDialog from "./ConfirmationDialog";
import { Trash } from "lucide-react";

const EventCard = ({ event, kings = [], showLink = true }) => {
  const { deleteEvent } = useDynasty();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format the date
  const formattedDate = event.date ? formatDate(event.date) : "";

  // Check if the date is just a year (4 digits)
  const isYearOnly = event.date && /^-?\d{1,4}$/.test(event.date.toString());

  // If it's just a year, use formatYear instead
  const displayDate = isYearOnly
    ? formatYear(parseInt(event.date))
    : formattedDate;

  const getImportanceClass = () => {
    switch (event.importance) {
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
    switch (event.type) {
      case "Religious":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Political":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Cultural":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Economic":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Scientific":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "Diplomatic":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      case "Military":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault(); // Prevent link navigation when clicking delete
    e.stopPropagation();
    setShowDeleteConfirm(true);
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
    deleteEvent(event.id);
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
                className={`text-xs px-2 py-1 rounded-full ${getTypeClass()}`}
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
            className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceClass()}`}
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
            {kings.map((king) =>
              king.isOneTime ? (
                <span
                  key={king.id}
                  className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                >
                  {king.name} {king.dynastyName ? `(${king.dynastyName})` : ""}
                </span>
              ) : (
                <Link
                  key={king.id}
                  to={`/kings/${king.id}`}
                  className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-800 dark:text-gray-200"
                  onClick={(e) => e.stopPropagation()} // Prevent event card navigation
                >
                  {king.name}
                </Link>
              )
            )}
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
