# 🏊 SwimTimes

100% vibe coded, including this readme, take everything with a grain of salt.

Track pool occupancy and find the best times to swim! SwimTimes helps you record and visualize pool crowding patterns throughout the week, so you can plan your swim sessions when the pool is less busy.

![SwimTimes Screenshot](docs/screenshot.png)

## Features

- 📊 **Weekly Schedule Grid**: Visual heatmap showing average occupancy for each time slot
- ⭐ **Rating System**: Simple 1-5 scale (1 = Empty, 5 = Full)
- 📈 **Statistics**: See the quietest and busiest times for the current day
- 📱 **Responsive Design**: Works on desktop and mobile
- 💾 **Persistent Data**: All ratings are saved and persist across restarts
- 🔄 **Real-time Updates**: Instant feedback when adding new ratings

## Installation

### Option 1: Home Assistant Add-on (Recommended)

#### Method A: Install from GitHub Repository

1. **Add the Repository**:
   - In Home Assistant, go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu (three dots) in the top right
   - Select **Repositories**
   - Add this repository URL: `https://github.com/dgaus/swim-times`
   - Click **Add**

2. **Install the Add-on**:
   - Find "Swim Times" in the add-on store
   - Click on it and then click **Install**
   - Wait for the installation to complete

3. **Configure** (optional):
   - The add-on works out of the box with default settings
   - Data is automatically persisted in your Home Assistant config directory

4. **Start the Add-on**:
   - Click **Start**
   - Enable **Start on boot** if you want it to start automatically
   - Enable **Watchdog** to automatically restart if it crashes

5. **Access the App**:
   - Click **Open Web UI** or navigate to `http://homeassistant.local:3000`
   - You can also add it to your Home Assistant sidebar via the **Ingress** feature

#### Method B: Local Add-on Installation

If you want to develop or customize the add-on:

1. **Copy Files to Home Assistant**:
   ```bash
   # SSH into your Home Assistant instance or use the File Editor add-on
   cd /addons
   mkdir swim-times
   cd swim-times
   
   # Copy all files from this repository to /addons/swim-times/
   ```

2. **Install as Local Add-on**:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click **⋮** → **Check for updates**
   - The "Swim Times" add-on should appear under "Local add-ons"
   - Click **Install**

3. **Start and Access**:
   - Follow steps 4-5 from Method A above

### Option 2: Standalone Docker Container

If you're not using Home Assistant or want to run it separately:

1. **Build the Docker Image**:
   ```bash
   docker build -t swim-tracker .
   ```

2. **Run the Container**:
   ```bash
   docker run -d \
     --name swim-tracker \
     -p 3000:3000 \
     -v $(pwd)/data:/app/data \
     --restart unless-stopped \
     swim-tracker
   ```

3. **Access the App**:
   - Open your browser to `http://localhost:3000`

### Option 3: Development Mode

For local development:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```
   This starts both the Vite dev server (port 5173) and the API server (port 3000)

3. **Access the App**:
   - Frontend: `http://localhost:5173`
   - API: `http://localhost:3000`

4. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Usage

### Recording Occupancy

1. **Click a Time Slot**: Click on any time slot in the weekly grid
2. **Rate the Occupancy**: Choose a rating from 1 (Empty) to 5 (Full)
3. **View History**: See all previous ratings for that time slot

### Quick Track

Use the **"Proactive Track (Right Now)"** button to quickly record the current pool occupancy based on the current time.

### Understanding the Grid

- **Green**: Low occupancy (good time to swim!)
- **Yellow**: Moderate occupancy
- **Orange/Red**: High occupancy (crowded)
- **Empty cells**: No data yet for that time slot

### Statistics Cards

- **Quiet Setup**: Shows the time slot with the lowest average occupancy for today
- **Busy Time**: Shows the time slot with the highest average occupancy for today
- **Avg**: Overall average occupancy for today

## Data Storage

### Home Assistant Add-on
Data is stored in `/config/swim-times/swim_db.json` and persists across restarts and updates.

### Standalone Docker
Data is stored in the mounted volume at `./data/swim_db.json`.

### Development Mode
Data is stored locally in `./data/swim_db.json`.

## Configuration

### Environment Variables

- `PORT`: Server port (default: 3000)
- `DATA_DIR`: Directory for data storage (default: `./data`)

### Home Assistant Add-on Configuration

The add-on uses the default configuration in `config.yaml`. No additional configuration is required, but you can modify:

- **Ports**: Change the port mapping if needed
- **Ingress**: Enable/disable Home Assistant ingress integration

## Architecture

- **Frontend**: Vanilla JavaScript with Vite
- **Backend**: Express.js API server
- **Data Storage**: JSON file-based storage
- **Deployment**: Docker container with multi-stage build

## Troubleshooting

### Data Not Persisting
- **Home Assistant**: Ensure the add-on has access to the config directory
- **Docker**: Check that the volume mount is correct
- **Development**: Ensure the `data` directory exists and is writable

### Server Won't Start
- Check the logs in Home Assistant (**Settings** → **Add-ons** → **Swim Tracker** → **Log**)
- Ensure port 3000 is not already in use
- Verify the data directory is accessible

### Empty or Missing Data File
The server is designed to handle this gracefully:
- Missing files are automatically created
- Empty files are initialized with an empty array
- Corrupted files are backed up and recreated

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - feel free to use and modify as needed.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the Home Assistant community forums
- Review the logs for error messages

---

**Enjoy your swims! 🏊‍♂️🏊‍♀️**
