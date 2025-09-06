# Personal Spotify Stats Web App

This web application displays your personal Spotify statistics. It features a React frontend and a Ruby on Rails backend.

-----

## Features

  * **View Top Tracks**: See a list of your most played tracks.
  * **View Top Artists**: Discover your most listened to artists.
  * **View Top Albums**: See a list of your most played albums.

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

-----

## Database Connection

This application is designed to connect to an AWS RDS MySQL database through an AWS EC2 bastion host for local development.

The `bin/dev` script automates the process of creating an SSH tunnel to the database. It uses the following environment variables from your `.env` file:

  * `BASTION_HOST`
  * `BASTION_USER`
  * `BASTION_KEYFILE_PATH`
  * `DB_HOST`

The `config/database.yml` file is configured to connect to the local port of the SSH tunnel in the development environment and directly to the RDS instance in production.

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
      * Create a `.env` file in the `backend` directory and add the following environment variables:
        ```
        DB_PASSWORD=your_database_password
        DB_USERNAME=your_database_username
        DB_NAME=your_database_name
        BASTION_HOST=your_bastion_host
        BASTION_USER=your_bastion_user
        BASTION_KEYFILE_PATH=your_bastion_keyfile_path
        DB_HOST=your_database_host
        ```
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
3.  **Start the React development server**:
    ```bash
    npm start
    ```

**Note**: The frontend makes API requests to `http://localhost:3001`. Ensure the backend server is running on this port.

-----

## API Endpoints

The backend provides the following API endpoints:

  * `GET /api/tracks`: Returns a list of the user's top tracks.
  * `GET /api/artists`: Returns a list of the user's top artists.
  * `GET /api/albums`: Returns a list of the user's top albums.

-----

## Database Schema

The database consists of three tables:

  * **albums**: Stores information about albums, including `album_id`, `name`, `album_type`, and `release_date`.
  * **artists**: Stores information about artists, including `artist_id`, `name`, `genres`, and `popularity`.
  * **tracks**: Stores information about tracks, including `track_id`, `name`, `album_id`, `artist_ids`, and `popularity`.

-----

## License

This project is licensed under the MIT License.
