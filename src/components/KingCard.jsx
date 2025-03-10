import { Link } from "react-router-dom";
import { formatYear } from "../utils/dateUtils";

const KingCard = ({ king, dynastyName, dynastyColor }) => {
  return (
    <Link
      to={`/kings/${king.id}`}
      className="block p-4 rounded-lg border border-gray-200 hover:border-indigo-500 transition-colors"
    >
      <div className="flex items-center mb-2">
        {dynastyColor && (
          <div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: dynastyColor }}
          ></div>
        )}
        <h3 className="text-lg font-semibold">{king.name}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-1">
        {formatYear(king.startYear)} - {formatYear(king.endYear)}
      </p>
      {dynastyName && (
        <p className="text-sm text-gray-500 mb-2">{dynastyName}</p>
      )}
      {king.description && (
        <p className="text-sm text-gray-700 line-clamp-2">{king.description}</p>
      )}
    </Link>
  );
};

export default KingCard;
