const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Report = require('../models/Report');
const Notification = require('../models/Notification');

const FLAG_THRESHOLD = 3;

async function processVehicleFlag(registration_number, reportData) {
  // Find existing vehicle or create new driver + vehicle
  let vehicle = await Vehicle.findByRegistration(registration_number);

  if (!vehicle) {
    const driver_id = await Driver.create({ name: 'Unknown' });
    const vehicle_id = await Vehicle.create({ driver_id, registration_number });
    vehicle = { vehicle_id, driver_id };
  }

  // Insert the report linked to this vehicle
  await Report.create({ ...reportData, vehicle_id: vehicle.vehicle_id });

  // Count reports for this vehicle
  const count = await Report.countForVehicle(vehicle.vehicle_id);

  // Threshold logic
  const status = count >= FLAG_THRESHOLD ? 'flagged' : 'under_review';
  await Driver.updateFlag(vehicle.driver_id, count, status);

  // Notifications are a bonus: never let them break report submission
  try {
    if (status === 'flagged' && count === FLAG_THRESHOLD) {
      // Vehicle has just crossed the threshold: tell everyone who reported it
      const reporters = await Report.reportersForVehicle(vehicle.vehicle_id);
      await Notification.createMany(reporters, {
        type: 'vehicle_flagged',
        title: `${registration_number} has been flagged`,
        body: `Thanks to your report, this vehicle now has ${count} reports and is flagged for other commuters.`,
      });
    } else if (reportData.user_id) {
      await Notification.create({
        user_id: reportData.user_id,
        type: 'report_received',
        title: 'Report received',
        body: status === 'flagged'
          ? `${registration_number} is flagged (${count} reports). Your report adds to the record.`
          : `${registration_number} now has ${count} of ${FLAG_THRESHOLD} reports needed to be flagged.`,
      });
    }
  } catch (err) {
    console.error('⚠️  Could not create notification:', err.message);
  }

  return {
    vehicle_id: vehicle.vehicle_id,
    report_count: count,
    status,
  };
}

module.exports = { processVehicleFlag, FLAG_THRESHOLD };