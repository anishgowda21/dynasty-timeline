import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import EventCard from "../components/EventCard";
import WarCard from "../components/WarCard";
import Modal from "../components/Modal";
import AddEventForm from "../components/AddEventForm";
import AddWarForm from "../components/AddWarForm";
import { getTimeSpan } from "../utils/dateUtils";

const KingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { kings, dynasties, events, wars, loading, updateKing, deleteKing } =
    useDynasty();

  const [king, setKing] = useState(null);
  const [dynasty, setDynasty] = useState(null);
  const [kingEvents, setKingEvents] = useState([]);
  const [kingWars, setKingWars] = useState([]);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddWarModal, setShowAddWarModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    startYear: "",
    endYear: "",
    birthYear: "",
    deathYear: "",
    description: "",
    imageUrl: "",
  });

  useEffect(() => {
    if (!loading) {
      const foundKing = kings.find((k) => k.id === id);
      if (foundKing) {
        setKing(foundKing);
        setEditForm({
          name: foundKing.name,
          startYear: foundKing.startYear,
          endYear: foundKing.endYear,
          birthYear: foundKing.birthYear || "",
          deathYear: foundKing.deathYear || "",
          description: foundKing.description || "",
          imageUrl: foundKing.imageUrl || "",
        });

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

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedKing = {
      ...editForm,
      startYear: parseInt(editForm.startYear),
      endYear: parseInt(editForm.endYear),
    };

    // Only include birth/death years if they're provided
    if (editForm.birthYear) {
      updatedKing.birthYear = parseInt(editForm.birthYear);
    }

    if (editForm.deathYear) {
      updatedKing.deathYear = parseInt(editForm.deathYear);
    }

    updateKing(id, updatedKing);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${king.name}? This will also delete all associated events.`
      )
    ) {
      deleteKing(id);
      navigate(`/dynasties/${king.dynastyId}`);
    }
  };

  if (loading || !king || !dynasty) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <input
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditChange}
                className="text-2xl font-bold p-1 border border-gray-300 rounded-md w-full"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Year of Reign
                </label>
                <input
                  type="number"
                  name="startYear"
                  value={editForm.startYear}
                  onChange={handleEditChange}
                  className="p-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Year of Reign
                </label>
                <input
                  type="number"
                  name="endYear"
                  value={editForm.endYear}
                  onChange={handleEditChange}
                  className="p-2 border border-gray-300 rounded-md w-full"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Birth Year (Optional)
                </label>
                <input
                  type="number"
                  name="birthYear"
                  value={editForm.birthYear}
                  onChange={handleEditChange}
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Death Year (Optional)
                </label>
                <input
                  type="number"
                  name="deathYear"
                  value={editForm.deathYear}
                  onChange={handleEditChange}
                  className="p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Optional)
              </label>
              <input
                type="text"
                name="imageUrl"
                value={editForm.imageUrl}
                onChange={handleEditChange}
                className="p-2 border border-gray-300 rounded-md w-full"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editForm.description}
                onChange={handleEditChange}
                rows="3"
                className="p-2 border border-gray-300 rounded-md w-full"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <h1
                  className="text-3xl font-bold mb-1"
                  style={{ color: dynasty.color }}
                >
                  {king.name}
                </h1>
                <p className="text-lg text-gray-600 mb-1">
                  {getTimeSpan(king.startYear, king.endYear)}
                </p>
                <p className="text-gray-500 mb-4">
                  <span className="text-gray-700 font-medium">
                    {dynasty.name} Dynasty
                  </span>
                  {king.birthYear && king.deathYear && (
                    <span className="ml-4">
                      Lived: {king.birthYear} - {king.deathYear} (
                      {king.deathYear - king.birthYear} years)
                    </span>
                  )}
                </p>
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
                className={`${
                  king.imageUrl ? "md:col-span-2" : "md:col-span-3"
                }`}
              >
                <h2 className="text-lg font-semibold mb-2">
                  About {king.name}
                </h2>
                <p className="text-gray-700">
                  {king.description || "No description available."}
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Historical Events Section */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Historical Events</h2>
        <button
          onClick={() => setShowAddEventModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add Event
        </button>
      </div>

      {kingEvents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mb-8">
          <p className="text-xl text-gray-500 mb-4">
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
        <h2 className="text-2xl font-bold">Wars & Conflicts</h2>
        <button
          onClick={() => setShowAddWarModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Add War/Conflict
        </button>
      </div>

      {kingWars.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">
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
            <WarCard
              key={war.id}
              war={war}
              currentKingId={id}
              kings={kings}
              dynasties={dynasties}
            />
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
    </div>
  );
};

export default KingPage;
