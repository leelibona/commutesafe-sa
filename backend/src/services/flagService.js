const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Report = require('../models/Report');

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

  return {
    vehicle_id: vehicle.vehicle_id,
    report_count: count,
    status,
  };
}

module.exports = { processVehicleFlag, FLAG_THRESHOLD };