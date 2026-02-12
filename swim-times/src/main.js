import './style.css'
import { Storage } from './storage.js'
import { Domain } from './domain.js'
import { UI } from './ui.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <header>
      <h1>SwimTimes 🏊</h1>
      <p>Pool Occupancy & Best Times</p>
    </header>
    
    <div id="quick-actions">
      <button id="track-now">Track right now</button>
    </div>

    <div id="stats-container"></div>
    <div id="schedule-container"></div>
  </div>
`

const scheduleContainer = document.getElementById('schedule-container');
const statsContainer = document.getElementById('stats-container');
const scheduleStructure = Domain.getScheduleStructure();

async function refresh() {
  const records = await Storage.getRecords();
  const stats = Domain.calculateStats(records);
  UI.renderStats(statsContainer, stats);
  UI.renderGrid(scheduleContainer, scheduleStructure, stats, (day, time) => {
    // Get history for this slot
    const slotRecords = Domain.filterRecordsBySlot(records, day, time);

    // On Click Slot
    UI.renderModal(day, time, slotRecords, async (rating) => {
      await Storage.addRecord(rating, day, time);
      refresh();
    }, async (id) => {
      await Storage.removeRecord(id);
      refresh();
    });
  });
}

document.getElementById('track-now').addEventListener('click', () => {
  const now = new Date();
  const day = now.getDay();
  const h = now.getHours();
  const m = now.getMinutes() >= 30 ? 30 : 0;
  const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  UI.renderModal(day, time, [], async (rating) => {
    await Storage.addRecord(rating, day, time);
    refresh();
  }, () => { });
});

refresh();
