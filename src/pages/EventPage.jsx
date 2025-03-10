import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { formatDate, formatYear } from "../utils/dateUtils";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, kings, dynasties, loading, updateEvent, deleteEvent } =
    useDynasty();

  const [event, setEvent] = useState(null);
  const [relatedKings, setRelatedKings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [navContext, setNavContext] = useState("events");

  // Determine navigation context (where the user came from)
  useEffect(() => {
    // Check referrer path in the state
    if (location.state && location.state.from) {
      if (location.state.from.includes("kings")) {
        setNavContext("kings");
      } else if (location.state.from.includes("wars")) {
        setNavContext("wars");
      } else if (location.state.from.includes("dynasties")) {
        setNavContext("dynasties");
      } else {
        setNavContext("events");
      }
    }
  }, [location]);

  useEffect(() => {
    if (!loading) {
      const foundEvent = events.find((e) => e.id === id);
      if (foundEvent) {
        setEvent(foundEvent);

        // Get detailed information about related kings
        const kingsInfo = foundEvent.kingIds
          .map((kingId) => {
            const king = kings.find((k) => k.id === kingId);
            if (king) {
              const dynasty = dynasties.find((d) => d.id === king.dynastyId);
              return {
                ...king,
                dynasty,
              };
            }
            return null;
          })
          .filter((k) => k !== null);

        setRelatedKings(kingsInfo);
      } else {
        // Event not found, redirect to events list
        navigate("/events");
      }
    }
  }, [id, events, kings, dynasties, loading, navigate]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${event.name}"?`)) {
      deleteEvent(id);
      navigate("/events");
    }
  };

  const getImportanceClass = () => {
    switch (event?.importance) {
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
    switch (event?.type) {
      case "Religious":
        return "bg-purple-100 text-purple-800";
      case "Political":
        return "bg-blue-100 text-blue-800";
      case "Cultural":
        return "bg-green-100 text-green-800";
      case "Economic":
        return "bg-yellow-100 text-yellow-800";
      case "Scientific":
        return "bg-indigo-100 text-indigo-800";
      case "Diplomatic":
        return "bg-teal-100 text-teal-800";
      case "Military":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBackLink = () => {
    switch (navContext) {
      case "kings":
        return "/kings/" + (location.state?.kingId || "");
      case "wars":
        return "/wars/" + (location.state?.warId || "");
      case "dynasties":
        return "/dynasties/" + (location.state?.dynastyId || "");
      default:
        return "/events";
    }
  };

  const getBackText = () => {
    switch (navContext) {
      case "kings":
        return "Back to Ruler";
      case "wars":
        return "Back to War";
      case "dynasties":
        return "Back to Dynasty";
      default:
        return "Back to Events";
    }
  };

  // Format the event date
  const getDisplayDate = () => {
    if (!event || !event.date) return "";

    // Check if it's just a year (possibly BCE)
    const isYearOnly = /^-?\d+$/.test(event.date.toString());

    // If it's just a year, use formatYear, otherwise use formatDate
    return isYearOnly
      ? formatYear(parseInt(event.date))
      : formatDate(event.date);
  };

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to={getBackLink()}
          state={{ from: location.pathname }}
          className="text-dynasty-primary hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          {getBackText()}
        </Link>
      </div>

      {isEditing ? (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <AddEventForm
            onClose={() => setIsEditing(false)}
            existingEvent={event}
            isEditing={true}
          />
        </Modal>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{event.name}</h1>
              {event.date && (
                <div className="text-gray-600 mt-1">{getDisplayDate()}</div>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 border border-red-300 rounded-md text-red-700 hover:bg-red-50 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>

          <div className="mb-4">
            {event.type && (
              <span
                className={`px-3 py-1 rounded-full text-sm ${getTypeClass()}`}
              >
                {event.type}
              </span>
            )}
            {event.importance && (
              <span
                className={`ml-2 px-3 py-1 rounded-full text-sm ${getImportanceClass()}`}
              >
                {event.importance.charAt(0).toUpperCase() +
                  event.importance.slice(1)}{" "}
                Importance
              </span>
            )}
          </div>

          {event.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this Event</h2>
              <p className="text-gray-700">{event.description}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Related Rulers</h2>
            {relatedKings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {relatedKings.map((king) => (
                  <div key={king.id} className="border rounded-lg p-4">
                    <Link
                      to={`/kings/${king.id}`}
                      state={{ from: location.pathname, eventId: id }}
                      className="font-semibold hover:underline"
                    >
                      {king.name}
                    </Link>
                    {king.dynasty && (
                      <div className="text-sm text-gray-600 mt-1">
                        <Link
                          to={`/dynasties/${king.dynasty.id}`}
                          state={{ from: location.pathname, eventId: id }}
                          className="hover:underline"
                        >
                          {king.dynasty.name}
                        </Link>
                      </div>
                    )}
                    <div className="text-sm text-gray-600 mt-1">
                      {formatYear(king.startYear)} - {formatYear(king.endYear)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No rulers associated with this event.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventPage;
