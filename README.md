# Dynasty Timeline App

A React application for visualizing royal dynasties, rulers, and historical events through interactive timelines. Create, organize, and explore historical data with an intuitive interface.

**Live Demo:** [https://anishgowda21.github.io/dynasty-timeline/](https://anishgowda21.github.io/dynasty-timeline/)



## Features

- Create and manage dynasties with custom colors and date ranges
- Add rulers/kings to each dynasty with their reign dates
- Record historical events and link them to specific rulers
- Track wars and conflicts with participating rulers and outcomes
- Visualize overlapping timelines of dynasties and rulers
- Color-coded timelines for easy identification
- Detailed view pages for dynasties, rulers, events, and wars
- BCE/CE date handling for ancient history support
- Dark mode support for comfortable viewing

## Who Is This For?

- **History enthusiasts** looking to organize and visualize historical periods
- **Teachers and students** needing educational tools for history classes
- **Researchers** organizing historical data in a visual format
- **Writers and creators** developing historical fiction or content
- **Genealogists** mapping royal lineages and historical context

## Data Handling

- All data is stored locally in your browser using localStorage
- Import/export functionality allows saving and sharing your data
- No server-side storage - your data remains private on your device
- Data validation helps maintain historical accuracy
- Sample data included to demonstrate functionality

## Technologies Used

- React 19 with modern hooks and patterns
- React Router v6 for client-side navigation (HashRouter for GitHub Pages compatibility)
- Tailwind CSS for responsive styling and dark mode support
- Context API for efficient state management
- localStorage for client-side data persistence
- Vite for fast development and optimized builds

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Main route pages
- `/src/context` - State management using Context API
- `/src/utils` - Utility functions
- `/src/data` - Sample data for the application

## Installation

1. Clone the repository
2. Navigate to the project directory
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Usage

- **Home Page**: View all dynasties and a comprehensive timeline
- **Dynasty Page**: View details of a specific dynasty and all its rulers
- **King/Ruler Page**: View details of a specific ruler and associated historical events
- **Add/Edit Forms**: Create and modify dynasties, rulers, and events
- **Import/Export**: Use the data management dropdown in the navbar to import/export your data

## Deployment

This project is configured for automatic deployment to GitHub Pages using GitHub Actions. When you push to the main branch, the application will automatically be built and deployed.

### Manual Deployment

If you want to deploy the app manually, you can use the following commands:

1. Build the application:
   ```
   npm run build
   ```

2. The built files will be in the `dist` directory, which you can then deploy to any static hosting service.


## Key Concepts

- **Dynasties**: Historical family lineages with defined time periods
- **Rulers/Kings**: Individual leaders within dynasties with reign dates
- **Events**: Significant historical occurrences linked to specific rulers
- **Wars**: Conflicts involving multiple rulers with outcomes and timeframes
- **Timeline**: Visual representation of historical periods and overlaps

## License

MIT
