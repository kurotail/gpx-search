import { isValidDate } from "./gpx.js";

export function findClosestPointIndex(points, target) {
    if (!isValidDate(target)) {
        return -1;
    }

    let closestIndex = -1;
    let smallestDifference = Number.POSITIVE_INFINITY;

    points.forEach((point, index) => {
        if (!isValidDate(point.time)) {
            return;
        }

        const difference = Math.abs(point.time - target);
        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestIndex = index;
        }
    });

    return closestIndex;
}

export function findNextDateIndex(points, currentIndex) {
    const currentTime = points[currentIndex]?.time;
    if (!isValidDate(currentTime)) {
        return -1;
    }

    const currentDate = currentTime.toISOString().slice(0, 10);
    for (let index = currentIndex + 1; index < points.length; index += 1) {
        const time = points[index].time;
        if (isValidDate(time) && time.toISOString().slice(0, 10) !== currentDate) {
            return index;
        }
    }

    return -1;
}
