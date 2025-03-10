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
    <div className="max-w-4xl mx-auto">
      {war && (
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-1 dark:text-white">
                  {war.name}
                </h1>
                <div className="text-gray-600 dark:text-gray-300">
                  {war.startYear} - {war.endYear || "Ongoing"}
                  {war.location && <span className="ml-3">{war.location}</span>}
                </div>
              </div>
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

            <div className="flex flex-wrap gap-2 mb-6">
              {war.type && (
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeClass()}`}
                >
                  {war.type}
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceClass()}`}
              >
                {war.importance?.charAt(0).toUpperCase() +
                  war.importance?.slice(1) || "Medium"}{" "}
                Importance
              </span>
            </div>

            <div className="prose max-w-none dark:prose-invert mb-6">
              <p className="text-gray-700 dark:text-gray-300">
                {war.description}
              </p>
            </div>

            {war.results && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2 dark:text-white">
                  Outcome
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  {war.results}
                </p>
              </div>
            )}

            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Participants
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {war.participants &&
                groupParticipants(war.participants, kings, dynasties).map(
                  (group) => (
                    <div
                      key={group.side}
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
                    >
                      <h3 className="font-bold text-lg mb-3 dark:text-white">
                        {group.side}
                      </h3>
                      <div className="space-y-3">
                        {group.kings.map((participant) => (
                          <Link
                            key={participant.kingId}
                            to={`/kings/${participant.kingId}`}
                            state={{ from: location.pathname }}
                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-dynasty-primary dark:hover:border-blue-500"
                          >
                            <div className="flex items-center">
                              {participant.dynasty && (
                                <div
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{
                                    backgroundColor: participant.dynasty.color,
                                  }}
                                ></div>
                              )}
                              <div>
                                <div className="font-medium dark:text-white">
                                  {participant.name}
                                </div>
                                {participant.dynasty && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {participant.dynasty.name}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                              {participant.role || "Participant"}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to safely group participants
function groupParticipants(participants, kings, dynasties) {
  if (!participants || !Array.isArray(participants) || !kings || !dynasties) {
    return [];
  }

  // Group by side
  const sideGroups = participants.reduce((acc, participant) => {
    const side = participant.side || "Unspecified";
    if (!acc[side]) {
      acc[side] = [];
    }
    acc[side].push(participant);
    return acc;
  }, {});

  // Map to array of groups with processed kings info
  return Object.entries(sideGroups).map(([side, parts]) => {
    const processedKings = parts
      .map((part) => {
        const king = kings.find((k) => k.id === part.kingId);
        if (!king) return null;

        const dynasty = king.dynastyId
          ? dynasties.find((d) => d.id === king.dynastyId)
          : null;

        return {
          kingId: king.id,
          name: king.name,
          role: part.role,
          dynasty: dynasty,
        };
      })
      .filter(Boolean); // Remove any nulls

    return {
      side,
      kings: processedKings,
    };
  });
}

export default WarPage;
