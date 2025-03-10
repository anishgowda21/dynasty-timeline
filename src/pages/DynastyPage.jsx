import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import Timeline from "../components/Timeline";
import KingCard from "../components/KingCard";
import Modal from "../components/Modal";
import AddKingForm from "../components/AddKingForm";
import { getTimeSpan, getYearRange } from "../utils/dateUtils";

const DynastyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dynasties, kings, events, loading, updateDynasty, deleteDynasty } =
    useDynasty();

  const [dynasty, setDynasty] = useState(null);
  const [dynastyKings, setDynastyKings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    startYear: "",
    endYear: "",
    color: "",
    description: "",
  });

  useEffect(() => {
    if (!loading) {
      const foundDynasty = dynasties.find((d) => d.id === id);
      if (foundDynasty) {
        setDynasty(foundDynasty);
        setEditForm({
          name: foundDynasty.name,
          startYear: foundDynasty.startYear,
          endYear: foundDynasty.endYear,
          color: foundDynasty.color,
          description: foundDynasty.description || "",
        });

        // Get kings belonging to this dynasty
        const filteredKings = kings.filter((king) => king.dynastyId === id);
        setDynastyKings(filteredKings);
      } else {
        // Dynasty not found, redirect to home
        navigate("/");
      }
    }
  }, [id, dynasties, kings, loading, navigate]);

  const getEventsCount = (kingId) => {
    return events.filter((event) => event.kingIds.includes(kingId)).length;
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

    const updatedDynasty = {
      ...editForm,
      startYear: parseInt(editForm.startYear),
      endYear: parseInt(editForm.endYear),
    };

    updateDynasty(id, updatedDynasty);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the ${dynasty.name} dynasty? This will also delete all rulers and associated events.`
      )
    ) {
      deleteDynasty(id);
      navigate("/");
    }
  };

  if (loading || !dynasty) {
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
                  Start Year
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
                  End Year
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  name="color"
                  value={editForm.color}
                  onChange={handleEditChange}
                  className="h-10 w-10 rounded-md border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  name="color"
                  value={editForm.color}
                  onChange={handleEditChange}
                  className="ml-2 p-2 border border-gray-300 rounded-md"
                />
              </div>
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
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1
                  className="text-3xl font-bold"
                  style={{ color: dynasty.color }}
                >
                  {dynasty.name}
                </h1>
                <p className="text-gray-600">
                  {getTimeSpan(dynasty.startYear, dynasty.endYear)}
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

            {dynasty.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">
                  About this Dynasty
                </h2>
                <p className="text-gray-700">{dynasty.description}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Timeline of Rulers</h2>
        </div>

        {dynastyKings.length > 0 ? (
          <Timeline items={dynastyKings} type="king" />
        ) : (
          <p className="text-gray-500 text-center py-4">
            No rulers added to this dynasty yet.
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Rulers</h2>
        <button
          onClick={() => setShowAddModal(true)}
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
          Add Ruler
        </button>
      </div>

      {dynastyKings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">
            No rulers added to this dynasty yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Your First Ruler
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynastyKings.map((king) => (
            <KingCard
              key={king.id}
              king={king}
              dynastyColor={dynasty.color}
              eventsCount={getEventsCount(king.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddKingForm
          onClose={() => setShowAddModal(false)}
          preselectedDynastyId={id}
        />
      </Modal>
    </div>
  );
};

export default DynastyPage;
