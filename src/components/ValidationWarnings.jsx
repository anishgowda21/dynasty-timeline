import { useState } from "react";
import { Link } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";
import { formatYear } from "../utils/dateUtils";

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
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "dynasty":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
          </svg>
        );
      case "event":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 10-2 0v1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "war":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const getWarningLevelIcon = (level) => {
    switch (level) {
      case "error":
        return (
          <span className="text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        );
      case "warning":
      default:
        return (
          <span className="text-yellow-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </span>
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
            <p>
              The event <strong>{warning.message.split('"')[1]}</strong> has an
              invalid date format.
            </p>
            <p className="text-sm mt-1">
              For BCE dates, use a negative year number (e.g., "-323" for 323
              BCE). For CE dates, use a positive year number (e.g., "1492" for
              1492 CE).
            </p>
            {warning.relatedIds && warning.relatedIds[0] && (
              <div className="mt-2">
                <Link
                  to={`/events/${warning.relatedIds[0]}`}
                  className="text-blue-600 hover:underline text-sm"
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
            <p>
              <strong>{warning.data.kingName}</strong> (
              {formatYear(warning.data.kingStart)} -{" "}
              {formatYear(warning.data.kingEnd)}) is outside the timespan of
              their dynasty <strong>{warning.data.dynastyName}</strong> (
              {formatYear(warning.data.dynastyStart)} -{" "}
              {formatYear(warning.data.dynastyEnd)})
            </p>
            <div className="mt-2 flex space-x-2">
              <Link
                to={`/kings/${warning.data.kingId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Ruler
              </Link>
              <Link
                to={`/dynasties/${warning.data.dynastyId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Dynasty
              </Link>
            </div>
          </div>
        );

      case "overlapping_kings":
        return (
          <div>
            <p>
              <strong>{warning.data.king1Name}</strong> (
              {formatYear(warning.data.king1Start)} -{" "}
              {formatYear(warning.data.king1End)}) and{" "}
              <strong>{warning.data.king2Name}</strong> (
              {formatYear(warning.data.king2Start)} -{" "}
              {formatYear(warning.data.king2End)}) have overlapping reign
              periods in the same dynasty.
            </p>
            <div className="mt-2 flex space-x-2">
              <Link
                to={`/kings/${warning.data.king1Id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View {warning.data.king1Name}
              </Link>
              <Link
                to={`/kings/${warning.data.king2Id}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View {warning.data.king2Name}
              </Link>
            </div>
          </div>
        );

      case "event_outside_king_reign":
        return (
          <div>
            <p>
              Event <strong>{warning.data.eventName}</strong> (
              {formatYear(warning.data.eventDate)}) is outside the reign of
              associated ruler <strong>{warning.data.kingName}</strong> (
              {formatYear(warning.data.kingStart)} -{" "}
              {formatYear(warning.data.kingEnd)})
            </p>
            <div className="mt-2 flex space-x-2">
              <Link
                to={`/events/${warning.data.eventId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Event
              </Link>
              <Link
                to={`/kings/${warning.data.kingId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Ruler
              </Link>
            </div>
          </div>
        );

      case "war_outside_king_reign":
        return (
          <div>
            <p>
              War <strong>{warning.data.warName}</strong> (
              {formatYear(warning.data.warStart)} -{" "}
              {formatYear(warning.data.warEnd)}) is outside the reign of
              associated ruler <strong>{warning.data.kingName}</strong> (
              {formatYear(warning.data.kingStart)} -{" "}
              {formatYear(warning.data.kingEnd)})
            </p>
            <div className="mt-2 flex space-x-2">
              <Link
                to={`/wars/${warning.data.warId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View War
              </Link>
              <Link
                to={`/kings/${warning.data.kingId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Ruler
              </Link>
            </div>
          </div>
        );

      case "war_outside_dynasty_period":
        return (
          <div>
            <p>
              War <strong>{warning.data.warName}</strong> (
              {formatYear(warning.data.warStart)} -{" "}
              {formatYear(warning.data.warEnd)}) is outside the period of
              associated dynasty <strong>{warning.data.dynastyName}</strong> (
              {formatYear(warning.data.dynastyStart)} -{" "}
              {formatYear(warning.data.dynastyEnd)})
            </p>
            <div className="mt-2 flex space-x-2">
              <Link
                to={`/wars/${warning.data.warId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View War
              </Link>
              <Link
                to={`/dynasties/${warning.data.dynastyId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Dynasty
              </Link>
            </div>
          </div>
        );

      case "birth_after_death":
        return (
          <div>
            <p>
              Ruler <strong>{warning.data.kingName}</strong> has birth year (
              {formatYear(warning.data.birthYear)}) after death year (
              {formatYear(warning.data.deathYear)})
            </p>
            <div className="mt-2">
              <Link
                to={`/kings/${warning.data.kingId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Ruler
              </Link>
            </div>
          </div>
        );

      case "reign_outside_lifespan":
        return (
          <div>
            <p>
              Ruler <strong>{warning.data.kingName}</strong>'s reign (
              {formatYear(warning.data.reignStart)} -{" "}
              {formatYear(warning.data.reignEnd)}) is outside their lifespan (
              {formatYear(warning.data.birthYear)} -{" "}
              {formatYear(warning.data.deathYear)})
            </p>
            <div className="mt-2">
              <Link
                to={`/kings/${warning.data.kingId}`}
                className="text-blue-600 hover:underline text-sm"
              >
                View Ruler
              </Link>
            </div>
          </div>
        );

      default:
        return <p>{warning.message}</p>;
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Data Validation Warnings</h2>
        <div className="flex items-center">
          <span className="text-sm mr-2">Validation level:</span>
          <select
            value={uiSettings.validationLevel}
            onChange={handleValidationLevelChange}
            className="p-1 border border-gray-300 rounded text-sm"
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
              ? "bg-gray-800 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <span>All</span>
          {warningCounts.all > 0 && (
            <span className="ml-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.all}
            </span>
          )}
        </button>

        {warningCounts.king > 0 && (
          <button
            onClick={() => setFilter("king")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "king"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("king")}
              <span className="ml-1">Rulers</span>
            </span>
            <span className="ml-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.king}
            </span>
          </button>
        )}

        {warningCounts.dynasty > 0 && (
          <button
            onClick={() => setFilter("dynasty")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "dynasty"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("dynasty")}
              <span className="ml-1">Dynasties</span>
            </span>
            <span className="ml-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.dynasty}
            </span>
          </button>
        )}

        {warningCounts.event > 0 && (
          <button
            onClick={() => setFilter("event")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "event"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("event")}
              <span className="ml-1">Events</span>
            </span>
            <span className="ml-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.event}
            </span>
          </button>
        )}

        {warningCounts.war > 0 && (
          <button
            onClick={() => setFilter("war")}
            className={`flex items-center px-3 py-1 rounded-full text-sm ${
              filter === "war"
                ? "bg-gray-800 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span className="flex items-center">
              {getWarningTypeIcon("war")}
              <span className="ml-1">Wars</span>
            </span>
            <span className="ml-1 bg-white text-gray-800 rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {warningCounts.war}
            </span>
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
        {filteredWarnings.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No warnings found.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {filteredWarnings.map((warning) => (
              <li key={warning.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {getWarningLevelIcon(warning.level)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {getWarningTypeIcon(warning.type)}
                      <span className="ml-1 capitalize">{warning.type}</span>
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                        {warning.level}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-700">
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
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ValidationWarnings;
