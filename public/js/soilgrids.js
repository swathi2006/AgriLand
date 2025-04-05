
  const button = document.getElementById("roadmap_btn");
  const statusMessage = document.createElement("p");
  statusMessage.style.color = "red"; 
  document.body.insertBefore(statusMessage, document.getElementById("para")); 

  let usedDummy = false; // Declare globally so validateValue() can update it

  getSoilAndWeatherData(latitude, longitude);

async function getSoilAndWeatherData(lat, lng) {
  button.disabled = true;
  button.innerText = "Fetching Data...";
  document.getElementById("loader").style.display = "block";
  statusMessage.innerText = ""; 
  usedDummy = false; // Reset dummy flag

  const soilDataUrl = `https://rest.isric.org/soilgrids/v2.0/properties/query?lon=${lng}&lat=${lat}`;
  const weatherDataUrl = `https://api.tomorrow.io/v4/weather/realtime?location=${lat},${lng}&apikey=${WT_API_KEY}`;

  try {
    const [soilRes, weatherRes] = await Promise.all([fetch(soilDataUrl), fetch(weatherDataUrl)]);
    
    if (!soilRes.ok || !weatherRes.ok) {
      throw new Error("API Response error");
    }

    const soilData = await soilRes.json();
    const weatherData = await weatherRes.json();

    const ph = validateValue(soilData?.properties?.layers?.[7]?.depths?.[0]?.values?.mean / 10, 6.5);
    const clay = validateValue(soilData?.properties?.layers?.[3]?.depths?.[0]?.values?.mean / 10, 25);
    const sand = validateValue(soilData?.properties?.layers?.[8]?.depths?.[0]?.values?.mean / 10, 45);
    const silt = validateValue(soilData?.properties?.layers?.[9]?.depths?.[0]?.values?.mean / 10, 30);
    const orgContent = validateValue(soilData?.properties?.layers?.[10]?.depths?.[0]?.values?.mean / 100, 2.5);
    const bulkDensity = validateValue(soilData?.properties?.layers?.[0]?.depths?.[0]?.values?.mean / 100, 1.3);
    const catExCap = validateValue(soilData?.properties?.layers?.[1]?.depths?.[0]?.values?.mean / 10, 20);
    
    const soilTexture = getSoilTexture(sand, silt, clay);
    
    const weather = {
      humidity: validateValue(weatherData?.data?.values?.humidity, 50),
      temperature: validateValue(weatherData?.data?.values?.temperature, 28),
      windspeed: validateValue(weatherData?.data?.values?.windSpeed, 10)
    };

    if (usedDummy) {
      statusMessage.innerText = "⚠️ API unavailable. Using validated fallback data.";
    }

    const properties = {
      "PH Level": ph,
      "Clay": clay,
      "Sand": sand,
      "Silt": silt,
      "Soil Texture": soilTexture,
      "Organic Content": orgContent,
      "Bulk Density": bulkDensity,
      "Cation Exchange Capacity": catExCap,
      "Humidity": weather.humidity,
      "Temperature": weather.temperature,
      "Windspeed": weather.windspeed,

      
    };

    console.log("props", properties);

    document.getElementById("para").innerHTML = formatData(properties);

    // Store data for form submission
    document.getElementById("data").value = JSON.stringify(properties);

  } catch (err) {
  console.error("❌ API fetch failed:", err);
  statusMessage.innerText = "⚠️ Couldn’t fetch data from APIs. Showing sample values.";
  showFallbackData();
  } finally {
    button.disabled = false;
    document.getElementById("loader").style.display = "none"; 
    button.innerText = "Generate Roadmap";
  }
}

// ✅ Fix button event listener issue
document.getElementById("roadmap_btn").addEventListener("click", (e) => {
  e.preventDefault();
  if (!document.getElementById("data").value) {
    alert("Please wait until data is loaded.");
    return;
  }
  document.getElementById("roadmap_form").submit();
});

function getSoilTexture(sand, silt, clay) {
  if (sand > 85 && silt < 10 && clay < 10) return "Sandy Soil";
  if (clay > 40) return "Clayey Soil";
  if (sand >= 40 && silt >= 40) return "Loamy Soil";
  if (sand > 90) return "Rocky Soil";
  return "Mixed Soil";
}

function validateValue(value, defaultValue) {
  if (value === undefined || value === null || isNaN(value) || value === 0) {
    usedDummy = true;
    return defaultValue;
  }
  return value;
}

function formatData(properties) {
  let html = "<div class='data-container'>";
  for (const [key, value] of Object.entries(properties)) {
    html += `<div class='data-item'><strong>${key}:</strong> <span>${value}</span></div>`;
  }
  html += "</div>";
  return html;
}

function showFallbackData() {
  const fallbackProperties = {
    "PH Level": 6.5,
    "Clay": 25,
    "Sand": 45,
    "Silt": 30,
    "Soil Texture": "Loamy Soil",
    "Organic Content": 2.5,
    "Bulk Density": 1.3,
    "Cation Exchange Capacity": 20,
    "Humidity": 50,
    "Temperature": 28,
    "Windspeed": 10
  };

  document.getElementById("para").innerHTML = formatData(fallbackProperties);
  document.getElementById("data").value = JSON.stringify(fallbackProperties);
}