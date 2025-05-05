import React, { useState, useEffect, useRef } from 'react';

const Chronometer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [laps, setLaps] = useState<{ id: number; time: number; diff: number }[]>([]);
  const [toolName, setToolName] = useState('');
  const [description, setDescription] = useState('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lapCounterRef = useRef(0);

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Chronometer');
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

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const toggleTimer = () => {
    if (isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else {
      const now = Date.now() - time;
      startTimeRef.current = now;

      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTimeRef.current);
      }, 10);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setTime(0);
    setLaps([]);
    lapCounterRef.current = 0;
  };

  const addLap = () => {
    if (!isRunning) return;

    lapCounterRef.current += 1;
    const lapId = lapCounterRef.current;
    const lapTime = time;

    setLaps((prevLaps) => {
      const prevLapTime = prevLaps.length > 0 ? prevLaps[0].time : 0;
      const diff = lapTime - prevLapTime;
      return [{ id: lapId, time: lapTime, diff }, ...prevLaps];
    });
  };

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="text-center mb-6">
          <div className="text-5xl font-mono font-semibold mb-6">{formatTime(time)}</div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`px-4 py-2 rounded ${isRunning ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
            >
              {isRunning ? (
                <>
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
                    className="inline mr-2 h-4 w-4"
                  >
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                  </svg>
                  Stop
                </>
              ) : (
                <>
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
                    className="inline mr-2 h-4 w-4"
                  >
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  Start
                </>
              )}
            </button>

            <button
              onClick={addLap}
              disabled={!isRunning}
              className={`px-4 py-2 rounded ${!isRunning ? 'bg-gray-300 text-gray-500' : 'bg-blue-500 text-white'}`}
            >
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
                className="inline mr-2 h-4 w-4"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Lap
            </button>

            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
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
                className="inline mr-2 h-4 w-4"
              >
                <polyline points="1 4 1 10 7 10"></polyline>
                <polyline points="23 20 23 14 17 14"></polyline>
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
              </svg>
              Reset
            </button>
          </div>
        </div>

        {laps.length > 0 && (
          <div className="bg-white p-4 rounded border">
            <h3 className="text-lg font-medium mb-4 flex items-center">
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
                className="mr-2 h-4 w-4"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Laps
            </h3>

            <div className="h-[200px] overflow-y-auto border rounded-md">
              <div className="space-y-2 p-2">
                {laps.map((lap) => (
                  <div
                    key={lap.id}
                    className="flex justify-between items-center p-2 border-b border-gray-100"
                  >
                    <div className="font-medium">Lap {lap.id}</div>
                    <div className="flex space-x-4">
                      <div className="text-gray-500">
                        <span className="font-mono">{formatTime(lap.diff)}</span>
                      </div>
                      <div className="font-mono">{formatTime(lap.time)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chronometer;