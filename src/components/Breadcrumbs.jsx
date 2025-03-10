import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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

  if (crumbs.length <= 1) return null;

  return (
    <div className="breadcrumbs flex items-center text-sm text-gray-600 mb-4 dark:text-gray-300">
      {needsEllipsis && !showAllCrumbs && (
        <button
          onClick={toggleAllCrumbs}
          className="flex items-center hover:text-dynasty-primary dark:hover:text-blue-400"
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
          className="hover:text-dynasty-primary mr-2 dark:hover:text-blue-400"
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
            <span className="font-medium text-gray-800 dark:text-gray-200">
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              state={{
                breadcrumbClick: true,
                breadcrumbs: crumbs.slice(
                  0,
                  crumbs.findIndex((c) => c.path === crumb.path) + 1
                ),
              }}
              className="hover:text-dynasty-primary hover:underline dark:hover:text-blue-400"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

// Create a helper function to get entity details by ID
const getEntityDetails = (
  entityType,
  entityId,
  { dynasties, kings, events, wars }
) => {
  switch (entityType) {
    case "dynasty":
      return dynasties.find((d) => d.id === entityId);
    case "king":
      return kings.find((k) => k.id === entityId);
    case "event":
      return events.find((e) => e.id === entityId);
    case "war":
      return wars.find((w) => w.id === entityId);
    default:
      return null;
  }
};

// Higher-order component to generate breadcrumbs based on location
export const withBreadcrumbs = (Component) => {
  return (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { dynasties, kings, events, wars } = useDynasty();
    const [breadcrumbs, setBreadcrumbs] = useState([]);

    // Parse incoming breadcrumbs data from location state
    useEffect(() => {
      // If we have breadcrumbs data in location state, use it
      if (location.state?.breadcrumbs) {
        setBreadcrumbs(location.state.breadcrumbs);
        return;
      }

      // Otherwise, generate breadcrumbs from URL
      const pathSegments = location.pathname.split("/").filter(Boolean);
      const crumbs = [{ name: "Home", path: "/" }];

      if (pathSegments.length === 0) {
        setBreadcrumbs(crumbs);
        return;
      }

      // Process the URL to create breadcrumbs
      if (pathSegments[0] === "events") {
        crumbs.push({ name: "Events", path: "/events" });

        if (pathSegments.length > 1) {
          const eventId = pathSegments[1];
          const event = events.find((e) => e.id === eventId);
          if (event) {
            crumbs.push({
              name: event.name,
              path: `/events/${eventId}`,
              type: "event",
              id: eventId,
            });
          }
        }
      } else if (pathSegments[0] === "wars") {
        crumbs.push({ name: "Wars", path: "/wars" });

        if (pathSegments.length > 1) {
          const warId = pathSegments[1];
          const war = wars.find((w) => w.id === warId);
          if (war) {
            crumbs.push({
              name: war.name,
              path: `/wars/${warId}`,
              type: "war",
              id: warId,
            });
          }
        }
      } else if (pathSegments[0] === "settings") {
        crumbs.push({ name: "Settings", path: "/settings" });
      } else if (pathSegments[0] === "dynasties") {
        if (pathSegments.length > 1) {
          const dynastyId = pathSegments[1];
          const dynasty = dynasties.find((d) => d.id === dynastyId);
          if (dynasty) {
            crumbs.push({
              name: dynasty.name,
              path: `/dynasties/${dynastyId}`,
              type: "dynasty",
              id: dynastyId,
            });
          }
        }
      } else if (pathSegments[0] === "kings") {
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
                  type: "dynasty",
                  id: dynasty.id,
                });
              }
            }
            crumbs.push({
              name: king.name,
              path: `/kings/${kingId}`,
              type: "king",
              id: kingId,
            });
          }
        }
      }

      // Handle the case where a referrer item exists in state
      // This is for tracking the actual navigation history
      if (location.state?.from) {
        const fromPath = location.state.from;
        const fromPathSegments = fromPath.split("/").filter(Boolean);

        if (fromPathSegments.length > 1) {
          const entityType = fromPathSegments[0];
          const entityId = fromPathSegments[1];

          // Map types to proper names
          const typeMap = {
            dynasties: "dynasty",
            kings: "king",
            events: "event",
            wars: "war",
          };

          const type = typeMap[entityType];
          if (type) {
            const entity = getEntityDetails(type, entityId, {
              dynasties,
              kings,
              events,
              wars,
            });
            if (entity) {
              // Check if this entity is different from what's in the current breadcrumb path
              const isDifferentPath = !crumbs.some(
                (crumb) => crumb.type === type && crumb.id === entityId
              );

              if (isDifferentPath) {
                // Find index to insert - typically right before the last item
                const insertIndex = Math.max(crumbs.length - 1, 1);

                // Create a new breadcrumb array with the referrer path inserted
                const newCrumbs = [...crumbs];
                newCrumbs.splice(insertIndex, 0, {
                  name: entity.name,
                  path: `/${entityType}/${entityId}`,
                  type,
                  id: entityId,
                });

                setBreadcrumbs(newCrumbs);
                return;
              }
            }
          }
        }
      }

      setBreadcrumbs(crumbs);
    }, [location, dynasties, kings, events, wars]);

    return (
      <div className="dark:bg-gray-900 dark:text-white">
        <Breadcrumbs crumbs={breadcrumbs} />
        <Component {...props} />
      </div>
    );
  };
};

export default Breadcrumbs;
