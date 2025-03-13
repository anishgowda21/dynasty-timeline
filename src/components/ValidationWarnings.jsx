import { useState } from "react";
import { Link } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { formatYear } from "../utils/dateUtils";
import {
  AlertTriangle,
  Calendar,
  Info,
  ShieldBan,
  User,
  Users,
  XCircle,
} from "lucide-react";

const ValidationWarnings = ({ warnings, onClose }) => {
  const { uiSettings, setValidationLevel } = useDynasty();
  const [filter, setFilter] = useState("all"); // 'all', 'king', 'dynasty', 'event', 'war'

  // Helper function to extract the warning code from the ID pattern
  const getWarningCode = (warningId) => {
    if (!warningId) return null;

    // Extract code patterns from IDs
    if (warningId.includes("event-invalid-date")) return "event_invalid_date";
    if (warningId.includes("event-before-king"))
      return "event_outside_king_reign";
    if (warningId.includes("event-after-king"))
      return "event_outside_king_reign";
    if (warningId.includes("war-invalid-range")) return "war_invalid_range";
    if (warningId.includes("war-before-king")) return "war_outside_king_reign";
    if (warningId.includes("war-after-king")) return "war_outside_king_reign";
    if (warningId.includes("king-before-dynasty"))
      return "king_outside_dynasty";
    if (warningId.includes("king-after-dynasty")) return "king_outside_dynasty";

    return null;
  };

  // Filter warnings by type
  const filteredWarnings =
    filter === "all"
      ? warnings
      : warnings.filter((warning) => warning.type === filter);

  const warningCounts = {
    all: warnings.length,
    king: warnings.filter((w) => w.type === "king").length,
    dynasty: warnings.filter((w) => w.type === "dynasty").length,
    event: warnings.filter((w) => w.type === "event").length,
    war: warnings.filter((w) => w.type === "war").length,
  };

  const getWarningTypeIcon = (warningType) => {
    switch (warningType) {
      case "king":
        return <User className="mr-2 text-gray-400 dark:text-gray-300" />;
      case "dynasty":
        return <Users className="mr-2 text-gray-400 dark:text-gray-300" />;
      case "event":
        return <Calendar className="mr-2 text-gray-400 dark:text-gray-300" />;
      case "war":
        return <ShieldBan className="mr-2 text-gray-400 dark:text-gray-300" />;
      default:
        return <Info className="mr-2 text-gray-400 dark:text-gray-300" />;
    }
  };

  const getWarningLevelIcon = (level) => {
    switch (level) {
      case "error":
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case "warning":
      default:
        return (
          <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        );
    }
  };

  const handleValidationLevelChange = (e) => {
    setValidationLevel(e.target.value);
  };

  const renderWarningDetails = (warning) => {
    // Get warning code from ID if not explicitly provided
    const warningCode = warning.code || getWarningCode(warning.id);

    switch (warningCode) {
      case "event_invalid_date":
        return (
          <div>
            <p className="dark:text-gray-300">
              The event <strong>{warning.message.split('"')[1]}</strong> has an
              invalid date format.
            </p>
            <p className="text-sm mt-1 dark:text-gray-400">
              For BCE dates, use a negative year number (e.g., "-323" for 323
              BCE). For CE dates, use a positive year number (e.g., "1492" for
              1492 CE).
            </p>
            {warning.relatedIds && warning.relatedIds[0] && (
              <div className="mt-2">
                <Link
                  to={`/events/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Event
                </Link>
              </div>
            )}
          </div>
        );

      case "king_outside_dynasty":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  <strong>{warning.data.kingName}</strong> (
                  {formatYear(warning.data.kingStart)} -{" "}
                  {formatYear(warning.data.kingEnd)}) is outside the timespan of
                  their dynasty <strong>{warning.data.dynastyName}</strong> (
                  {formatYear(warning.data.dynastyStart)} -{" "}
                  {formatYear(warning.data.dynastyEnd)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2 flex space-x-2">
              {warning.data && warning.data.kingId && (
                <Link
                  to={`/kings/${warning.data.kingId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "overlapping_kings":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  <strong>{warning.data.king1Name}</strong> (
                  {formatYear(warning.data.king1Start)} -{" "}
                  {formatYear(warning.data.king1End)}) and{" "}
                  <strong>{warning.data.king2Name}</strong> (
                  {formatYear(warning.data.king2Start)} -{" "}
                  {formatYear(warning.data.king2End)}) have overlapping reign
                  periods in the same dynasty.
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2 flex space-x-2">
              {warning.data && warning.data.king1Id && (
                <Link
                  to={`/kings/${warning.data.king1Id}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View {warning.data.king1Name}
                </Link>
              )}
              {warning.data && warning.data.king2Id && (
                <Link
                  to={`/kings/${warning.data.king2Id}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View {warning.data.king2Name}
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "event_outside_king_reign":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  Event <strong>{warning.data.eventName}</strong> (
                  {formatYear(warning.data.eventDate)}) is outside the reign of
                  associated ruler <strong>{warning.data.kingName}</strong> (
                  {formatYear(warning.data.kingStart)} -{" "}
                  {formatYear(warning.data.kingEnd)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2 flex space-x-2">
              {warning.data && warning.data.eventId && (
                <Link
                  to={`/events/${warning.data.eventId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Event
                </Link>
              )}
              {warning.data && warning.data.kingId && (
                <Link
                  to={`/kings/${warning.data.kingId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "war_outside_king_reign":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  War <strong>{warning.data.warName}</strong> (
                  {formatYear(warning.data.warStart)} -{" "}
                  {formatYear(warning.data.warEnd)}) is outside the reign of
                  associated ruler <strong>{warning.data.kingName}</strong> (
                  {formatYear(warning.data.kingStart)} -{" "}
                  {formatYear(warning.data.kingEnd)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2 flex space-x-2">
              {warning.data && warning.data.warId && (
                <Link
                  to={`/wars/${warning.data.warId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View War
                </Link>
              )}
              {warning.data && warning.data.kingId && (
                <Link
                  to={`/kings/${warning.data.kingId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "war_outside_dynasty_period":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  War <strong>{warning.data.warName}</strong> (
                  {formatYear(warning.data.warStart)} -{" "}
                  {formatYear(warning.data.warEnd)}) is outside the period of
                  associated dynasty <strong>{warning.data.dynastyName}</strong> (
                  {formatYear(warning.data.dynastyStart)} -{" "}
                  {formatYear(warning.data.dynastyEnd)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2 flex space-x-2">
              {warning.data && warning.data.warId && (
                <Link
                  to={`/wars/${warning.data.warId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View War
                </Link>
              )}
              {warning.data && warning.data.dynastyId && (
                <Link
                  to={`/dynasties/${warning.data.dynastyId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Dynasty
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "birth_after_death":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  Ruler <strong>{warning.data.kingName}</strong> has birth year (
                  {formatYear(warning.data.birthYear)}) after death year (
                  {formatYear(warning.data.deathYear)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2">
              {warning.data && warning.data.kingId && (
                <Link
                  to={`/kings/${warning.data.kingId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      case "reign_outside_lifespan":
        return (
          <div>
            <p className="dark:text-gray-300">
              {warning.data ? (
                <>
                  Ruler <strong>{warning.data.kingName}</strong>'s reign (
                  {formatYear(warning.data.reignStart)} -{" "}
                  {formatYear(warning.data.reignEnd)}) is outside their lifespan (
                  {formatYear(warning.data.birthYear)} -{" "}
                  {formatYear(warning.data.deathYear)})
                </>
              ) : (
                // Fallback if data is missing
                <>{warning.message}</>
              )}
            </p>
            <div className="mt-2">
              {warning.data && warning.data.kingId && (
                <Link
                  to={`/kings/${warning.data.kingId}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
              {/* Additional safety check for navigation */}
              {warning.relatedIds && warning.relatedIds[0] && !warning.data && (
                <Link
                  to={`/kings/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm dark:text-blue-400 dark:hover:text-blue-300"
                >
                  View Ruler
                </Link>
              )}
            </div>
          </div>
        );

      default:
        return <p className="dark:text-gray-300">{warning.message}</p>;
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">
          Data Validation Warnings
        </h2>
        <div className="flex items-center">
          <span className="text-sm mr-2 dark:text-gray-300">
            Validation level:
          </span>
          <select
            value={uiSettings.validationLevel}
            onChange={handleValidationLevelChange}
            className="p-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 dark:text-white"
          >
            <option value="none">Off</option>
            <option value="warn">Warning Only</option>
            <option value="strict">Strict</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter("all")}
          className={`flex items-center px-3 py-1 rounded-full text-sm ${
            filter === "all"
              ? "bg-gray-800 dark:bg-gray-600 text-white"
              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          <span>All</span>
          {warningCounts.all > 0 && (
            <span className="ml-1 bg-white dark:bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.all}
            </span>
          )}
        </button>

        {warningCounts.king > 0 && (
          <button
            onClick={() => setFilter("king")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "king"
                ? "bg-gray-800 dark:bg-gray-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("king")}
              <span className="ml-1">Rulers</span>
            </span>
            <span className="ml-1 bg-white dark:bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.king}
            </span>
          </button>
        )}

        {warningCounts.dynasty > 0 && (
          <button
            onClick={() => setFilter("dynasty")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "dynasty"
                ? "bg-gray-800 dark:bg-gray-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("dynasty")}
              <span className="ml-1">Dynasties</span>
            </span>
            <span className="ml-1 bg-white dark:bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.dynasty}
            </span>
          </button>
        )}

        {warningCounts.event > 0 && (
          <button
            onClick={() => setFilter("event")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "event"
                ? "bg-gray-800 dark:bg-gray-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("event")}
              <span className="ml-1">Events</span>
            </span>
            <span className="ml-1 bg-white dark:bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.event}
            </span>
          </button>
        )}

        {warningCounts.war > 0 && (
          <button
            onClick={() => setFilter("war")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "war"
                ? "bg-gray-800 dark:bg-gray-600 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("war")}
              <span className="ml-1">Wars</span>
            </span>
            <span className="ml-1 bg-white dark:bg-gray-200 text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.war}
            </span>
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800">
        {filteredWarnings.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
            No warnings found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredWarnings.map((warning) => (
              <li
                key={warning.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getWarningLevelIcon(warning.level)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                      {getWarningTypeIcon(warning.type)}
                      <span className="ml-1 capitalize">{warning.type}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                        {warning.level}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {renderWarningDetails(warning)}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ValidationWarnings;
