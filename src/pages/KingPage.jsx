import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import EventCard from "../components/EventCard";
import WarCard from "../components/WarCard";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";
import AddWarForm from "../components/AddWarForm";
import AddKingForm from "../components/AddKingForm";
import ConfirmationDialog from "../components/ConfirmationDialog";
import BackButton from "../components/BackButton";
import { getTimeSpan } from "../utils/dateUtils";
import { Pencil, Trash, Plus } from "lucide-react";

const KingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { kings, dynasties, events, wars, loading, updateKing, deleteKing } =
    useDynasty();

  const [king, setKing] = useState(null);
  const [dynasty, setDynasty] = useState(null);
  const [kingEvents, setKingEvents] = useState([]);
  const [kingWars, setKingWars] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddWarModal, setShowAddWarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading) {
      const foundKing = kings.find((k) => k.id === id);
      if (foundKing) {
        setKing(foundKing);

        // Find the dynasty this king belongs to
        const kingDynasty = dynasties.find((d) => d.id === foundKing.dynastyId);
        setDynasty(kingDynasty);

        // Get events related to this king
        const filteredEvents = events.filter((event) =>
          event.kingIds.includes(id)
        );
        setKingEvents(filteredEvents);

        // Get wars related to this king
        const filteredWars = wars.filter((war) =>
          war.participants.some((participant) => participant.kingId === id)
        );
        setKingWars(filteredWars);
      } else {
        // King not found, redirect to home
        navigate("/");
      }
    }
  }, [id, kings, dynasties, events, wars, loading, navigate]);

  const getRelatedKingsForEvent = (event) => {
    return kings.filter(
      (king) => event.kingIds.includes(king.id) && king.id !== id
    );
  };

  const getRelatedKingsForWar = (war) => {
    return war.participants
      .filter((p) => p.kingId !== id)
      .map((p) => {
        const king = kings.find((k) => k.id === p.kingId);
        return {
          ...king,
          role: p.role,
          side: p.side,
        };
      });
  };

  const handleUpdateKing = (updatedKingData) => {
    updateKing(id, { ...updatedKingData, id });
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteKing(id);
    setShowDeleteConfirm(false);
    navigate(`/dynasties/${king.dynastyId}`);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading || !king || !dynasty) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // Handle BCE years for editing
  const startYearBce = king.startYear < 0;
  const endYearBce = king.endYear < 0;
  const birthYearBce = king.birthYear && king.birthYear < 0;
  const deathYearBce = king.deathYear && king.deathYear < 0;

  return (
    <div>
      <BackButton />
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1
                className="text-3xl font-bold mb-1 dark:text-white"
                style={{ color: dynasty?.color || "inherit" }}
              >
                {king.name}
              </h1>
              <div className="text-gray-600 dark:text-gray-300">
                <span className="font-medium">Reign:</span>{" "}
                {getTimeSpan(king.startYear, king.endYear)}
              </div>
              {king.birthYear && (
                <div className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Lived:</span>{" "}
                  {getTimeSpan(king.birthYear, king.deathYear)}
                </div>
              )}
              {dynasty && (
                <div className="text-gray-600 dark:text-gray-300 mt-1">
                  <Link
                    to={`/dynasties/${dynasty.id}`}
                    className="hover:text-dynasty-primary dark:hover:text-blue-400"
                  >
                    {dynasty.name} Dynasty
                  </Link>
                </div>
              )}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {king.imageUrl && (
              <div className="md:col-span-1">
                <img
                  src={king.imageUrl}
                  alt={king.name}
                  className="w-full h-auto rounded-md shadow-sm"
                />
              </div>
            )}
            <div
              className={`${king.imageUrl ? "md:col-span-2" : "md:col-span-3"}`}
            >
              <h2 className="text-lg font-semibold mb-2 dark:text-white">
                About {king.name}
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {king.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        {/* Historical Events Section */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">
            Historical Events
          </h2>
          <button
            onClick={() => setShowAddEventModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Event
          </button>
        </div>

        {kingEvents.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center mb-8">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              No historical events recorded for this ruler yet.
            </p>
            <button
              onClick={() => setShowAddEventModal(true)}
              className="btn btn-primary"
            >
              Add First Historical Event
            </button>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {kingEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                kings={getRelatedKingsForEvent(event)}
              />
            ))}
          </div>
        )}

        {/* Wars/Conflicts Section */}
        <div className="flex justify-between items-center mb-4 mt-8">
          <h2 className="text-2xl font-bold dark:text-white">Wars & Conflicts</h2>
          <button
            onClick={() => setShowAddWarModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add War/Conflict
          </button>
        </div>

        {kingWars.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              No wars or conflicts recorded for this ruler yet.
            </p>
            <button
              onClick={() => setShowAddWarModal(true)}
              className="btn btn-primary"
            >
              Add First War/Conflict
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {kingWars.map((war) => (
              <WarCard key={war.id} war={war} currentKingId={id} kings={kings} />
            ))}
          </div>
        )}

        {/* Add Event Modal */}
        <Modal
          isOpen={showAddEventModal}
          onClose={() => setShowAddEventModal(false)}
        >
          <AddEventForm
            onClose={() => setShowAddEventModal(false)}
            preselectedKingId={id}
          />
        </Modal>

        {/* Add War Modal */}
        <Modal isOpen={showAddWarModal} onClose={() => setShowAddWarModal(false)}>
          <AddWarForm
            onClose={() => setShowAddWarModal(false)}
            preselectedKingId={id}
          />
        </Modal>

        {/* Edit King Modal */}
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <div className="p-1">
            <AddKingForm
              onClose={() => setIsEditing(false)}
              initialData={{
                name: king.name,
                dynastyId: king.dynastyId,
                startYear: startYearBce
                  ? Math.abs(king.startYear - 1)
                  : king.startYear,
                endYear: endYearBce ? Math.abs(king.endYear - 1) : king.endYear,
                birthYear: king.birthYear
                  ? birthYearBce
                    ? Math.abs(king.birthYear - 1)
                    : king.birthYear
                  : "",
                deathYear: king.deathYear
                  ? deathYearBce
                    ? Math.abs(king.deathYear - 1)
                    : king.deathYear
                  : "",
                description: king.description || "",
                imageUrl: king.imageUrl || "",
              }}
              initialBCE={{
                startYearBce: startYearBce,
                endYearBce: endYearBce,
                birthYearBce: birthYearBce,
                deathYearBce: deathYearBce,
              }}
              isEditing={true}
              onSave={handleUpdateKing}
              preselectedDynastyId={king.dynastyId}
            />
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete Ruler"
          message={`Are you sure you want to delete ${king?.name}? This will also delete all associated events and wars/conflicts where ${king?.name} is a participant.`}
          confirmText="Delete"
          cancelText="Cancel"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
};

export default KingPage;
