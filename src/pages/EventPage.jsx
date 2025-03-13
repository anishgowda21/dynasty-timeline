import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { formatDate, formatYear } from "../utils/dateUtils";
import { getEventTypeClass, getImportanceClass } from "../utils/styleUtils";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";
import ConfirmationDialog from "../components/ConfirmationDialog";
import BackButton from "../components/BackButton";
import { Pencil, Trash } from "lucide-react";

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, kings, dynasties, loading, updateEvent, deleteEvent } =
    useDynasty();

  const [event, setEvent] = useState(null);
  const [relatedKings, setRelatedKings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteEvent(id);
    setShowDeleteConfirm(false);
    navigate("/events");
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleUpdateEvent = (updatedEventData) => {
    // Preserve the ID and apply updates
    updateEvent(id, { ...updatedEventData, id });

    // Update local state to reflect changes immediately
    setEvent({ ...event, ...updatedEventData });
    setIsEditing(false);
  };

  const getDisplayDate = () => {
    if (!event || !event.date) return "";

    // Check if it's just a year (possibly BCE)
    const isYearOnly = /^-?\d+$/.test(event.date.toString());

    // If it's just a year, use formatYear, otherwise use formatDate
    return isYearOnly
      ? formatYear(parseInt(event.date))
      : formatDate(event.date);
  };

  const isDateBCE = () => {
    if (!event || !event.date) return false;

    // If the date is a negative number, it's BCE
    return Number(event.date) < 0;
  };

  const prepareInitialData = () => {
    if (!event) return {};

    // If the date is BCE, we need to convert it to a positive number
    let displayDate = event.date;
    if (isDateBCE()) {
      // Convert from internal format (-year+1) to display format (positive year)
      displayDate = Math.abs(Number(event.date) - 1).toString();
    }

    return {
      name: event.name,
      date: displayDate,
      description: event.description || "",
      kingIds: event.kingIds || [],
      type: event.type || "",
      importance: event.importance || "medium",
    };
  };

  if (loading || !event) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackButton />

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
                  <Pencil className="h-5 w-5 mr-2" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="btn btn-danger flex items-center"
                >
                  <Trash className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {event.type && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeClass(event.type)}`}
                >
                  {event.type}
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceClass(event.importance)}`}
              >
                {event.importance?.charAt(0).toUpperCase() +
                  event.importance?.slice(1) || "Medium"}{" "}
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
                  {relatedKings.map((king) =>
                    king.isOneTime ? (
                      <div
                        key={king.id}
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: king.color }}
                          ></div>
                          <h3 className="font-bold dark:text-white">
                            {king.name}
                          </h3>
                        </div>
                        {king.dynastyName && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {king.dynastyName} Dynasty
                          </p>
                        )}
                      </div>
                    ) : (
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
                          <h3 className="font-bold dark:text-white">
                            {king.name}
                          </h3>
                        </div>
                        {king.dynasty && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {king.dynasty.name} Dynasty
                          </p>
                        )}
                      </Link>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal - Using AddEventForm */}
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <div className="p-1">
            <div className="text-xl font-bold mb-4 dark:text-white">
              Edit Event
            </div>
            <AddEventForm
              onClose={() => setIsEditing(false)}
              initialData={prepareInitialData()}
              initialBCE={{ dateBce: isDateBCE() }}
              isEditing={true}
              onSave={handleUpdateEvent}
            />
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete Event"
          message={`Are you sure you want to delete "${event?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
};

export default EventPage;
