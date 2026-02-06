/**
 * Generates the weekly schedule slots.
 */

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Default schedule (fallback if no config provided)
const DEFAULT_SCHEDULE = {
    "1": { open: "08:00", close: "22:00" },
    "2": { open: "08:00", close: "22:00" },
    "3": { open: "08:00", close: "22:00" },
    "4": { open: "08:00", close: "22:00" },
    "5": { open: "08:00", close: "22:00" },
    "6": { open: "09:00", close: "20:00" }
};
const DEFAULT_SLOT_DURATION = 30;

function parseTime(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return { hours: h, minutes: m };
}

function generateSlotsForDay(dayIndex, config) {
    const schedule = config?.schedule || DEFAULT_SCHEDULE;
    const slotDuration = config?.slotDurationMinutes || DEFAULT_SLOT_DURATION;

    const dayConfig = schedule[String(dayIndex)];
    if (!dayConfig || !dayConfig.open || !dayConfig.close) {
        return []; // Day is closed
    }

    const start = parseTime(dayConfig.open);
    const end = parseTime(dayConfig.close);
    const slots = [];

    let currentH = start.hours;
    let currentM = start.minutes;

    while (true) {
        if (currentH > end.hours || (currentH === end.hours && currentM >= end.minutes)) {
            break;
        }

        const timeString = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        slots.push(timeString);

        currentM += slotDuration;
        if (currentM >= 60) {
            currentH += Math.floor(currentM / 60);
            currentM = currentM % 60;
        }
    }

    return slots;
}

export const Domain = {
    getScheduleStructure: (config) => {
        const schedule = config?.schedule || DEFAULT_SCHEDULE;
        const result = {};
        // Include all days that have config (0=Sun through 6=Sat)
        for (let i = 0; i <= 6; i++) {
            const dayConfig = schedule[String(i)];
            if (dayConfig && dayConfig.open && dayConfig.close) {
                result[i] = generateSlotsForDay(i, config);
            }
        }
        return result;
    },

    /**
     * Calculate average occupancy per slot
     * @param {Array} records 
     */
    calculateStats: (records) => {
        // Map: "DayIndex-TimeStr" -> { sum, count }
        const stats = {};

        records.forEach(r => {
            // Use the explicit day and time fields
            // (timestamp now represents input time, not slot time)
            const key = `${r.day}-${r.time}`;

            if (!stats[key]) stats[key] = { sum: 0, count: 0 };
            stats[key].sum += r.rating;
            stats[key].count++;
        });

        return stats;
    },

    /**
     * Filter records for a specific slot
     * @param {Array} records
     * @param {number} dayIdx
     * @param {string} timeStr
     */
    filterRecordsBySlot: (records, dayIdx, timeStr) => {
        return records.filter(r => {
            // Match using the explicit day and time fields
            // (timestamp now represents input time, not slot time)
            return r.day === dayIdx && r.time === timeStr;
        }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
    }
};
