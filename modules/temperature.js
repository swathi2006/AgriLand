const ee = require("@google/earthengine");

async function getTemperature(lat, lon) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lon, lat]);

      // ✅ Use ERA5-Land instead of MODIS for air temperature (better accuracy)
      const dataset = ee.ImageCollection("ECMWF/ERA5_LAND/HOURLY")
        .filterDate("2024-01-01", "2024-12-31") // Use latest available year
        .select("temperature_2m") // Near-surface air temperature
        .mean(); // Get annual mean

      const temperature = dataset.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point,
        scale: 1000, // ERA5 has 9km resolution
        maxPixels: 1e9,
      });

      temperature.evaluate((result, error) => {
        if (error) {
          reject("Error fetching temperature: " + error);
        } else {
          const tempKelvin = result.temperature_2m || null;
          const tempCelsius = tempKelvin ? tempKelvin - 273.15 : "N/A"; // Convert K to °C
          resolve(tempCelsius);
        }
      });
    } catch (err) {
      reject("Unexpected Error: " + err.message);
    }
  });
}

module.exports = getTemperature;

