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

## Environment Variables and Configuration

Before running the application, you'll need to set up your environment variables for both the backend and frontend. There are `sample.env` files in both the `backend` and `frontend` directories to use as a template.

### Backend (`backend/.env`)

The backend requires credentials for your database and the bastion host used for the SSH tunnel.

  * `DB_PASSWORD`: Your database password.
  * `DB_USERNAME`: Your database username.
  * `DB_NAME`: The name of your database.
  * `DB_HOST`: The hostname of your database instance (e.g., an AWS RDS endpoint).
  * `BASTION_HOST`: The address of your SSH bastion host.
  * `BASTION_USER`: The username for the bastion host.
  * `BASTION_KEYFILE_PATH`: The local path to your SSH private key for the bastion host (e.g., `~/.ssh/my-key.pem`).

### Frontend (`frontend/.env`)

The frontend requires credentials for the Spotify API and AWS Secrets Manager (which is used to securely store the Spotify refresh token).

  * `REACT_APP_CLIENT_ID`: Your Spotify application's Client ID.
  * `REACT_APP_CLIENT_SECRET`: Your Spotify application's Client Secret.
  * `REACT_APP_AWS_ACCESS_KEY_ID`: Your AWS access key ID.
  * `REACT_APP_AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
  * `REACT_APP_AWS_DEFAULT_REGION`: The AWS region where your secret is stored.
  * `REACT_APP_SECRET_NAME`: The name of the secret in AWS Secrets Manager.

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
      * Create and populate the `.env` file as described above.
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
      * Create and populate the `.env` file as described above.
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
