import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { calculateTimelinePosition, getYearRange } from "../utils/dateUtils";
import { useDynasty } from "../context/DynastyContext";

const Timeline = ({
  items,
  type = "dynasty",
  minYearOverride,
  maxYearOverride,
  selectedItems = null,
}) => {
  const { uiSettings } = useDynasty();
  const [minYear, setMinYear] = useState(0);
  const [maxYear, setMaxYear] = useState(0);
  const [decades, setDecades] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [incompleteItems, setIncompleteItems] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const timelineContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Handle timeline zoom
  const handleZoomIn = () => {
    setZoomLevel((prevZoom) => Math.min(prevZoom + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel((prevZoom) => Math.max(prevZoom - 0.25, 0.5));
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    if (timelineContainerRef.current) {
      timelineContainerRef.current.scrollLeft = 0;
    }
  };

  // Calculate automatic zoom level based on time span and number of items
  const calculateAutomaticZoomLevel = (min, max, itemCount) => {
    const timeSpan = max - min;

    // Base zoom level on time span
    let automaticZoom = 1;

    // If we have a very long time span (more than 1000 years), increase zoom
    if (timeSpan > 1000) {
      automaticZoom = 1.5;
    }

    // If we have a very long time span (more than 1500 years), increase zoom further
    if (timeSpan > 1500) {
      automaticZoom = 2;
    }

    // If we have many items (more than 5), also increase zoom
    if (itemCount > 5) {
      automaticZoom += 0.25;
    }

    // If we have many items (more than 10), increase zoom further
    if (itemCount > 10) {
      automaticZoom += 0.25;
    }

    return Math.min(Math.max(automaticZoom, 0.5), 3); // Keep within 0.5 to 3 range
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle timeline panning
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - timelineContainerRef.current.offsetLeft);
    setScrollLeft(timelineContainerRef.current.scrollLeft);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setStartX(e.touches[0].pageX - timelineContainerRef.current.offsetLeft);
      setScrollLeft(timelineContainerRef.current.scrollLeft);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - timelineContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Speed multiplier
    timelineContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const x = e.touches[0].pageX - timelineContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Speed multiplier
    timelineContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Calculate year range and filtered items
  useEffect(() => {
    if (!items || items.length === 0) return;

    // Filter items based on selection if provided
    let itemsToShow = items;
    if (selectedItems) {
      itemsToShow = items.filter((item) => selectedItems.includes(item.id));
    }

    // Separate complete and incomplete timeline items
    const completeItems = [];
    const incomplete = [];

    itemsToShow.forEach((item) => {
      if (item.startYear && item.endYear) {
        completeItems.push(item);
      } else if (item.startYear) {
        incomplete.push(item);
      }
    });

    setFilteredItems(completeItems);
    setIncompleteItems(incomplete);

    // Calculate year range from complete items only
    if (completeItems.length > 0) {
      // Use override values if provided, otherwise calculate from items
      const { minYear: calculatedMinYear, maxYear: calculatedMaxYear } =
        getYearRange(completeItems);
      const min = minYearOverride || calculatedMinYear;
      const max = maxYearOverride || calculatedMaxYear;

      setMinYear(min);
      setMaxYear(max);

      // Automatically set zoom level based on time span and number of items
      const autoZoom = calculateAutomaticZoomLevel(
        min,
        max,
        completeItems.length
      );
      setZoomLevel(autoZoom);

      // Generate decade markers
      const startDecade = Math.floor(min / 10) * 10;
      const endDecade = Math.ceil(max / 10) * 10;
      const decadeArray = [];

      // Generate decade markers with appropriate spacing based on time span
      const totalSpan = endDecade - startDecade;
      const decadeInterval =
        totalSpan > 500 ? 50 : totalSpan > 200 ? 20 : totalSpan > 100 ? 10 : 5;

      for (let year = startDecade; year <= endDecade; year += decadeInterval) {
        decadeArray.push({
          year,
          position: calculateTimelinePosition(year, min, max),
        });
      }

      setDecades(decadeArray);
    }
  }, [items, minYearOverride, maxYearOverride, selectedItems]);

  if (!items || items.length === 0 || minYear === 0 || maxYear === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Controls bar */}
      <div className="flex justify-between items-center mb-2">
        {/* Zoom controls */}
        <div className="flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Zoom out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12H9"
              />
            </svg>
          </button>
          <button
            onClick={handleZoomReset}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Reset zoom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
              />
            </svg>
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Zoom in"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>

        {/* Expand/collapse button */}
        <button
          onClick={toggleExpand}
          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
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
          )}
        </button>
      </div>

      {/* Timeline container */}
      <div
        className={`timeline-container mb-8 py-4 overflow-x-auto cursor-grab ${
          isExpanded ? "h-auto max-h-96" : "h-40 sm:h-48 md:h-56"
        }`}
        ref={timelineContainerRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        <div
          className="relative min-h-full"
          style={{
            width: `${100 * zoomLevel}%`,
            minWidth: "100%",
          }}
        >
          {/* Year scale */}
          <div className="relative h-8 mb-6">
            {decades.map((decade) => (
              <div
                key={decade.year}
                className="absolute transform -translate-x-1/2"
                style={{ left: `${decade.position}%` }}
              >
                <div className="h-3 border-l border-gray-400"></div>
                <div className="text-xs text-gray-600">{decade.year}</div>
              </div>
            ))}
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300"></div>
          </div>

          {/* Timeline items with complete data */}
          <div className="space-y-4">
            {filteredItems.map((item, index) => {
              const startPosition = calculateTimelinePosition(
                item.startYear,
                minYear,
                maxYear
              );
              const endPosition = calculateTimelinePosition(
                item.endYear,
                minYear,
                maxYear
              );
              const width = endPosition - startPosition;

              // Add a small vertical offset for overlapping timelines to make them more visible
              // Use more pronounced offsets in mobile view to avoid congestion
              const isMobile = window.innerWidth < 640; // sm breakpoint
              const offsetY = isMobile
                ? (index % 3) * 10 // More offset on mobile (0, 10, 20px)
                : index % 2 === 0
                ? 0
                : 12; // Regular offset on desktop

              return (
                <Link
                  key={item.id}
                  to={
                    type === "dynasty"
                      ? `/dynasties/${item.id}`
                      : `/kings/${item.id}`
                  }
                  className="block"
                >
                  <div className="flex items-center mb-1">
                    <div className="w-1/4 sm:w-1/5 text-xs sm:text-sm font-medium truncate pr-2">
                      {item.name}
                    </div>
                    <div className="w-3/4 sm:w-4/5 relative h-8">
                      <div
                        className="absolute h-6 rounded-md flex items-center px-2 text-white text-xs font-medium hover:opacity-90 transition-opacity"
                        style={{
                          left: `${startPosition}%`,
                          width: `${width}%`,
                          backgroundColor: item.color || "#4F46E5",
                          minWidth: "30px",
                          top: `${offsetY}px`,
                          zIndex: offsetY > 0 ? 2 : 1,
                        }}
                        title={`${item.name}: ${item.startYear}-${item.endYear}`}
                      >
                        {width > 8 ? `${item.startYear}-${item.endYear}` : ""}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pan/zoom instructions */}
      <div className="text-xs text-gray-500 text-center mb-4">
        <p className="hidden sm:block">
          Click and drag to pan, use zoom controls to adjust scale
        </p>
        <p className="sm:hidden">Swipe to pan, use buttons to zoom</p>
      </div>

      {/* Incomplete timeline items */}
      {uiSettings.showIncompleteTimelines && incompleteItems.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 mb-4">
            Items with incomplete timeline data
          </h3>

          <div className="space-y-4">
            {incompleteItems.map((item) => (
              <Link
                key={item.id}
                to={
                  type === "dynasty"
                    ? `/dynasties/${item.id}`
                    : `/kings/${item.id}`
                }
                className="block"
              >
                <div className="flex items-center mb-1">
                  <div className="w-1/4 sm:w-1/5 text-xs sm:text-sm font-medium truncate pr-2">
                    {item.name}
                  </div>
                  <div className="w-3/4 sm:w-4/5 flex items-center">
                    <div
                      className="h-6 px-2 rounded-md text-white text-xs font-medium flex items-center justify-center"
                      style={{
                        backgroundColor: item.color || "#4F46E5",
                        width: "100px",
                      }}
                    >
                      {item.startYear || "?"} - {item.endYear || "?"}
                    </div>
                    <span className="ml-2 text-gray-500 text-xs">
                      Incomplete data
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
