const ee = require("@google/earthengine");

async function getElevation(lat, lon) {
  const point = ee.Geometry.Point([lon, lat]);

  // Use NASADEM for better accuracy
  const dataset = ee.Image("NASA/NASADEM_HGT/001");

  // Reduce region to get elevation value
  const elevation = dataset.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: point,
    scale: 30,  // Higher resolution
    maxPixels: 1e6
  });

  // Extract elevation value
  const elevationValue = (await elevation.getInfo())?.elevation;

  return elevationValue !== undefined ? elevationValue : "N/A";
}

module.exports = getElevation;

