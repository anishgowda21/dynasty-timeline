import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import Timeline from "../components/Timeline";
import KingCard from "../components/KingCard";
import Modal from "../components/Modal";
import AddKingForm from "../components/AddKingForm";
import AddDynastyForm from "../components/AddDynastyForm";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { getTimeSpan, getYearRange } from "../utils/dateUtils";
import { Pencil, Trash } from "lucide-react";

const DynastyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { dynasties, kings, events, loading, updateDynasty, deleteDynasty } =
    useDynasty();

  const [dynasty, setDynasty] = useState(null);
  const [dynastyKings, setDynastyKings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading) {
      const foundDynasty = dynasties.find((d) => d.id === id);
      if (foundDynasty) {
        setDynasty(foundDynasty);

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

  const handleEditDynasty = (editedDynasty) => {
    // We need to preserve the id of the dynasty
    updateDynasty(id, { ...editedDynasty, id });
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteDynasty(id);
    setShowDeleteConfirm(false);
    navigate("/");
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading || !dynasty) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  // Handle BCE years for editing
  const displayDynasty = { ...dynasty };
  const startYearBce = dynasty.startYear < 0;
  const endYearBce = dynasty.endYear < 0;

  if (startYearBce) {
    displayDynasty.startYear = Math.abs(dynasty.startYear - 1);
  }

  if (endYearBce && dynasty.endYear) {
    displayDynasty.endYear = Math.abs(dynasty.endYear - 1);
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold dark:text-white">
            {dynasty.name} Dynasty
          </h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary flex items-center"
            >
              <Pencil className="mr-2" />
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="btn btn-danger flex items-center"
            >
              <Trash className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex-1">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">
              Dynasty Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Time Period:
                  </span>{" "}
                  {getTimeSpan(dynasty.startYear, dynasty.endYear)}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  <span className="font-medium text-gray-700 dark:text-gray-200">
                    Kings/Rulers:
                  </span>{" "}
                  {dynastyKings.length}
                </p>
              </div>
              <div
                className="h-8 rounded-md"
                style={{ backgroundColor: dynasty.color || "#4F46E5" }}
              ></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md flex-1">
            <h2 className="text-lg font-semibold mb-2 dark:text-white">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              {dynasty.description || "No description available."}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">
          Dynasty Timeline
        </h3>
        <Timeline
          items={dynastyKings}
          type="king"
          dynastyColor={dynasty.color}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold dark:text-white">Kings & Rulers</h2>
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
          Add King/Ruler
        </button>
      </div>

      {dynastyKings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            No kings or rulers added for this dynasty yet.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add First King/Ruler
          </button>
        </div>
      ) : (
        <>
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
        </>
      )}

      {/* Add King Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddKingForm
          onClose={() => setShowAddModal(false)}
          preselectedDynastyId={id}
        />
      </Modal>

      {/* Edit Dynasty Modal - Using the existing AddDynastyForm component */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
        <div className="p-1">
          <div className="text-xl font-bold mb-4 dark:text-white">
            Edit {dynasty.name} Dynasty
          </div>
          <AddDynastyForm
            onClose={() => setIsEditing(false)}
            initialData={{
              name: dynasty.name,
              startYear: startYearBce
                ? Math.abs(dynasty.startYear - 1)
                : dynasty.startYear,
              endYear: dynasty.endYear
                ? endYearBce
                  ? Math.abs(dynasty.endYear - 1)
                  : dynasty.endYear
                : "",
              color: dynasty.color,
              description: dynasty.description || "",
            }}
            initialBCE={{
              startYearBce: startYearBce,
              endYearBce: endYearBce,
            }}
            isEditing={true}
            onSave={handleEditDynasty}
          />
        </div>
      </Modal>
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        title="Delete Dynasty"
        message={`Are you sure you want to delete the ${dynasty?.name} dynasty? This will also delete all rulers and associated events.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default DynastyPage;
