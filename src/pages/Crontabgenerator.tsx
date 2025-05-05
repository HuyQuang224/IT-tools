"use client"

import { useState, useEffect, useCallback } from 'react';
import { Copy, RefreshCw, Clock } from 'lucide-react';

const CrontabGeneratorTool = () => {
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("0");
  const [dayOfMonth, setDayOfMonth] = useState("*");
  const [month, setMonth] = useState("*");
  const [dayOfWeek, setDayOfWeek] = useState("*");
  const [command, setCommand] = useState('echo "Hello World"');
  const [expression, setExpression] = useState('0 0 * * * echo "Hello World"');
  const [expressionInput, setExpressionInput] = useState("");
  const [humanReadable, setHumanReadable] = useState("");
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"builder" | "parser">("builder");
  const [toolName, setToolName] = useState("");
  const [description, setDescription] = useState("");

  // Predefined schedules
  const predefinedSchedules = [
    { name: "Every minute", value: "* * * * *" },
    { name: "Every hour", value: "0 * * * *" },
    { name: "Every day at midnight", value: "0 0 * * *" },
    { name: "Every day at noon", value: "0 12 * * *" },
    { name: "Every Monday", value: "0 0 * * 1" },
    { name: "Every weekday", value: "0 0 * * 1-5" },
    { name: "Every weekend", value: "0 0 * * 0,6" },
    { name: "Every month (1st day)", value: "0 0 1 * *" },
    { name: "Every quarter", value: "0 0 1 1,4,7,10 *" },
    { name: "Every 6 months", value: "0 0 1 1,7 *" },
    { name: "Every year (January 1st)", value: "0 0 1 1 *" },
  ];

  useEffect(() => {
    const fetchToolDetails = async () => {
      try {
        const response = await fetch('/api/tool-details?name=Crontab Generator');
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

  const generateHumanReadable = useCallback((expr: string) => {
    try {
      const parts = expr.trim().split(/\s+/);
      if (parts.length < 5) {
        throw new Error("Invalid cron expression format");
      }

      const [min, hr, dom, mon, dow] = parts;

      let description = "Runs ";

      // Minutes
      if (min === "*") {
        description += "every minute";
      } else if (min.includes("/")) {
        const [, step] = min.split("/");
        description += `every ${step} minute(s)`;
      } else if (min.includes(",")) {
        description += `at minute(s) ${min}`;
      } else {
        description += `at minute ${min}`;
      }

      // Hours
      if (hr === "*") {
        description += " of every hour";
      } else if (hr.includes("/")) {
        const [, step] = hr.split("/");
        description += ` of every ${step} hour(s)`;
      } else if (hr.includes(",")) {
        description += ` during hour(s) ${hr}`;
      } else {
        description += ` during hour ${hr}`;
      }

      // Day of month
      if (dom !== "*") {
        if (dom.includes(",")) {
          description += ` on day(s) of month ${dom}`;
        } else if (dom.includes("-")) {
          description += ` on days ${dom} of the month`;
        } else {
          description += ` on day ${dom} of the month`;
        }
      }

      // Month
      if (mon !== "*") {
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        if (mon.includes(",")) {
          const months = mon.split(",").map((m) => {
            const num = Number.parseInt(m, 10);
            return isNaN(num) ? m : monthNames[num - 1];
          });
          description += ` in ${months.join(", ")}`;
        } else if (mon.includes("-")) {
          const [start, end] = mon.split("-");
          const startMonth = Number.parseInt(start, 10);
          const endMonth = Number.parseInt(end, 10);
          description += ` from ${monthNames[startMonth - 1]} to ${monthNames[endMonth - 1]}`;
        } else {
          const monthNum = Number.parseInt(mon, 10);
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            description += ` in ${monthNames[monthNum - 1]}`;
          } else {
            description += ` in month ${mon}`;
          }
        }
      }

      // Day of week
      if (dow !== "*") {
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        if (dow === "1-5") {
          description += " on weekdays";
        } else if (dow === "0,6") {
          description += " on weekends";
        } else if (dow.includes(",")) {
          const days = dow.split(",").map((d) => {
            const num = Number.parseInt(d, 10);
            return isNaN(num) ? d : dayNames[num];
          });
          description += ` on ${days.join(", ")}`;
        } else if (dow.includes("-")) {
          const [start, end] = dow.split("-");
          const startDay = Number.parseInt(start, 10);
          const endDay = Number.parseInt(end, 10);
          description += ` from ${dayNames[startDay]} to ${dayNames[endDay]}`;
        } else {
          const dayNum = Number.parseInt(dow, 10);
          if (!isNaN(dayNum) && dayNum >= 0 && dayNum <= 6) {
            description += ` on ${dayNames[dayNum]}`;
          } else {
            description += ` on day ${dow} of the week`;
          }
        }
      }

      setHumanReadable(description);
    } catch (error) {
      setHumanReadable("Could not parse cron expression");
    }
  }, []);

  const calculateNextExecutions = useCallback((expr: string) => {
    setNextExecutions([
      "Next execution times would be calculated here",
      "For accurate calculations, use a cron parser library",
      "or a system command like 'cronexp'",
    ]);
  }, []);

  const generateExpression = useCallback(() => {
    const expr = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek} ${command}`;
    setExpression(expr);
    generateHumanReadable(expr);
    calculateNextExecutions(expr);
  }, [minute, hour, dayOfMonth, month, dayOfWeek, command, generateHumanReadable, calculateNextExecutions]);

  const parseExpression = useCallback(() => {
    if (!expressionInput) return;

    try {
      const parts = expressionInput.trim().split(/\s+/);
      if (parts.length < 5) {
        throw new Error("Invalid cron expression format");
      }

      const cronParts = parts.slice(0, 5);
      const cmdParts = parts.slice(5);

      setMinute(cronParts[0]);
      setHour(cronParts[1]);
      setDayOfMonth(cronParts[2]);
      setMonth(cronParts[3]);
      setDayOfWeek(cronParts[4]);
      setCommand(cmdParts.join(" "));

      setExpression(expressionInput);
      generateHumanReadable(expressionInput);
      calculateNextExecutions(expressionInput);
    } catch (error) {
      setHumanReadable("Invalid cron expression");
      setNextExecutions([]);
    }
  }, [expressionInput, generateHumanReadable, calculateNextExecutions]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const usePredefinedSchedule = useCallback((schedule: string) => {
    const parts = schedule.split(" ");
    setMinute(parts[0]);
    setHour(parts[1]);
    setDayOfMonth(parts[2]);
    setMonth(parts[3]);
    setDayOfWeek(parts[4]);
    generateExpression();
  }, [generateExpression]);

  useEffect(() => {
    if (activeTab === "builder") {
      generateExpression();
    }
  }, [activeTab, generateExpression]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">{toolName}</h1>
      <p className="text-gray-700 mb-6">{description}</p>
      
      <div className="bg-gray-100 p-4 rounded shadow">
        <div className="flex space-x-4 mb-4">
          <button
            className={`px-4 py-2 rounded ${activeTab === "builder" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("builder")}
          >
            Cron Builder
          </button>
          <button
            className={`px-4 py-2 rounded ${activeTab === "parser" ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setActiveTab("parser")}
          >
            Cron Parser
          </button>
        </div>

        {activeTab === "builder" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Minute (0-59)</label>
                <input
                  type="text"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="e.g. 0, */5, 1,15,30"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Hour (0-23)</label>
                <input
                  type="text"
                  value={hour}
                  onChange={(e) => setHour(e.target.value)}
                  placeholder="e.g. *, */2, 9-17"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Day of Month (1-31)</label>
                <input
                  type="text"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  placeholder="e.g. *, 1, 15-20"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Month (1-12)</label>
                <input
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  placeholder="e.g. *, 1,6, 1-3"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Day of Week (0-6, 0=Sunday)</label>
                <input
                  type="text"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  placeholder="e.g. *, 1-5, 0,6"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block mb-2">Command</label>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="e.g. /path/to/script.sh"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2">Predefined Schedules</label>
              <select
                onChange={(e) => usePredefinedSchedule(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a predefined schedule</option>
                {predefinedSchedules.map((schedule) => (
                  <option key={schedule.value} value={schedule.value}>
                    {schedule.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={generateExpression}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate Cron Expression
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Cron Expression</label>
              <input
                type="text"
                value={expressionInput}
                onChange={(e) => setExpressionInput(e.target.value)}
                placeholder="e.g. 0 0 * * * /path/to/script.sh"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={parseExpression}
              disabled={!expressionInput.trim()}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center justify-center disabled:bg-gray-400"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Parse Cron Expression
            </button>
          </div>
        )}

        {expression && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Cron Expression
                </label>
                <button
                  onClick={() => copyToClipboard(expression)}
                  className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </button>
              </div>
              <div className="p-3 bg-gray-50 rounded font-mono text-sm overflow-x-auto">
                {expression}
              </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <label className="block mb-2">Human Readable</label>
              <p className="p-3 bg-gray-50 rounded">{humanReadable}</p>
            </div>

            <div className="bg-white p-4 rounded shadow">
              <label className="block mb-2">Next Executions</label>
              <div className="space-y-2">
                {nextExecutions.map((exec, index) => (
                  <p key={index} className="p-2 bg-gray-50 rounded text-sm">
                    {exec}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrontabGeneratorTool;