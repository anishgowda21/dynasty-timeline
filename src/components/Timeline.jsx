import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { calculateTimelinePosition, getYearRange } from '../utils/dateUtils';
import { useDynasty } from '../context/DynastyContext';

const Timeline = ({ items, type = 'dynasty', minYearOverride, maxYearOverride, selectedItems = null }) => {
  const { uiSettings } = useDynasty();
  const [minYear, setMinYear] = useState(0);
  const [maxYear, setMaxYear] = useState(0);
  const [decades, setDecades] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [incompleteItems, setIncompleteItems] = useState([]);
  
  useEffect(() => {
    if (!items || items.length === 0) return;
    
    // Filter items based on selection if provided
    let itemsToShow = items;
    if (selectedItems) {
      itemsToShow = items.filter(item => selectedItems.includes(item.id));
    }
    
    // Separate complete and incomplete timeline items
    const completeItems = [];
    const incomplete = [];
    
    itemsToShow.forEach(item => {
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
      const { minYear: calculatedMinYear, maxYear: calculatedMaxYear } = getYearRange(completeItems);
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
      
      {/* Timeline items with complete data */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
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
                    className="absolute h-6 rounded-md flex items-center px-2 text-white text-xs font-medium hover:opacity-90 transition-opacity"
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
      
      {/* Incomplete timeline items */}
      {uiSettings.showIncompleteTimelines && incompleteItems.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-300">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Items with incomplete timeline data</h3>
          
          <div className="space-y-4">
            {incompleteItems.map((item) => (
              <Link 
                key={item.id}
                to={type === 'dynasty' ? `/dynasties/${item.id}` : `/kings/${item.id}`}
                className="block"
              >
                <div className="flex items-center mb-1">
                  <div className="w-1/5 text-sm font-medium truncate pr-2">{item.name}</div>
                  <div className="w-4/5 flex items-center">
                    <div 
                      className="h-6 px-2 rounded-md text-white text-xs font-medium flex items-center justify-center"
                      style={{
                        backgroundColor: item.color || '#4F46E5',
                        width: '100px'
                      }}
                    >
                      {item.startYear || '?'} - {item.endYear || '?'}
                    </div>
                    <span className="ml-2 text-gray-500 text-xs">Incomplete data</span>
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
