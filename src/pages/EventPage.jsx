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
    <div className="max-w-4xl mx-auto">
      {event && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {event.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {getDisplayDate()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-secondary flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
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

          <div className="flex flex-wrap gap-2 mb-6">
            {event.type && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeClass()}`}
              >
                {event.type}
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceClass()}`}
            >
              {event.importance.charAt(0).toUpperCase() +
                event.importance.slice(1)}{" "}
              Importance
            </span>
          </div>

          <div className="prose max-w-none dark:prose-invert mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              {event.description}
            </p>
          </div>

          {relatedKings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4 dark:text-white">
                Related Rulers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedKings.map((king) => (
                  <Link
                    key={king.id}
                    to={`/kings/${king.id}`}
                    state={{ from: location.pathname }}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center">
                      {king.dynasty && (
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: king.dynasty.color }}
                        ></div>
                      )}
                      <h3 className="font-bold dark:text-white">{king.name}</h3>
                    </div>
                    {king.dynasty && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {king.dynasty.name} Dynasty
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isEditing && event && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 dark:text-white">Edit Event</h2>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="form-label">Event Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Date</label>
                <input
                  type="text"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="form-input"
                  placeholder="YYYY or YYYY-MM-DD"
                  required
                />
              </div>
              <div>
                <label className="form-label">Type</label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value })
                  }
                  className="form-input"
                >
                  <option value="">Select Type</option>
                  <option value="Political">Political</option>
                  <option value="Military">Military</option>
                  <option value="Religious">Religious</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Economic">Economic</option>
                  <option value="Scientific">Scientific</option>
                  <option value="Diplomatic">Diplomatic</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="form-label">Importance</label>
              <div className="flex space-x-4">
                {["low", "medium", "high"].map((level) => (
                  <label
                    key={level}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={level}
                      checked={editForm.importance === level}
                      onChange={(e) =>
                        setEditForm({ ...editForm, importance: e.target.value })
                      }
                      className="h-4 w-4 text-dynasty-primary dark:text-blue-400 border-gray-300 focus:ring-dynasty-primary"
                    />
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="form-label">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                rows="4"
                className="form-input"
                required
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventPage;
