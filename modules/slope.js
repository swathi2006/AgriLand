const ee = require("@google/earthengine");

async function getSlope(lat, lon) {
  const point = ee.Geometry.Point([lon, lat]);
  const elevation = ee.Image("USGS/SRTMGL1_003"); // SRTM DEM Data
  const slope = ee.Terrain.slope(elevation); // Compute slope

  // Reduce region for more stable slope measurement
  const sample = slope.reduceRegion({
    reducer: ee.Reducer.mean(), // Take mean value for better accuracy
    geometry: point.buffer(90), // Buffering ~90m to get a more representative slope
    scale: 90, // Use 90m to match buffering
    maxPixels: 1e9
  });

  // Extract slope value
  const result = await sample.getInfo();
  return result?.slope !== undefined ? result.slope : "N/A";
}

module.exports = getSlope;

