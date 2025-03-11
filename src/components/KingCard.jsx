import { Link } from "react-router-dom";
import { formatYear } from "../utils/dateUtils";

const KingCard = ({
  king,
  dynastyColor = "#4F46E5",
  eventsCount = 0,
  dynastyName,
}) => {
  // Format reign years
  const reignYears = king.startYear
    ? `${formatYear(king.startYear)}${
        king.endYear ? ` - ${formatYear(king.endYear)}` : " - Present"
      }`
    : "- Present"; // Special case when startYear is missing

  // Format lifetime years
  const lifeYears = king.birthYear
    ? `${formatYear(king.birthYear)}${
        king.deathYear ? ` - ${formatYear(king.deathYear)}` : ""
      }`
    : "";

  // Calculate duration
  const reignDuration =
    king.endYear && king.startYear
      ? `(${Math.abs(king.endYear - king.startYear)} years)`
      : "";

  return (
    <Link
      to={`/kings/${king.id}`}
      className={`king-card block border-l-4 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg dark:border-opacity-70`}
      style={{ borderLeftColor: dynastyColor }}
    >
      <div className="p-4">
        <h3 className="text-lg font-bold mb-1 dark:text-white">{king.name}</h3>

        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          <div className="flex items-center justify-between">
            <span>
              Reign: {reignYears} {reignDuration}
            </span>
            {eventsCount > 0 && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                {eventsCount} event{eventsCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {lifeYears && <div>Lived: {lifeYears}</div>}
          {dynastyName && (
            <div className="text-gray-500 dark:text-gray-400 mt-1">
              {dynastyName} Dynasty
            </div>
          )}
        </div>

        {king.description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
            {king.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default KingCard;
