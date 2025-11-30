# AnatoliaViz

AnatoliaViz is an interactive weather visualization application for Turkey, built with React and Vite. It provides real-time weather data visualization using intuitive heatmaps and interactive layers.

## Features

-   **Interactive Map**: Explore Turkey's weather with a responsive and zoomable map interface powered by Leaflet.
-   **Multiple Weather Layers**: Visualize various weather conditions including:
    -   Temperature (2m & Apparent)
    -   Wind Speed & Gusts
    -   Precipitation (Rain)
    -   Cloud Cover
    -   Humidity
    -   Surface Pressure
    -   Snow Depth
    -   Radar (dBZ)
-   **Real-time Data**: Fetches up-to-date weather data from the [OpenMeteo API](https://open-meteo.com/).
-   **Ventusky-style Visualization**: Smooth temperature gradients and heatmaps for a professional look.
-   **Detailed Information**: Click on any location to view detailed weather metrics.
-   **Search Functionality**: Easily find specific provinces and districts.

## Tech Stack

-   **Frontend Framework**: [React](https://react.dev/)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Map Library**: [Leaflet](https://leafletjs.com/) & [React Leaflet](https://react-leaflet.js.org/)
-   **Data Source**: [OpenMeteo API](https://open-meteo.com/)
-   **Styling**: CSS Modules & Leaflet default styles

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/anatolia-viz.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd anatolia-viz
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

Start the development server:

```bash
npm run dev
```

Open your browser and visit `http://localhost:5173` (or the URL shown in your terminal) to view the application.

## Project Structure

-   `src/components`: Reusable UI components (Map layers, controls, panels).
-   `src/api`: API integration logic (OpenMeteo).
-   `src/data`: Static data files (GeoJSON, location lists).
-   `src/utils`: Helper functions for data processing.

## License

This project is licensed under the MIT License.
