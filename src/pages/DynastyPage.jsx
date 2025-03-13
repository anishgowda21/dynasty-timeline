import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import Timeline from "../components/Timeline";
import KingCard from "../components/KingCard";
import Modal from "../components/Modal";
import AddKingForm from "../components/AddKingForm";
import AddDynastyForm from "../components/AddDynastyForm";
import ConfirmationDialog from "../components/ConfirmationDialog";
import BackButton from "../components/BackButton";
import { getTimeSpan, getYearRange } from "../utils/dateUtils";
import { setPageTitle, formatEntityTitle } from "../utils/titleUtils";
import { Pencil, Plus, Trash } from "lucide-react";

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
        setPageTitle(formatEntityTitle("Dynasty", foundDynasty.name));
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
    navigate("/");
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
      <BackButton />
      
      <div className="mb-6">
        <div className="flex flex-wrap justify-between items-start">
          <div>
            <h1
              className="text-3xl font-bold mb-2 text-dynasty-text dark:text-white"
              style={{ color: dynasty.color }}
            >
              {dynasty.name} Dynasty
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {dynasty.startYear
                ? `${getTimeSpan(dynasty.startYear, dynasty.endYear)} • ${
                    dynastyKings.length
                  } Ruler${dynastyKings.length !== 1 ? "s" : ""}`
                : `${dynastyKings.length} Ruler${
                    dynastyKings.length !== 1 ? "s" : ""
                  }`}
            </p>
          </div>

          <div className="flex mt-2 md:mt-0">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center mr-3 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </button>
            <button
              onClick={handleDeleteClick}
              className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        </div>

        {dynasty.description && (
          <div className="mt-4 prose dark:prose-invert max-w-none">
            <p>{dynasty.description}</p>
          </div>
        )}
      </div>

      {/* Timeline showing all kings in this dynasty */}
      <div className="mb-6">
        <Timeline
          items={dynastyKings}
          dynasties={[dynasty]}
          showDynastyColors={false}
          minYear={getYearRange(dynastyKings)[0]}
          maxYear={getYearRange(dynastyKings)[1]}
        />
      </div>

      {/* Kings listing */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Rulers</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Ruler
          </button>
        </div>

        {dynastyKings.length === 0 ? (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-center">
            No rulers added to this dynasty yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynastyKings
              .sort((a, b) => {
                if (!a.startYear) return 1;
                if (!b.startYear) return -1;
                return a.startYear - b.startYear;
              })
              .map((king) => (
                <KingCard
                  key={king.id}
                  king={king}
                  dynastyColor={dynasty.color}
                  eventsCount={getEventsCount(king.id)}
                />
              ))}
          </div>
        )}
      </div>

      {/* Add King Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Ruler"
      >
        <AddKingForm
          onClose={() => setShowAddModal(false)}
          preselectedDynastyId={id}
        />
      </Modal>

      {/* Edit Dynasty Modal */}
      <Modal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        title="Edit Dynasty"
      >
        <AddDynastyForm
          initialData={dynasty}
          initialBCE={{
            startYearBce: dynasty?.startYear < 0,
            endYearBce: dynasty?.endYear < 0
          }}
          onClose={() => setIsEditing(false)}
          onSave={handleEditDynasty}
          isEditing={true}
        />
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Dynasty"
        message={`Are you sure you want to delete ${dynasty.name} Dynasty? This will remove all dynasty data but will not remove the kings associated with it.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDestructive={true}
      />
    </div>
  );
};

export default DynastyPage;
