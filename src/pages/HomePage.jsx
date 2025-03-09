import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';
import Timeline from '../components/Timeline';
import DynastyCard from '../components/DynastyCard';
import DynastySelector from '../components/DynastySelector';
import Modal from '../components/Modal';
import AddDynastyForm from '../components/AddDynastyForm';
import ValidationWarnings from '../components/ValidationWarnings';

const HomePage = () => {
  const { 
    dynasties, 
    kings, 
    loading, 
    validationWarnings,
    uiSettings,
    toggleShowIncompleteTimelines
  } = useDynasty();
  
  const [showAddDynastyModal, setShowAddDynastyModal] = useState(false);
  const [showValidationWarnings, setShowValidationWarnings] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  // Count kings per dynasty for displaying in the cards
  const getKingsCount = (dynastyId) => {
    return kings.filter(king => king.dynastyId === dynastyId).length;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dynasty-text">Royal Dynasties</h1>
        <div className="flex space-x-2">
          {validationWarnings.length > 0 && (
            <button
              onClick={() => setShowValidationWarnings(true)}
              className="flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {validationWarnings.length} Warnings
            </button>
          )}
          
          <button 
            onClick={() => setShowAddDynastyModal(true)}
            className="btn btn-primary flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Dynasty
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <div className="lg:col-span-1">
          <DynastySelector />
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Dynasties Timeline</h2>
              <div className="flex items-center">
                <label className="flex items-center text-sm cursor-pointer">
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

      <h2 className="text-2xl font-bold mb-4">All Dynasties</h2>
      {dynasties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">No dynasties added yet.</p>
          <p className="text-gray-600 mb-6">Add your first dynasty to start building your timeline.</p>
          <button 
            onClick={() => setShowAddDynastyModal(true)}
            className="btn btn-primary"
          >
            Add Your First Dynasty
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynasties.map(dynasty => (
            <DynastyCard 
              key={dynasty.id} 
              dynasty={dynasty} 
              kingsCount={getKingsCount(dynasty.id)}
            />
          ))}
        </div>
      )}

      <Modal isOpen={showAddDynastyModal} onClose={() => setShowAddDynastyModal(false)}>
        <AddDynastyForm onClose={() => setShowAddDynastyModal(false)} />
      </Modal>
      
      <Modal isOpen={showValidationWarnings} onClose={() => setShowValidationWarnings(false)}>
        <ValidationWarnings warnings={validationWarnings} onClose={() => setShowValidationWarnings(false)} />
      </Modal>
    </div>
  );
};

export default HomePage;
