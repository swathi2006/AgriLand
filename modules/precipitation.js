const ee = require("@google/earthengine");

async function getPrecipitation(lat, lon) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lon, lat]);

      // 🌧️ CHIRPS Daily Precipitation Data (Last 3 Months)
      const dataset = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
        .filterDate("2023-12-01", "2024-03-01") // Last 3 months
        .mean()
        .select("precipitation"); // ✅ Selecting correct band

      // Extract Precipitation at the given point
      const precipitationValue = dataset.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(5500), // ✅ Proper scale for CHIRPS (~5.5 km)
        scale: 5500, // Matching dataset resolution
        maxPixels: 1e13,
      });

      precipitationValue.evaluate((result, error) => {
        if (error) {
          reject("❌ Precipitation Error: " + error);
        } else {
          resolve(result.precipitation ?? "N/A"); // ✅ Ensuring fallback if data is missing
        }
      });
    } catch (err) {
      reject("❌ Unexpected Error: " + err.message);
    }
  });
}

module.exports = getPrecipitation;

