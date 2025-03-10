# Dynasty Timeline App

A React application for visualizing royal dynasties, rulers, and historical events through interactive timelines.

## Features

- Create and manage dynasties with custom colors and date ranges
- Add rulers/kings to each dynasty with their reign dates
- Record historical events and link them to specific rulers
- Visualize overlapping timelines of dynasties and rulers
- Color-coded timeline for easy identification
- Detailed view pages for dynasties, rulers, and events
- Import/export functionality using localStorage

## Technologies Used

- React 19
- React Router v6 for navigation (HashRouter for GitHub Pages compatibility)
- Tailwind CSS for styling
- Context API for state management
- localStorage for data persistence
- Vite as the build tool

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

## GitHub Pages

The application uses HashRouter instead of BrowserRouter to ensure proper routing when deployed to GitHub Pages. This allows the app to handle client-side routing without requiring server configuration.

## License

MIT
