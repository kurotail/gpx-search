import { parseGpxFile, isValidDate } from "./gpx.js";
import { findClosestPointIndex, findNextDateIndex } from "./navigation.js";
import {
    renderFileList,
    renderPoint,
    setStatus,
    setTimeSearchAvailability,
    syncTimeInput
} from "./ui.js";

const state = {
    files: [],
    points: [],
    currentIndex: 0
};

const fileInput = document.getElementById("gpxFile");
const timeInput = document.getElementById("timeInput");

function currentPoint() {
    return state.points[state.currentIndex] ?? null;
}

function selectPoint(index) {
    if (index < 0 || index >= state.points.length) {
        return null;
    }

    state.currentIndex = index;
    syncTimeInput(currentPoint());
    return currentPoint();
}

function showCurrentPoint() {
    renderPoint(currentPoint(), state.currentIndex, state.points.length);
}

function selectClosestPointFromInput() {
    const target = new Date(timeInput.value);
    if (!isValidDate(target)) {
        setStatus("Enter a valid ISO timestamp to search by time.");
        return null;
    }

    const point = currentPoint();
    if (isValidDate(point?.time) && point.time.valueOf() === target.valueOf()) {
        return point;
    }

    const index = findClosestPointIndex(state.points, target);
    if (index === -1) {
        setStatus("This GPX has no timestamps to search.");
        return null;
    }

    return selectPoint(index);
}

async function loadFiles(files) {
    state.files = [];
    state.points = [];
    state.currentIndex = 0;

    if (files.length === 0) {
        renderFileList([]);
        renderPoint(null, 0, 0);
        setStatus("");
        setTimeSearchAvailability([]);
        return;
    }

    const parsedFiles = await Promise.allSettled(files.map(parseGpxFile));
    const errors = [];

    parsedFiles.forEach((result, index) => {
        if (result.status === "fulfilled") {
            state.files.push(result.value);
            state.points.push(...result.value.points);
        } else {
            errors.push(files[index].name);
        }
    });

    state.points.sort((first, second) => {
        if (!isValidDate(first.time) && !isValidDate(second.time)) return 0;
        if (!isValidDate(first.time)) return 1;
        if (!isValidDate(second.time)) return -1;
        return first.time - second.time;
    });

    const firstTimedPoint = state.points.findIndex(({ time }) => isValidDate(time));
    state.currentIndex = firstTimedPoint === -1 ? 0 : firstTimedPoint;

    renderFileList(state.files);
    setTimeSearchAvailability(state.points);
    syncTimeInput(currentPoint());

    const estimatedCount = state.files.reduce((count, file) => count + file.metadataTimeCount, 0);
    if (errors.length > 0) {
        setStatus(`Could not read: ${errors.join(", ")}`);
    } else if (estimatedCount > 0) {
        setStatus("Some point timestamps were estimated from their GPX file metadata.");
    } else if (state.points.length === 0) {
        setStatus("No GPS coordinates were found in the selected files.");
    } else {
        setStatus(`${state.points.length} GPS points loaded.`);
    }
}

fileInput.addEventListener("change", () => loadFiles([...fileInput.files]));

timeInput.addEventListener("change", () => {
    if (selectClosestPointFromInput()) {
        showCurrentPoint();
    }
});

document.getElementById("previousPoint").addEventListener("click", () => {
    selectPoint(state.currentIndex - 1);
    showCurrentPoint();
});

document.getElementById("nextPoint").addEventListener("click", () => {
    selectPoint(state.currentIndex + 1);
    showCurrentPoint();
});

document.getElementById("nextDate").addEventListener("click", () => {
    const nextIndex = findNextDateIndex(state.points, state.currentIndex);
    if (nextIndex === -1) {
        setStatus("No later date is available in the loaded points.");
        return;
    }

    selectPoint(nextIndex);
    showCurrentPoint();
});

document.getElementById("showCoordinate").addEventListener("click", showCurrentPoint);

document.getElementById("showGoogleMap").addEventListener("click", () => {
    const point = currentPoint();
    if (!point) {
        setStatus("Load a GPX file before opening a map.");
        return;
    }

    window.open(`https://www.google.com/maps?q=${point.lat},${point.lon}`, "_blank");
});

setTimeSearchAvailability([]);
