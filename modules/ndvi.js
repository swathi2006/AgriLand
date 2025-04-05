const ee = require("@google/earthengine");

async function getNDVI(lat, lon) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lon, lat]);

      // 🌿 MODIS NDVI Dataset — Using recent year for more accurate crop analysis
      const dataset = ee.ImageCollection("MODIS/006/MOD13A1")
        .filterDate("2023-01-01", "2023-12-31") // 📅 Use recent data
        .mean()
        .select("NDVI"); // ✅ Using correct NDVI band

      // Extract NDVI at the given point with a 1000m buffer
      const ndviValue = dataset.reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point.buffer(1000), // 📍 Bigger area for better sampling
        scale: 500,
        maxPixels: 1e9,
      });

      ndviValue.evaluate((result, error) => {
        if (error) {
          reject("❌ NDVI Error: " + error);
        } else {
          const ndviScaled = (result.NDVI ?? 0) / 10000; // 🔍 Proper MODIS scaling
          resolve(ndviScaled);
        }
      });
    } catch (err) {
      reject("❌ Unexpected Error: " + err.message);
    }
  });
}

module.exports = getNDVI;
