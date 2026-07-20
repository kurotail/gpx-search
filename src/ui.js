import { isValidDate } from "./gpx.js";

export function renderFileList(files) {
    const fileList = document.getElementById("fileList");
    fileList.replaceChildren();

    files.forEach((file) => {
        const item = document.createElement("li");
        let timeStatus = "timestamps unavailable";

        if (file.trackPointTimeCount > 0) {
            timeStatus = "recorded timestamps";
        } else if (file.metadataTimeCount > 0) {
            timeStatus = "timestamps estimated from metadata";
        }

        item.textContent = `${file.fileName}: ${file.points.length} GPS points — ${timeStatus}`;
        fileList.appendChild(item);
    });
}

export function setStatus(message) {
    document.getElementById("status").textContent = message;
}

export function syncTimeInput(point) {
    const input = document.getElementById("timeInput");
    input.value = isValidDate(point?.time) ? point.time.toISOString() : "";
}

export function setTimeSearchAvailability(points) {
    const hasTimestamps = points.some(({ time }) => isValidDate(time));
    document.getElementById("timeInput").disabled = !hasTimestamps;
    document.getElementById("nextDate").disabled = !hasTimestamps;
}

export function renderPoint(point, index, pointCount) {
    const result = document.getElementById("result");
    result.replaceChildren();

    if (!point) {
        return;
    }

    const details = [
        ["File", point.fileName],
        ["Point", `${index + 1} of ${pointCount}`],
        ["Latitude", point.lat],
        ["Longitude", point.lon],
        ["Elevation", point.ele ?? "Not recorded"],
        [
            "Time",
            isValidDate(point.time)
                ? `${point.time.toISOString()}${point.timeSource === "metadata" ? " (estimated from file metadata)" : ""}`
                : "Not recorded"
        ]
    ];

    details.forEach(([label, value]) => {
        const line = document.createElement("div");
        const labelElement = document.createElement("strong");
        labelElement.textContent = `${label}: `;
        line.append(labelElement, String(value));
        result.appendChild(line);
    });
}
