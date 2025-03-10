import { Link } from "react-router-dom";
import { formatYear } from "../utils/dateUtils";

const DynastyCard = ({ dynasty, kingsCount }) => {
  // Calculate duration if both start and end years are available
  const duration =
    dynasty.endYear && dynasty.startYear
      ? `(${dynasty.endYear - dynasty.startYear} years)`
      : "";

  return (
    <Link
      to={`/dynasties/${dynasty.id}`}
      className="dynasty-card hover:translate-y-[-2px] dark:bg-gray-800 dark:border-opacity-70"
      style={{ borderLeftColor: dynasty.color || "#4F46E5" }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold mb-1 dark:text-white">
            {dynasty.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            {formatYear(dynasty.startYear)} - {formatYear(dynasty.endYear)}{" "}
            {duration}
          </p>
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: dynasty.color || "#4F46E5" }}
        >
          {kingsCount}
        </div>
      </div>

      <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
        {dynasty.description || "No description available."}
      </p>

      <div className="mt-3 text-dynasty-primary dark:text-blue-400 text-sm font-medium">
        View Dynasty &rarr;
      </div>
    </Link>
  );
};

export default DynastyCard;
