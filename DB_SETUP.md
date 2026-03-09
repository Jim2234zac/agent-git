# PostgreSQL Database Setup Guide

## Prerequisites

You need to have PostgreSQL installed and running on your system.

### Installation

#### Windows (Using PostgreSQL Installer)
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the wizard
3. During installation, note the password you set for the `postgres` user
4. Select port 5432 (default)
5. Complete the installation

#### Mac (Using Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Configuration

### 1. Create Database User and Database

Open PostgreSQL command line (psql):

**Windows:**
- Search for "SQL Shell (psql)" in Start Menu

**Mac/Linux:**
```bash
psql -U postgres
```

Then run these commands:

```sql
-- Create a new user (if not using postgres default)
CREATE USER foodadmin WITH PASSWORD 'foodpass123';

-- Create database
CREATE DATABASE food_ordering_db OWNER foodadmin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE food_ordering_db TO foodadmin;
```

### 2. Update `.env` File

Edit the `.env` file in your project root and update the database credentials:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=food_ordering_db
DB_USER=foodadmin
DB_PASSWORD=foodpass123
PORT=3000
NODE_ENV=development
```

## Running the Application

### First Time Setup
```bash
npm install
npm start
```

The server will automatically:
1. Connect to PostgreSQL
2. Create tables based on `db/schema.sql`
3. Migrate existing data from JSON files (if they exist)
4. Start the Express server

### Starting the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Database Schema

The application creates two main tables:

### menu_items
- `id`: Auto-increment primary key
- `name`: Menu item name
- `description`: Menu item description
- `price`: Item price (decimal)
- `category`: Item category
- `image`: Image URL or emoji
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

### orders
- `id`: Auto-increment primary key
- `table_number`: Table number
- `items`: Items ordered (JSON array)
- `total_price`: Order total
- `status`: Order status (pending, preparing, completed)
- `notes`: Special notes
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Troubleshooting

### Connection Error: "ECONNREFUSED"
- Make sure PostgreSQL is running
- Check if you're using the correct host, port, user, and password
- Verify the database exists

### Permission Denied
- Ensure the database user has proper privileges
- Run `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO foodadmin;`

### Port Already in Use
- Change the PORT in `.env` file or stop the process using port 3000

## Data Migration

If you have existing data in JSON files, it will be automatically migrated to PostgreSQL when the server starts. The migration:
- Reads from `data/menu.json` and `data/orders.json`
- Inserts data into PostgreSQL tables
- Skips if data already exists in the database

## Backup and Restore

### Backup Database
```bash
pg_dump -U foodadmin -d food_ordering_db -f backup.sql
```

### Restore Database
```bash
psql -U foodadmin -d food_ordering_db < backup.sql
```
