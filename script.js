// ============================================================
// NE LANDSLIDE MONITOR
// NORTHEAST INDIA - MULTI LOCATION MONITORING
// ============================================================


// ------------------------------------------------------------
// NORTHEAST INDIA LOCATIONS
// ------------------------------------------------------------

const locations = [

    {
        name: "Assam",
        city: "Guwahati",
        latitude: 26.1445,
        longitude: 91.7362
    },

    {
        name: "Arunachal Pradesh",
        city: "Itanagar",
        latitude: 27.0844,
        longitude: 93.6053
    },

    {
        name: "Manipur",
        city: "Imphal",
        latitude: 24.8170,
        longitude: 93.9368
    },

    {
        name: "Meghalaya",
        city: "Shillong",
        latitude: 25.5788,
        longitude: 91.8933
    },

    {
        name: "Mizoram",
        city: "Aizawl",
        latitude: 23.7271,
        longitude: 92.7176
    },

    {
        name: "Nagaland",
        city: "Kohima",
        latitude: 25.6751,
        longitude: 94.1086
    },

    {
        name: "Tripura",
        city: "Agartala",
        latitude: 23.8315,
        longitude: 91.2868
    },

    {
        name: "Sikkim",
        city: "Gangtok",
        latitude: 27.3389,
        longitude: 88.6065
    }

];


// ------------------------------------------------------------
// GET WEATHER DATA FOR ONE LOCATION
// ------------------------------------------------------------

