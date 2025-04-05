const prompts = [
    {
      title: "🌱 Soil & Land Classification",
      getText: () => `Analyze the following soil and land data.  
  - Classify the land as "Fertile ✅", "Semi-Fertile 🛠", or "Barren 🏜️"  
  - Justify based on NDVI, soil texture, slope, elevation, temperature, and precipitation  
  - Give short reasoned conclusion.
  
  Soil Data:\n${JSON.stringify(data, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}`
    },
    {
      title: "🛠 Soil & Fertility Improvement Plan",
      getText: () => `Suggest a concise 5-line soil improvement strategy using the data.  
  - Focus on enhancing fertility, moisture retention, and reducing slope impact  
  - Prefer organic solutions where possible.  
  Use clear bullet points.
  
  Soil Data:\n${JSON.stringify(data, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}`
    },
    {
      title: "💧 Water & Irrigation Strategy",
      getText: () => `Based on the land and soil properties, provide an effective water and irrigation plan.  
  - Focus on slope, soil texture, and moisture capacity.  
  - List best 3-5 methods to optimize water usage and improve retention.  
  
  Soil Data:\n${JSON.stringify(data, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}`
    },
    {
      title: "🌾 Crop Recommendations",
      getText: () => `Suggest crops suitable for the current land and climate conditions.  
  - Consider soil texture, NDVI, temperature, moisture, and slope.  
  - List 3-5 best crops for this land.  
  - Mention why these crops are suitable.
  
  Soil Data:\n${JSON.stringify(data, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}`
    },
    {
      title: "📅 5-Step Land Conversion Roadmap",
      getText: () => `Create a 5-step roadmap to convert this land into cultivable farmland.  
  - Include soil improvement, irrigation, vegetation restoration, and crop planning.  
  - Keep steps simple, clear, and practical.
  
  Soil Data:\n${JSON.stringify(data, null, 2)}  
  NDVI: ${ndvi}  
  Soil Moisture: ${soilMoisture}  
  Temperature: ${temperature} °C  
  Elevation: ${elevation} m  
  Slope: ${slope}°  
  Precipitation: ${precipitation} mm  
  Land Cover: ${landCover}`
    }
  ];
  
  // ⏳ Gemini API call for one prompt
  async function getGeminiResponse(promptText, cardId) {
    const API_KEY = "AIzaSyBwy4v32n-1PbKLi75kzHdL7N9ZuGwwU0A";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const requestBody = {
      contents: [{ role: "user", parts: [{ text: promptText }] }]
    };
  
    const responseDiv = document.getElementById(`response-${cardId}`);
    responseDiv.textContent = "⏳ Generating response...";
  
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const json = await res.json();
      const result = json.candidates?.[0]?.content?.parts?.[0]?.text;
  
      if (result) {
        responseDiv.textContent = result;
        // Set result into hidden input and submit form
        const resultInput = document.getElementById(`resultInput-${cardId}`);
        resultInput.value = result;
        document.getElementById(`cardForm-${cardId}`).submit();
      } else {
        responseDiv.textContent = "⚠️ No valid result received.";
      }
    } catch (err) {
      console.error("Error fetching from Gemini API:", err);
      responseDiv.textContent = "❌ Failed to get response from Gemini. Showing default suggestion.";
      responseDiv.textContent += `\n\n🌱 Tip: Apply compost, optimize irrigation, grow climate-adaptive crops.`;
    }
  }
  
  // 🧠 Triggered when a card is clicked
  function fetchGemini(index) {
    const promptText = prompts[index].getText();
    getGeminiResponse(promptText, index);
  }
  
        