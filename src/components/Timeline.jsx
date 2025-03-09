import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { calculateTimelinePosition, getYearRange } from '../utils/dateUtils';

const Timeline = ({ items, type = 'dynasty', minYearOverride, maxYearOverride }) => {
  const [minYear, setMinYear] = useState(0);
  const [maxYear, setMaxYear] = useState(0);
  const [decades, setDecades] = useState([]);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // Use override values if provided, otherwise calculate from items
    const { minYear: calculatedMinYear, maxYear: calculatedMaxYear } = getYearRange(items);
    const min = minYearOverride || calculatedMinYear;
    const max = maxYearOverride || calculatedMaxYear;
    
    setMinYear(min);
    setMaxYear(max);

    // Generate decade markers
    const startDecade = Math.floor(min / 10) * 10;
    const endDecade = Math.ceil(max / 10) * 10;
    const decadeArray = [];

    for (let year = startDecade; year <= endDecade; year += 10) {
      decadeArray.push({
        year,
        position: calculateTimelinePosition(year, min, max)
      });
    }

    setDecades(decadeArray);
  }, [items, minYearOverride, maxYearOverride]);

  if (!items || items.length === 0 || minYear === 0 || maxYear === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timeline data available.
      </div>
    );
  }

  return (
    <div className="timeline-container mb-8 py-4">
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

      {/* Timeline items */}
      <div className="space-y-4">
        {items.map((item) => {
          const startPosition = calculateTimelinePosition(item.startYear, minYear, maxYear);
          const endPosition = calculateTimelinePosition(item.endYear, minYear, maxYear);
          const width = endPosition - startPosition;

          return (
            <Link 
              key={item.id}
              to={type === 'dynasty' ? `/dynasties/${item.id}` : `/kings/${item.id}`}
              className="block"
            >
              <div className="flex items-center mb-1">
                <div className="w-1/5 text-sm font-medium truncate pr-2">{item.name}</div>
                <div className="w-4/5 relative h-8">
                  <div 
                    className="absolute h-6 rounded-md flex items-center px-2 text-white text-xs font-medium"
                    style={{
                      left: `${startPosition}%`,
                      width: `${width}%`,
                      backgroundColor: item.color || '#4F46E5',
                      minWidth: '30px'
                    }}
                  >
                    {width > 10 ? `${item.startYear}-${item.endYear}` : ''}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
