import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { getWarTypeClass, getImportanceClass, getParticipantRoleClass } from "../utils/styleUtils";
import Modal from "../components/Modal";
import AddWarForm from "../components/AddWarForm";
import ConfirmationDialog from "../components/ConfirmationDialog";
import BackButton from "../components/BackButton";
import { setPageTitle, formatEntityTitle } from "../utils/titleUtils";
import { Pencil, Trash } from "lucide-react";

const WarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { wars, kings, dynasties, events, loading, updateWar, deleteWar } =
    useDynasty();

  const [war, setWar] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!loading) {
      const foundWar = wars.find((w) => w.id === id);
      if (foundWar) {
        setWar(foundWar);

        // Set page title with war name
        setPageTitle(formatEntityTitle("War", foundWar.name));

        // Get detailed information about participants
        const participantDetails = foundWar.participants.map((participant) => {
          // Just preserve the minimal data structure
          return {
            kingId: participant.kingId,
            role: participant.role,
          };
        });

        setParticipants(participantDetails);
      } else {
        // War not found, redirect to wars list
        navigate("/wars");
      }
    }
  }, [id, wars, kings, dynasties, loading, navigate]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    deleteWar(id);
    setShowDeleteConfirm(false);
    navigate("/wars");
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleUpdateWar = (updatedWarData) => {
    // Preserve the ID and apply updates
    updateWar(id, { ...updatedWarData, id });

    // Update local state to reflect changes immediately
    setWar({ ...war, ...updatedWarData });
    setIsEditing(false);
  };

  // Format years, properly handling BCE dates
  const formatWarYear = (year) => {
    if (!year && year !== 0) return "";

    const yearNum = parseInt(year);
    if (isNaN(yearNum)) return year;

    // Handle BCE years (negative numbers)
    if (yearNum < 0) {
      return `${Math.abs(yearNum)} BCE`;
    }

    // Handle CE years
    return yearNum.toString();
  };

  // Format the war timespan
  const getWarTimespan = () => {
    if (!war) return "";

    const formattedStartYear = formatWarYear(war.startYear);
    const formattedEndYear = war.endYear
      ? formatWarYear(war.endYear)
      : "Ongoing";

    return `${formattedStartYear} - ${formattedEndYear}`;
  };

  if (loading || !war) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  // Group participants by side
  const sides = {};
  if (war.participants && Array.isArray(war.participants)) {
    war.participants.forEach((participant) => {
      const side = participant.side || "Unspecified";
      if (!sides[side]) {
        sides[side] = [];
      }
      sides[side].push(participant);
    });
  }

  return (
    <div>
      <BackButton />

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
                    {getWarTimespan()}
                    {war.location && <span className="ml-3">{war.location}</span>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn btn-secondary flex items-center"
                  >
                    <Pencil className="h-5 w-5 mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="btn btn-danger flex items-center"
                  >
                    <Trash className="h-5 w-5 mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {war.type && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getWarTypeClass(war.type)}`}
                  >
                    {war.type}
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getImportanceClass(war.importance)}`}
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
              <div className="flex flex-wrap gap-3 mb-4">
                {war.participants &&
                  war.participants.map((participant) => {
                    // Find the full king and dynasty info
                    const king = kings.find((k) => k.id === participant.kingId);
                    const dynasty = king?.dynastyId
                      ? dynasties.find((d) => d.id === king.dynastyId)
                      : null;
                    const isOneTime = king ? king.isOneTime : false;

                    const participantContent = (
                      <div className="flex items-center gap-2">
                        {dynasty && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: dynasty.color || "#808080",
                            }}
                          ></div>
                        )}
                        <div>
                          <div className="font-medium dark:text-white">
                            {king ? king.name : "Unknown Ruler"}
                          </div>
                          {dynasty || (king && king.dynastyName) ? (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {dynasty?.name || king.dynastyName}
                            </div>
                          ) : null}
                        </div>
                        <div
                          className={`text-xs px-2 py-1 rounded-full ${getParticipantRoleClass(
                            participant.role
                          )} ml-2`}
                        >
                          {participant.role || "Participant"}
                        </div>
                      </div>
                    );

                    // Get a stable key
                    const participantKey = `${participant.kingId || "unknown"}-${
                      participant.role || "participant"
                    }`;

                    // Render as link if king exists and is not one-time, otherwise as div
                    return king && !isOneTime ? (
                      <Link
                        key={participantKey}
                        to={`/kings/${participant.kingId}`}
                        state={{ from: location.pathname }}
                        className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors min-w-36"
                      >
                        {participantContent}
                      </Link>
                    ) : (
                      <div
                        key={participantKey}
                        className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 min-w-36"
                      >
                        {participantContent}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Modal isOpen={isEditing} onClose={() => setIsEditing(false)}>
          <div className="p-1">
            <div className="text-xl font-bold mb-4 dark:text-white">Edit War</div>
            <AddWarForm
              onClose={() => setIsEditing(false)}
              initialData={war}
              isEditing={true}
              onSave={handleUpdateWar}
            />
          </div>
        </Modal>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete War"
          message={`Are you sure you want to delete "${war?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          confirmButtonClass="bg-red-600 hover:bg-red-700"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </div>
    </div>
  );
};

export default WarPage;
