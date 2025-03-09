import { useState } from 'react';
import { useDynasty } from '../context/DynastyContext';
import Timeline from '../components/Timeline';
import DynastyCard from '../components/DynastyCard';
import Modal from '../components/Modal';
import AddDynastyForm from '../components/AddDynastyForm';

const HomePage = () => {
  const { dynasties, kings, loading } = useDynasty();
  const [showAddModal, setShowAddModal] = useState(false);

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
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Add Dynasty
        </button>
      </div>

      {dynasties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-500 mb-4">No dynasties added yet.</p>
          <p className="text-gray-600 mb-6">Add your first dynasty to start building your timeline.</p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Add Your First Dynasty
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Dynasties Timeline</h2>
            <Timeline items={dynasties} type="dynasty" />
          </div>

          <h2 className="text-2xl font-bold mb-4">All Dynasties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynasties.map(dynasty => (
              <DynastyCard 
                key={dynasty.id} 
                dynasty={dynasty} 
                kingsCount={getKingsCount(dynasty.id)}
              />
            ))}
          </div>
        </>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)}>
        <AddDynastyForm onClose={() => setShowAddModal(false)} />
      </Modal>
    </div>
  );
};

export default HomePage;
