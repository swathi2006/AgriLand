function buildPrompt(index, { soilData, landCover, ndvi, temperature, soilMoisture, elevation, slope, precipitation }) {
    const base = `
  Soil Data:\n${JSON.stringify(soilData, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}
  `;
  
    const prompts = [
      {
        title: "🌱 Soil & Land Classification",
        text: `Analyze the following soil and land data.  
  - Classify the land as "Fertile ✅", "Semi-Fertile 🛠", or "Barren 🏜️"  
  - Justify based on NDVI, soil texture, slope, elevation, temperature, and precipitation  
  - Give short reasoned conclusion.\n\n${base}`
      },
      {
        title: "🛠 Soil & Fertility Improvement Plan",
        text: `Suggest a concise soil improvement strategy using the data.  
  - Focus on enhancing fertility, moisture retention, and reducing slope impact  
  - Prefer organic solutions where possible.  
  Use clear bullet points.\n\n${base}`
      },
      {
        title: "💧 Water & Irrigation Strategy",
        text: `Based on the land and soil properties, provide an effective water and irrigation plan.  
  - Focus on slope, soil texture, and moisture capacity.  
  - List best 3-5 methods to optimize water usage and improve retention.\n\n${base}`
      },
      {
        title: "🌾 Crop Recommendations",
        text: `Suggest crops suitable for the current land and climate conditions.  
  - Consider soil texture, NDVI, temperature, moisture, and slope.  
  - List 3-5 best crops for this land.  
  - Mention why these crops are suitable.\n\n${base}`
      },
      {
        title: "📅 Land Conversion Roadmap",
        text: `Create a roadmap to convert this land into cultivable farmland.  
  - Include soil improvement, irrigation, vegetation restoration, and crop planning.  
  - Keep steps simple, clear, and practical.\n\n${base}`
      }
    ];
  
    return prompts[index];
  }
module.exports = buildPrompt;  