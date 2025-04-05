const ee = require("@google/earthengine");

async function getLandCover(lat, lon) {
  return new Promise((resolve, reject) => {
    try {
      const point = ee.Geometry.Point([lon, lat]);

      // 🌍 ESA WorldCover (Primary Land Classification)
      const esaDataset = ee.Image("ESA/WorldCover/v100/2020");
      const esaLandCover = esaDataset.select("Map").reduceRegion({
        reducer: ee.Reducer.mode(),
        geometry: point.buffer(100),
        scale: 30,
        maxPixels: 1e9,
      });

      // 🏞️ MODIS Land Cover (Backup)
      const modisDataset = ee.ImageCollection("MODIS/006/MCD12Q1")
        .filterDate("2020-01-01", "2020-12-31")
        .first()
        .select("LC_Type1");
      const modisLandCover = modisDataset.reduceRegion({
        reducer: ee.Reducer.mode(),
        geometry: point.buffer(100),
        scale: 500,
        maxPixels: 1e9,
      });

      // 💧 Water Detection (JRC Surface Water Occurrence)
      const waterDataset = ee.Image("JRC/GSW1_4/GlobalSurfaceWater");
      const waterOccurrence = waterDataset.select("occurrence").reduceRegion({
        reducer: ee.Reducer.mean(),
        geometry: point,
        scale: 30,
        maxPixels: 1e9,
      });

      // 🔍 ESA WorldCover Classification Mapping
      const ESA_LAND_TYPES = {
        10: "Tree Cover 🌳",
        20: "Shrubland 🌿",
        30: "Grassland 🍃",
        40: "Cropland 🌾",
        50: "Built-Up Area 🏙",
        60: "Bare/Sparse Vegetation 🏜",
        70: "Snow & Ice ❄️",
        80: "Water Bodies 💧",
        90: "Wetlands 🏞",
        100: "Moss & Lichen 🌱"
      };

      // 🏞 MODIS Land Cover Classification Mapping
      const MODIS_LAND_TYPES = {
        1: "Evergreen Needleleaf Forest 🌲",
        2: "Evergreen Broadleaf Forest 🌴",
        3: "Deciduous Needleleaf Forest 🍂🌲",
        4: "Deciduous Broadleaf Forest 🍂🌳",
        5: "Mixed Forest 🌳🌲",
        6: "Closed Shrublands 🌿",
        7: "Open Shrublands 🌾",
        8: "Woody Savannas 🌴🌾",
        9: "Savannas 🌾",
        10: "Grasslands 🍃",
        11: "Permanent Wetlands 🏞💧",
        12: "Croplands 🌾",
        13: "Urban/Built-Up 🏙",
        14: "Cropland/Natural Mosaic 🌾🌳",
        15: "Snow & Ice ❄️",
        16: "Barren/Sparsely Vegetated 🏜"
      };

      // ✅ Handle each evaluate() call properly
      esaLandCover.evaluate((esaResult, esaError) => {
        if (esaError) return reject("❌ ESA Error: " + esaError);

        modisLandCover.evaluate((modisResult, modisError) => {
          if (modisError) return reject("❌ MODIS Error: " + modisError);

          waterOccurrence.evaluate((waterResult, waterError) => {
            if (waterError) return reject("❌ Water Error: " + waterError);

            let landType = "Unknown";

            // 🔍 Check Water First
            if (waterResult && waterResult.occurrence !== undefined && waterResult.occurrence > 50) {
              landType = "Water Body 💧";
            }
            else {
              // 🌍 Use ESA first
              if (esaResult.Map !== undefined) {
                landType = ESA_LAND_TYPES[esaResult.Map] || `ESA Type: ${esaResult.Map}`;
              }

              // 🏞️ If ESA fails, use MODIS
              if (modisResult.LC_Type1 !== undefined) {
                landType += ` | ${MODIS_LAND_TYPES[modisResult.LC_Type1] || `MODIS Type: ${modisResult.LC_Type1}`}`;
              }
            }

            resolve(landType);
          });
        });
      });
    } catch (err) {
      reject("❌ Unexpected Error: " + err.message);
    }
  });
}

module.exports = getLandCover;

