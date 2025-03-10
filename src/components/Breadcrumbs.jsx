import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDynasty } from "../context/DynastyContext";

// Breadcrumb component with ellipsis for long paths
const Breadcrumbs = ({ crumbs }) => {
  const [showAllCrumbs, setShowAllCrumbs] = useState(false);
  const maxVisibleCrumbs = 3;

  // If we have more than maxVisibleCrumbs, we'll show ellipsis
  const needsEllipsis = crumbs.length > maxVisibleCrumbs;

  // Determine which crumbs to show
  const visibleCrumbs = showAllCrumbs
    ? crumbs
    : needsEllipsis
    ? crumbs.slice(crumbs.length - maxVisibleCrumbs)
    : crumbs;

  // Toggle showing all crumbs
  const toggleAllCrumbs = () => {
    setShowAllCrumbs(!showAllCrumbs);
  };

  if (crumbs.length === 0) return null;

  return (
    <div className="breadcrumbs flex items-center text-sm text-gray-600 mb-4">
      {needsEllipsis && !showAllCrumbs && (
        <button
          onClick={toggleAllCrumbs}
          className="flex items-center hover:text-dynasty-primary"
          title="Show full navigation path"
        >
          <span className="mr-2">...</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      )}

      {showAllCrumbs && needsEllipsis && (
        <button
          onClick={toggleAllCrumbs}
          className="hover:text-dynasty-primary mr-2"
          title="Show fewer items"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>
      )}

      {visibleCrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mx-2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          )}
          {index === visibleCrumbs.length - 1 ? (
            <span className="font-medium text-gray-800">{crumb.name}</span>
          ) : (
            <Link
              to={crumb.path}
              state={{ breadcrumbClick: true }}
              className="hover:text-dynasty-primary hover:underline"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

// Higher-order component to generate breadcrumbs based on location
export const withBreadcrumbs = (Component) => {
  return (props) => {
    const location = useLocation();
    const { dynasties, kings, events, wars } = useDynasty();

    // Generate breadcrumbs based on URL pathname
    const generateBreadcrumbs = () => {
      const crumbs = [];
      const pathSegments = location.pathname.split("/").filter(Boolean);

      // Always add Home
      crumbs.push({ name: "Home", path: "/" });

      if (pathSegments.length === 0) return crumbs;

      // First level: events, wars, settings
      if (pathSegments[0] === "events") {
        crumbs.push({ name: "Events", path: "/events" });

        // Second level: specific event
        if (pathSegments.length > 1) {
          const eventId = pathSegments[1];
          const event = events.find((e) => e.id === eventId);
          if (event) {
            crumbs.push({ name: event.name, path: `/events/${eventId}` });
          }
        }
      } else if (pathSegments[0] === "wars") {
        crumbs.push({ name: "Wars", path: "/wars" });

        // Second level: specific war
        if (pathSegments.length > 1) {
          const warId = pathSegments[1];
          const war = wars.find((w) => w.id === warId);
          if (war) {
            crumbs.push({ name: war.name, path: `/wars/${warId}` });
          }
        }
      } else if (pathSegments[0] === "settings") {
        crumbs.push({ name: "Settings", path: "/settings" });
      }
      // Dynasty and King pages
      else if (pathSegments[0] === "dynasties") {
        // Second level: specific dynasty
        if (pathSegments.length > 1) {
          const dynastyId = pathSegments[1];
          const dynasty = dynasties.find((d) => d.id === dynastyId);
          if (dynasty) {
            crumbs.push({
              name: dynasty.name,
              path: `/dynasties/${dynastyId}`,
            });
          }
        }
      } else if (pathSegments[0] === "kings") {
        // Second level: specific king
        if (pathSegments.length > 1) {
          const kingId = pathSegments[1];
          const king = kings.find((k) => k.id === kingId);
          if (king) {
            // If king belongs to a dynasty, add that first
            if (king.dynastyId) {
              const dynasty = dynasties.find((d) => d.id === king.dynastyId);
              if (dynasty) {
                crumbs.push({
                  name: dynasty.name,
                  path: `/dynasties/${dynasty.id}`,
                });
              }
            }
            crumbs.push({ name: king.name, path: `/kings/${kingId}` });
          }
        }
      }

      return crumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
      <div>
        <Breadcrumbs crumbs={breadcrumbs} />
        <Component {...props} />
      </div>
    );
  };
};

export default Breadcrumbs;