async function getWeatherData(location) {

    const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current=` +
        `temperature_2m,` +
        `relative_humidity_2m,` +
        `precipitation,` +
        `rain,` +
        `weather_code,` +
        `soil_moisture_0_to_7cm` +
        `&timezone=Asia%2FKolkata`;


    try {

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                "Weather API request failed"
            );

        }

        const data = await response.json();

        return data;

    }

    catch (error) {

        console.error(
            "Error loading",
            location.name,
            error
        );

        return null;

    }

}


// ------------------------------------------------------------
// WEATHER DESCRIPTION
// ------------------------------------------------------------

function getWeatherDescription(code) {

    if (code === 0) {

        return "Clear Sky";

    }

    if (code >= 1 && code <= 3) {

        return "Cloudy";

    }

    if (code >= 51 && code <= 67) {

        return "Rain";

    }

    if (code >= 80 && code <= 82) {

        return "Rain Showers";

    }

    if (code >= 95) {

        return "Thunderstorm";

    }

    return "Cloudy";

}


// ------------------------------------------------------------
// RISK CALCULATION
// ------------------------------------------------------------

function calculateRisk(
    rainfall,
    soilMoisture,
    humidity
) {

    let score = 0;


    // Rainfall factor

    if (rainfall >= 100) {

        score += 3;

    }

    else if (rainfall >= 50) {

        score += 2;

    }

    else if (rainfall >= 20) {

        score += 1;

    }


    // Soil moisture factor

    if (soilMoisture >= 0.40) {

        score += 3;

    }

    else if (soilMoisture >= 0.30) {

        score += 2;

    }

    else if (soilMoisture >= 0.20) {

        score += 1;

    }


    // Humidity factor

    if (humidity >= 90) {

        score += 2;

    }

    else if (humidity >= 80) {

        score += 1;

    }


    // Final classification

    if (score >= 7) {

        return "CRITICAL";

    }

    if (score >= 5) {

        return "HIGH";

    }

    if (score >= 3) {

        return "MODERATE";

    }

    return "LOW";

}


// ------------------------------------------------------------
// RISK COLOR
// ------------------------------------------------------------

function getRiskColor(risk) {

    if (risk === "CRITICAL") {

        return "#7f0000";

    }

    if (risk === "HIGH") {

        return "#d62828";

    }

    if (risk === "MODERATE") {

        return "#d18b00";

    }

    return "#16803c";

}


// ------------------------------------------------------------
// CREATE MULTI-STATE SECTION
// ------------------------------------------------------------

function createRegionalSection() {

    const existing =
        document.getElementById(
            "regional-monitoring"
        );


    if (existing) {

        existing.remove();

    }


    const section =
        document.createElement("div");


    section.id =
        "regional-monitoring";


    section.innerHTML = `

        <h2 class="section-title">
            Northeast Regional Monitoring
        </h2>

        <p style="
            color:#667085;
            margin-bottom:18px;
        ">
            Live environmental conditions and
            estimated landslide risk across the
            eight Northeast states.
        </p>

        <div id="state-grid"
             style="
                display:grid;
                grid-template-columns:
                repeat(auto-fit,minmax(240px,1fr));
                gap:18px;
             ">
        </div>

    `;


    const lowerSection =
        document.querySelector(
            ".lower-section"
        );


    lowerSection.parentNode.insertBefore(
        section,
        lowerSection
    );

}


// ------------------------------------------------------------
// CREATE STATE CARD
// ------------------------------------------------------------

function createStateCard(
    location,
    data
) {

    const current =
        data.current;


    const temperature =
        current.temperature_2m;


    const rainfall =
        current.precipitation;


    const soilMoisture =
        current.soil_moisture_0_to_7cm;


    const humidity =
        current.relative_humidity_2m;


    const weatherCode =
        current.weather_code;


    const soilPercentage =
        soilMoisture * 100;


    const weather =
        getWeatherDescription(
            weatherCode
        );


    const risk =
        calculateRisk(
            rainfall,
            soilMoisture,
            humidity
        );


    const riskColor =
        getRiskColor(risk);


    const card =
        document.createElement("div");


    card.style.cssText = `

        background:white;

        border-radius:14px;

        padding:20px;

        box-shadow:
        0 4px 15px
        rgba(0,0,0,0.06);

        border-top:
        5px solid ${riskColor};

    `;


    card.innerHTML = `

        <div style="
            display:flex;
            justify-content:space-between;
            align-items:center;
            margin-bottom:12px;
        ">

            <div>

                <div style="
                    font-size:18px;
                    font-weight:bold;
                ">
                    ${location.name}
                </div>

                <div style="
                    color:#667085;
                    font-size:13px;
                    margin-top:4px;
                ">
                    📍 ${location.city}
                </div>

            </div>

            <div style="
                color:${riskColor};
                font-weight:bold;
                font-size:14px;
            ">
                ${risk}
            </div>

        </div>


        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:12px;
            margin-top:15px;
        ">

            <div>

                <div style="
                    color:#667085;
                    font-size:12px;
                ">
                    🌧️ Rainfall
                </div>

                <strong>
                    ${rainfall.toFixed(1)} mm
                </strong>

            </div>


            <div>

                <div style="
                    color:#667085;
                    font-size:12px;
                ">
                    💧 Soil Moisture
                </div>

                <strong>
                    ${soilPercentage.toFixed(1)}%
                </strong>

            </div>


            <div>

                <div style="
                    color:#667085;
                    font-size:12px;
                ">
                    🌡️ Temperature
                </div>

                <strong>
                    ${temperature.toFixed(1)}°C
                </strong>

            </div>


            <div>

                <div style="
                    color:#667085;
                    font-size:12px;
                ">
                    💦 Humidity
                </div>

                <strong>
                    ${humidity}%
                </strong>

            </div>

        </div>


        <div style="
            margin-top:15px;
            padding-top:12px;
            border-top:1px solid #eee;
            color:#667085;
            font-size:13px;
        ">

            Weather:
            <strong>
                ${weather}
            </strong>

        </div>

    `;


    return card;

}


// ------------------------------------------------------------
// UPDATE REGIONAL MONITORING
// ------------------------------------------------------------

async function updateRegionalMonitoring() {

    console.log(
        "Loading Northeast India locations..."
    );


    const results =
        await Promise.all(

            locations.map(
                location =>
                    getWeatherData(location)
            )

        );


    const stateGrid =
        document.getElementById(
            "state-grid"
        );


    if (!stateGrid) {

        return;

    }


    stateGrid.innerHTML = "";


    let highRiskCount = 0;

    let moderateRiskCount = 0;


    results.forEach(
        (data, index) => {

            const location =
                locations[index];


            if (!data) {

                const errorCard =
                    document.createElement(
                        "div"
                    );


                errorCard.innerHTML = `

                    <div style="
                        background:white;
                        padding:20px;
                        border-radius:14px;
                    ">

                        <strong>
                            ${location.name}
                        </strong>

                        <p style="
                            color:#c62828;
                            margin-top:8px;
                        ">
                            Data unavailable
                        </p>

                    </div>

                `;


                stateGrid.appendChild(
                    errorCard
                );

                return;

            }


            const card =
                createStateCard(
                    location,
                    data
                );


            stateGrid.appendChild(
                card
            );


            const current =
                data.current;


            const risk =
                calculateRisk(
                    current.precipitation,
                    current.soil_moisture_0_to_7cm,
                    current.relative_humidity_2m
                );


            if (
                risk === "HIGH" ||
                risk === "CRITICAL"
            ) {

                highRiskCount++;

            }


            if (
                risk === "MODERATE"
            ) {

                moderateRiskCount++;

            }

        }
    );


    console.log(
        "High/Critical locations:",
        highRiskCount
    );


    console.log(
        "Moderate risk locations:",
        moderateRiskCount
    );

}


// ------------------------------------------------------------
// UPDATE MAIN DASHBOARD
// ------------------------------------------------------------

async function updateDashboard() {

    const guwahati =
        locations[0];


    const data =
        await getWeatherData(
            guwahati
        );


    if (
        !data ||
        !data.current
    ) {

        console.error(
            "Unable to load Guwahati data"
        );

        return;

    }


    const current =
        data.current;


    const temperature =
        current.temperature_2m;


    const rainfall =
        current.precipitation;


    const soilMoisture =
        current.soil_moisture_0_to_7cm;


    const humidity =
        current.relative_humidity_2m;


    const weather =
        getWeatherDescription(
            current.weather_code
        );


    const soilPercentage =
        soilMoisture * 100;


    const risk =
        calculateRisk(
            rainfall,
            soilMoisture,
            humidity
        );


    // Main dashboard values

    document.getElementById(
        "temperature-value"
    ).textContent =
        temperature.toFixed(1);


    document.getElementById(
        "rainfall-value"
    ).textContent =
        rainfall.toFixed(1);


    document.getElementById(
        "soil-value"
    ).textContent =
        soilPercentage.toFixed(1);


    document.getElementById(
        "weather-value"
    ).textContent =
        weather;


    document.getElementById(
        "risk-value"
    ).textContent =
        risk;


    // Status

    document.getElementById(
        "rainfall-status"
    ).textContent =
        rainfall >= 50
            ? "⚠️ High rainfall"
            : "Normal rainfall";


    document.getElementById(
        "soil-status"
    ).textContent =
        soilPercentage >= 40
            ? "⚠️ Very wet soil"
            : soilPercentage >= 30
                ? "Above normal"
                : "Normal";


    document.getElementById(
        "temperature-status"
    ).textContent =
        "Live weather data";


    document.getElementById(
        "weather-status"
    ).textContent =
        "Live weather";


    // Alert

    const alertBox =
        document.getElementById(
            "alert-box"
        );


    if (
        risk === "HIGH" ||
        risk === "CRITICAL"
    ) {

        alertBox.className =
            "alert alert-danger";


        alertBox.innerHTML = `

            <strong>
                🚨 ${risk} LANDSLIDE RISK
            </strong>

            <small>
                Environmental conditions indicate
                increased landslide risk.
            </small>

        `;

    }

    else if (
        risk === "MODERATE"
    ) {

        alertBox.className =
            "alert alert-warning";


        alertBox.innerHTML = `

            <strong>
                ⚠️ MODERATE LANDSLIDE RISK
            </strong>

            <small>
                Continue monitoring rainfall,
                soil moisture and humidity.
            </small>

        `;

    }

    else {

        alertBox.className =
            "alert alert-warning";


        alertBox.innerHTML = `

            <strong>
                ✅ LOW LANDSLIDE RISK
            </strong>

            <small>
                Current environmental conditions
                are relatively stable.
            </small>

        `;

    }


    console.log(
        "Guwahati Risk:",
        risk
    );

}


// ------------------------------------------------------------
// START APPLICATION
// ------------------------------------------------------------

createRegionalSection();

updateDashboard();

updateRegionalMonitoring();


// ------------------------------------------------------------
// AUTO REFRESH
// ------------------------------------------------------------

// Update every 10 minutes

setInterval(
    updateDashboard,
    10 * 60 * 1000
);

setInterval(
    updateRegionalMonitoring,
    10 * 60 * 1000
);
// =====================================================
// NORTHEAST INDIA INTERACTIVE RISK MAP
// =====================================================

let riskMap = null;

async function getMapWeatherData(latitude, longitude) {

    try {

        const params = new URLSearchParams({
            latitude: latitude,
            longitude: longitude,
            current:
                "temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,soil_moisture_0_to_7cm",
            timezone: "Asia/Kolkata"
        });

        const url =
            "https://api.open-meteo.com/v1/forecast?" +
            params.toString();

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(
                "Weather API returned " + response.status
            );
        }

        const json = await response.json();

        if (!json.current) {
            throw new Error("Current weather data unavailable");
        }

        return {
            temperature: json.current.temperature_2m ?? 0,
            humidity: json.current.relative_humidity_2m ?? 0,
            rainfall: json.current.rain ?? json.current.precipitation ?? 0,
            soilMoisture:
                json.current.soil_moisture_0_to_7cm ?? 0,
            weatherCode: json.current.weather_code ?? 0
        };

    } catch (error) {

        console.error(
            "Map weather error:",
            error
        );

        return null;
    }
}


// Convert WMO weather code to simple description
function getMapWeatherDescription(code) {

    if (code === 0) return "Clear Sky";

    if ([1, 2, 3].includes(code))
        return "Partly Cloudy";

    if ([45, 48].includes(code))
        return "Fog";

    if ([51, 53, 55, 56, 57].includes(code))
        return "Drizzle";

    if ([61, 63, 65, 66, 67].includes(code))
        return "Rain";

    if ([71, 73, 75, 77].includes(code))
        return "Snow";

    if ([80, 81, 82].includes(code))
        return "Rain Showers";

    if ([95, 96, 99].includes(code))
        return "Thunderstorm";

    return "Unknown";
}


// Risk colour
function getMapRiskColor(risk) {

    if (risk === "CRITICAL")
        return "#ef4444";

    if (risk === "HIGH")
        return "#f97316";

    if (risk === "MODERATE")
        return "#eab308";

    return "#22c55e";
}


// Initialize map
async function initializeRiskMap() {

    const mapElement =
        document.getElementById("risk-map");

    if (!mapElement) {
        console.log("Risk map container not found.");
        return;
    }

    if (typeof L === "undefined") {
        console.error("Leaflet library not loaded.");
        return;
    }

    // Remove old map if already created
    if (riskMap) {
        riskMap.remove();
        riskMap = null;
    }

    // Create map
    riskMap = L.map("risk-map").setView(
        [25.5, 91.5],
        6
    );

    // OpenStreetMap layer
    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(riskMap);


    // Add each Northeast location
    for (const location of locations) {

        try {

           const data =
    await getMapWeatherData(
        location.latitude,
        location.longitude
    );

            if (!data) {
                console.log(
                    "No map data for:",
                    location.city
                );
                continue;
            }


            // Calculate risk
            const risk =
                calculateRisk(
                    data.rainfall,
                    data.soilMoisture,
                    data.humidity
                );


            const markerColor =
                getMapRiskColor(risk);


            // Create marker
            const marker =
                L.circleMarker(
                    [
                        location.lat,
                        location.lon
                    ],
                    {
                        radius: 12,
                        fillColor: markerColor,
                        color: "#ffffff",
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 0.9
                    }
                ).addTo(riskMap);


            // Popup information
            marker.bindPopup(`
                <div style="
                    min-width:220px;
                    font-family:Arial,sans-serif;
                ">

                    <h3 style="
                        margin:0 0 6px 0;
                    ">
                        ${location.city}
                    </h3>

                    <div style="
                        color:#555;
                        margin-bottom:10px;
                    ">
                        ${location.state}
                    </div>

                    <hr>

                    <div>
                        <strong>Landslide Risk:</strong>
                        <span style="
                            color:${markerColor};
                            font-weight:bold;
                        ">
                            ${risk}
                        </span>
                    </div>

                    <br>

                    🌧️ <strong>Rainfall:</strong>
                    ${Number(data.rainfall).toFixed(1)} mm

                    <br><br>

                    💧 <strong>Soil Moisture:</strong>
                    ${(Number(data.soilMoisture) * 100).toFixed(1)}%

                    <br><br>

                    🌡️ <strong>Temperature:</strong>
                    ${Number(data.temperature).toFixed(1)}°C

                    <br><br>

                    💦 <strong>Humidity:</strong>
                    ${Number(data.humidity).toFixed(0)}%

                    <br><br>

                    ☁️ <strong>Weather:</strong>
                    ${getMapWeatherDescription(
                        data.weatherCode
                    )}

                </div>
            `);


        } catch (error) {

            console.error(
                "Map marker error:",
                location.city,
                error
            );

        }

    }

    console.log(
        "Northeast India Risk Map initialized successfully."
    );
}


// Start map after page loads
window.addEventListener(
    "load",
    function () {

        setTimeout(
            initializeRiskMap,
            1000
        );

    }
);// =====================================================
// AI / ML FLASK PREDICTION
// =====================================================
// =====================================================
// LIVE ML LANDSLIDE PREDICTION
// =====================================================

// =====================================================
// AI / ML FLASK PREDICTION
// =====================================================
// =====================================================
// LIVE WEATHER → ML INPUT
// =====================================================

async function getLivePrecipitation() {

    try {

        // Guwahati coordinates
        const latitude = 26.1445;
        const longitude = 91.7362;

        const url =
            `https://api.open-meteo.com/v1/forecast` +
            `?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=precipitation,rain,temperature_2m,relative_humidity_2m` +
            `&timezone=Asia%2FKolkata`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Weather API error: " + response.status);
        }

        const weather = await response.json();

        const precipitation = weather.current.precipitation;

        console.log("Live Weather Data:", weather.current);

        // Put live precipitation into ML input
        document.getElementById("ml-precipitation").value =
            precipitation;

        console.log(
            "Live precipitation added to ML:",
            precipitation
        );

        return weather.current;

    } catch (error) {

        console.error(
            "Live weather error:",
            error
        );

        return null;
    }
}
async function getMLPrediction() {
    await getLivePrecipitation();

    const resultBox = document.getElementById("ml-result");

    try {

        // Get values from ML input fields
       const data = {
    Curvature: Number(document.getElementById("ml-curvature").value),
    Slope: Number(document.getElementById("ml-slope").value),
    Aspect: Number(document.getElementById("ml-aspect").value),
    Elevation: Number(document.getElementById("ml-elevation").value),
    NDVI: Number(document.getElementById("ml-ndvi").value),
    Precipitation: Number(document.getElementById("ml-precipitation").value),
    LULC: Number(document.getElementById("ml-lulc").value)
};

console.log("Sending to Flask:", data);

        console.log("Sending ML data:", data);

        // Send data to Flask API
       const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error("Flask API returned error: " + response.status);
        }

        const result = await response.json();

        console.log("ML Prediction:", result);

        // Display result
        resultBox.innerHTML = `
            <h3>🤖 AI Landslide Prediction</h3>

            <p>
                <strong>Risk Level:</strong>
                ${result.risk}
            </p>

            <p>
                <strong>Prediction Class:</strong>
                ${result.prediction}
            </p>

            <hr>

            <p><strong>Prediction Probabilities</strong></p>

            <p>Class 1: ${result.probabilities["1"]}%</p>
            <p>Class 2: ${result.probabilities["2"]}%</p>
            <p>Class 3: ${result.probabilities["3"]}%</p>

            <p style="color:green;">
                ✅ ML prediction generated successfully
            </p>
        `;

    } catch (error) {

        console.error("ML API Error:", error);

        resultBox.innerHTML = `
            <p style="color:red;">
                ❌ Could not generate ML prediction.
            </p>

            <p>
                Make sure Flask is running on
                <strong>http://127.0.0.1:5000</strong>
            </p>

            <p>
                Open browser console with <strong>F12</strong>
                to see the exact error.
            </p>
        `;
    }
}