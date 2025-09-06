# Personal Spotify Stats Web App

This web application displays your personal Spotify statistics, featuring a React frontend and a Ruby on Rails backend. It offers both real-time and historical views of your listening habits.

-----

## Features

  * **Current & Monthly Stats**: Toggle between your current, real-time listening stats and your historical monthly data.
  * **View Top Tracks**: See a list of your most played tracks, complete with album art.
  * **View Top Artists**: Discover your most listened to artists.
  * **View Top Albums**: See a list of your most played albums.
  * **Interactive UI**: A clean, tab-based navigation and a grid/table view toggle to customize your experience.
  * **Historical Data Grouping**: Monthly stats are organized in an accordion view, grouped by month and year for easy browsing.

-----

## Technologies Used

### Backend

  * **Ruby on Rails**: A web application framework written in Ruby.
  * **Puma**: A Ruby web server for concurrent applications.
  * **MySQL**: A relational database management system.
  * **Rack CORS**: A Ruby middleware for handling Cross-Origin Resource Sharing (CORS).

### Frontend

  * **React**: A JavaScript library for building user interfaces.
  * **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript.
  * **Material UI**: A popular React UI framework.
  * **Axios**: A promise-based HTTP client for the browser and Node.js.
  * **Spotify Web API**: Used to fetch real-time user data and album artwork.

-----

## Database and API Connection

This application connects to an AWS RDS MySQL database for historical data and uses the Spotify Web API for live data.

### Database

The `bin/dev` script automates creating an SSH tunnel to a database for local development, using environment variables from your `.env` file (`BASTION_HOST`, `BASTION_USER`, etc.).

### Spotify API

The frontend connects directly to the Spotify Web API to fetch your current top tracks and artists, as well as to retrieve album art for the monthly top tracks view.

-----

## Setup and Installation

### Prerequisites

  * Ruby 3.3.4
  * Node.js and npm
  * MySQL

### Backend Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/brandonlc2020/personalspotifystatswebapp.git
    ```
2.  **Navigate to the backend directory**:
    ```bash
    cd personalspotifystatswebapp/backend
    ```
3.  **Install dependencies**:
    ```bash
    bundle install
    ```
4.  **Set up the database**:
      * Create a `.env` file in the `backend` directory with your database and bastion host credentials.
      * Create and migrate the database:
        ```bash
        rails db:create
        rails db:migrate
        ```
5.  **Start the Rails server**:
    ```bash
    bin/dev
    ```

### Frontend Setup

1.  **Navigate to the frontend directory**:
    ```bash
    cd personalspotifystatswebapp/frontend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
      * Create a `.env` file in the `frontend` directory and add your Spotify and AWS credentials.
4.  **Start the React development server**:
    ```bash
    npm start
    ```

**Note**: The frontend makes API requests to `http://localhost:3001`. Ensure the backend server is running on this port.

-----

## API Endpoints

The backend provides the following API endpoints for the historical data view:

  * `GET /api/tracks`: Returns a list of the user's top tracks, grouped by month and year.
  * `GET /api/artists`: Returns a list of the user's top artists, grouped by month and year.
  * `GET /api/albums`: Returns a list of the user's top albums, grouped by month and year.

-----

## Database Schema

The database consists of three tables:

  * **albums**: Stores information about albums, including `album_id`, `name`, `album_type`, and `release_date`.
  * **artists**: Stores information about artists, including `artist_id`, `name`, `genres`, and `popularity`.
  * **tracks**: Stores information about tracks, including `track_id`, `name`, `album_id`, `artist_ids`, and `popularity`.

-----

## License

This project is licensed under the MIT License.
