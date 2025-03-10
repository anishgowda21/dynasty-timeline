import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { formatYear } from "../utils/dateUtils";
import Modal from "../components/Modal";
import AddWarForm from "../components/AddWarForm";

const WarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { wars, kings, dynasties, events, loading, updateWar, deleteWar } =
    useDynasty();

  const [war, setWar] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [navContext, setNavContext] = useState("wars");

  // Determine navigation context (where the user came from)
  useEffect(() => {
    // Check referrer path in the state
    if (location.state && location.state.from) {
      if (location.state.from.includes("kings")) {
        setNavContext("kings");
      } else if (location.state.from.includes("events")) {
        setNavContext("events");
      } else if (location.state.from.includes("dynasties")) {
        setNavContext("dynasties");
      } else {
        setNavContext("wars");
      }
    }
  }, [location]);

  useEffect(() => {
    if (!loading) {
      const foundWar = wars.find((w) => w.id === id);
      if (foundWar) {
        setWar(foundWar);

        // Get detailed information about participants
        const participantDetails = foundWar.participants.map((participant) => {
          let kingInfo = null;
          let dynastyInfo = null;

          if (participant.kingId) {
            kingInfo = kings.find((k) => k.id === participant.kingId);
            if (kingInfo && kingInfo.dynastyId) {
              dynastyInfo = dynasties.find((d) => d.id === kingInfo.dynastyId);
            }
          }

          return {
            ...participant,
            king: kingInfo,
            dynasty: dynastyInfo,
          };
        });

        setParticipants(participantDetails);
      } else {
        // War not found, redirect to wars list
        navigate("/wars");
      }
    }
  }, [id, wars, kings, dynasties, loading, navigate]);

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${war.name}"?`)) {
      deleteWar(id);
      navigate("/wars");
    }
  };

  const getRoleClass = (role) => {
    switch (role) {
      case "victor":
        return "bg-green-100 text-green-800";
      case "defeated":
        return "bg-red-100 text-red-800";
      case "participant":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading || !war) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {isEditing ? (
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <AddWarForm
            onClose={() => setIsEditing(false)}
            existingWar={war}
            isEditing={true}
          />
        </Modal>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{war.name}</h1>
              <div className="text-gray-600 mt-1">
                {war.startYear && war.endYear ? (
                  <span>
                    {formatYear(war.startYear)} - {formatYear(war.endYear)}
                  </span>
                ) : war.startYear ? (
                  formatYear(war.startYear)
                ) : (
                  formatYear(war.endYear)
                )}
                {war.location && <span className="ml-2">• {war.location}</span>}
              </div>
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

          {war.type && (
            <div className="mb-4">
              <span className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                {war.type}
              </span>
              {war.importance && (
                <span
                  className={`ml-2 px-3 py-1 rounded-full text-sm ${
                    war.importance === "high"
                      ? "bg-red-100 text-red-800"
                      : war.importance === "medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {war.importance.charAt(0).toUpperCase() +
                    war.importance.slice(1)}{" "}
                  Importance
                </span>
              )}
            </div>
          )}

          {war.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">About this War</h2>
              <p className="text-gray-700">{war.description}</p>
            </div>
          )}

          {war.result && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Outcome</h2>
              <p className="text-gray-700">{war.result}</p>
            </div>
          )}

          {war.casualties && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Casualties</h2>
              <p className="text-gray-700">{war.casualties}</p>
            </div>
          )}

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Participants</h2>
            {participants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {participants.map((participant, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    {participant.king ? (
                      <Link
                        to={`/kings/${participant.king.id}`}
                        state={{ from: location.pathname, warId: id }}
                        className="font-semibold hover:underline"
                      >
                        {participant.king.name}
                      </Link>
                    ) : (
                      <span className="font-semibold">{participant.name}</span>
                    )}
                    {participant.dynasty && (
                      <div className="text-sm text-gray-600 mt-1">
                        <Link
                          to={`/dynasties/${participant.dynasty.id}`}
                          state={{ from: location.pathname, warId: id }}
                          className="hover:underline"
                        >
                          {participant.dynasty.name}
                        </Link>
                      </div>
                    )}
                    {participant.role && (
                      <div className="mt-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getRoleClass(
                            participant.role
                          )}`}
                        >
                          {participant.role.charAt(0).toUpperCase() +
                            participant.role.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No participants recorded for this war.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default WarPage;
