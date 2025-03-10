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
