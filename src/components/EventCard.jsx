import { Link } from "react-router-dom";
import { formatDate, formatYear } from "../utils/dateUtils";
import { useState } from "react";
import { useDynasty } from "../context/DynastyContext";
import ConfirmationDialog from "./ConfirmationDialog";

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

  const Card = ({ children }) => {
    if (showLink && event.id) {
      return (
        <Link
          to={`/events/${event.id}`}
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
        <h3 className="text-lg font-semibold">{event.name}</h3>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-2">
            {displayDate && (
              <span className="text-sm text-gray-600">{displayDate}</span>
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
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Event"
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
          <div className="text-xs text-gray-500 mb-1">Related Rulers:</div>
          <div className="flex flex-wrap gap-1">
            {kings.map((king) => (
              <Link
                key={king.id}
                to={`/kings/${king.id}`}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              >
                {king.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {event.description && (
        <p className="text-sm text-gray-700">{event.description}</p>
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
    </Card>
  );
};

export default EventCard;
