const ee = require("@google/earthengine");

async function getSoilMoisture(lat, lon) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lon, lat]);

      // ✅ Use ERA5-Land dataset for accurate soil moisture data
      const dataset = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
        .filterDate("2024-01-01", "2024-12-31") // Use latest year
        .select("volumetric_soil_water_layer_1") // ✅ Top 7cm soil moisture
        .mean(); // Get annual mean

      const soilMoisture = dataset.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point,
        scale: 1000, // ERA5 resolution (9km)
        maxPixels: 1e9,
      });

      soilMoisture.evaluate((result, error) => {
        if (error) {
          reject("Error fetching soil moisture: " + error);
        } else {
          const moisture = result.volumetric_soil_water_layer_1 || "N/A";
          resolve(moisture);
        }
      });
    } catch (err) {
      reject("Unexpected Error: " + err.message);
    }
  });
}

module.exports = getSoilMoisture;

