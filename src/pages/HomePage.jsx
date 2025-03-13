import { useState, useEffect } from "react";
import { useDynasty } from "../context/DynastyContext";
import Timeline from "../components/Timeline";
import DynastyCard from "../components/DynastyCard";
import DynastySelector from "../components/DynastySelector";
import Modal from "../components/Modal";
import AddDynastyForm from "../components/AddDynastyForm";
import ValidationWarnings from "../components/ValidationWarnings";
import { Plus, TriangleAlert } from "lucide-react";
import { setPageTitle } from "../utils/titleUtils";

const HomePage = () => {
  const {
    dynasties,
    kings,
    loading,
    validationWarnings,
    uiSettings,
    toggleShowIncompleteTimelines,
  } = useDynasty();

  const [showAddDynastyModal, setShowAddDynastyModal] = useState(false);
  const [showValidationWarnings, setShowValidationWarnings] = useState(false);

  // Set page title when component mounts
  useEffect(() => {
    setPageTitle("Home", false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  // Count kings per dynasty for displaying in the cards
  const getKingsCount = (dynastyId) => {
    return kings.filter((king) => king.dynastyId === dynastyId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dynasty-text dark:text-white">
          Royal Dynasties
        </h1>
        <div className="flex space-x-2">
          {validationWarnings.length > 0 && (
            <button
              onClick={() => setShowValidationWarnings(true)}
              className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 rounded-md hover:bg-yellow-200 dark:hover:bg-yellow-800"
            >
              <TriangleAlert className="mr-2" />
              {validationWarnings.length} Warnings
            </button>
          )}

          <button
            onClick={() => setShowAddDynastyModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="mr-2" />
            Add Dynasty
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-1">
          <DynastySelector />
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold dark:text-white">
                Dynasties Timeline
              </h2>
              <div className="flex items-center">
                <label className="flex items-center text-sm cursor-pointer dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={uiSettings.showIncompleteTimelines}
                    onChange={toggleShowIncompleteTimelines}
                    className="h-4 w-4 text-dynasty-primary border-gray-300 rounded"
                  />
                  <span className="ml-2">Show incomplete timelines</span>
                </label>
              </div>
            </div>
            <Timeline
              items={dynasties}
              type="dynasty"
              selectedItems={uiSettings.selectedDynasties}
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4 dark:text-white">All Dynasties</h2>
      {dynasties.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
            No dynasties added yet.
          </p>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Add your first dynasty to start building your timeline.
          </p>
          <button
            onClick={() => setShowAddDynastyModal(true)}
            className="btn btn-primary"
          >
            Add Your First Dynasty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynasties.map((dynasty) => (
            <DynastyCard
              key={dynasty.id}
              dynasty={dynasty}
              kingsCount={getKingsCount(dynasty.id)}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddDynastyModal}
        onClose={() => setShowAddDynastyModal(false)}
      >
        <AddDynastyForm onClose={() => setShowAddDynastyModal(false)} />
      </Modal>

      <Modal
        isOpen={showValidationWarnings}
        onClose={() => setShowValidationWarnings(false)}
      >
        <ValidationWarnings
          warnings={validationWarnings}
          onClose={() => setShowValidationWarnings(false)}
        />
      </Modal>
    </div>
  );
};

export default HomePage;
