import React, { useState, useEffect } from 'react';

const EtaCalculator = () => {
  const [distance, setDistance] = useState("");
  const [distanceUnit, setDistanceUnit] = useState("km");
  const [speed, setSpeed] = useState("");
  const [speedUnit, setSpeedUnit] = useState("kmh");
  const [startTime, setStartTime] = useState("");
  const [result, setResult] = useState<{
    eta: string;
    duration: string;
    durationHours: number;
    durationMinutes: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=ETA Calculator');
        if (!response.ok) {
          throw new Error('Failed to fetch tool details');
        }
        const data = await response.json();
        setToolName(data.name);
        setDescription(data.description);
      } catch (err) {
        console.error('Error fetching tool details:', err);
      }
    };

    fetchToolDetails();
  }, []);

  const calculateEta = () => {
    setError(null);

    try {
      const distanceValue = Number.parseFloat(distance);
      if (isNaN(distanceValue) || distanceValue <= 0) {
        throw new Error("Distance must be a positive number");
      }

      const speedValue = Number.parseFloat(speed);
      if (isNaN(speedValue) || speedValue <= 0) {
        throw new Error("Speed must be a positive number");
      }

      if (!startTime) {
        throw new Error("Start time is required");
      }

      let distanceInKm = distanceValue;
      if (distanceUnit === "mi") {
        distanceInKm = distanceValue * 1.60934;
      } else if (distanceUnit === "nm") {
        distanceInKm = distanceValue * 1.852;
      }

      let speedInKmh = speedValue;
      if (speedUnit === "mph") {
        speedInKmh = speedValue * 1.60934;
      } else if (speedUnit === "kn") {
        speedInKmh = speedValue * 1.852;
      } else if (speedUnit === "ms") {
        speedInKmh = speedValue * 3.6;
      }

      const travelTimeHours = distanceInKm / speedInKmh;
      const travelTimeHoursWhole = Math.floor(travelTimeHours);
      const travelTimeMinutes = Math.round((travelTimeHours - travelTimeHoursWhole) * 60);

      const startDateTime = new Date(`${new Date().toDateString()} ${startTime}`);
      const etaDateTime = new Date(startDateTime.getTime() + travelTimeHours * 60 * 60 * 1000);

      const etaTimeString = etaDateTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const etaDateString = etaDateTime.toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: startDateTime.getFullYear() !== etaDateTime.getFullYear() ? "numeric" : undefined,
      });

      let durationString = "";
      if (travelTimeHoursWhole > 0) {
        durationString += `${travelTimeHoursWhole} hour${travelTimeHoursWhole !== 1 ? "s" : ""}`;
      }
      if (travelTimeMinutes > 0 || travelTimeHoursWhole === 0) {
        if (durationString) durationString += " ";
        durationString += `${travelTimeMinutes} minute${travelTimeMinutes !== 1 ? "s" : ""}`;
      }

      setResult({
        eta: `${etaTimeString} ${etaDateString}`,
        duration: durationString,
        durationHours: travelTimeHoursWhole,
        durationMinutes: travelTimeMinutes,
      });
    } catch (err) {
      setError((err as Error).message);
      setResult(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-2">Distance</label>
            <div className="flex">
              <input
                type="number"
                min="0"
                step="any"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="e.g. 100"
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value)}
                className="p-2 border border-gray-300 rounded-r"
              >
                <option value="km">km</option>
                <option value="mi">miles</option>
                <option value="nm">naut. mi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2">Speed</label>
            <div className="flex">
              <input
                type="number"
                min="0"
                step="any"
                value={speed}
                onChange={(e) => setSpeed(e.target.value)}
                placeholder="e.g. 60"
                className="flex-1 p-2 border border-gray-300 rounded-l"
              />
              <select
                value={speedUnit}
                onChange={(e) => setSpeedUnit(e.target.value)}
                className="p-2 border border-gray-300 rounded-r"
              >
                <option value="kmh">km/h</option>
                <option value="mph">mph</option>
                <option value="kn">knots</option>
                <option value="ms">m/s</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <button
          onClick={calculateEta}
          className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mb-4"
        >
          Calculate ETA
        </button>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white p-4 rounded border">
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500">Estimated Time of Arrival (ETA)</label>
                <p className="text-2xl font-bold mt-1">{result.eta}</p>
              </div>

              <div>
                <label className="block text-sm text-gray-500">Journey Duration</label>
                <p className="text-lg mt-1">{result.duration}</p>
              </div>

              <div className="flex items-center space-x-2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <p className="text-sm">
                  Traveling {distance} {distanceUnit} at {speed} {speedUnit}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EtaCalculator;