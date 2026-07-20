const isValidDate = (value) =>
    value instanceof Date && !Number.isNaN(value.valueOf());

export function readFileAsText(file) {
    if (typeof file.text === "function") {
        return file.text();
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function getMetadataTime(gpx) {
    const time = new Date(gpx.metadata?.time);
    return Number.isNaN(time.valueOf()) ? null : time;
}

export async function parseGpxFile(file) {
    const source = await readFileAsText(file);
    const gpx = new window.GPXParser();
    gpx.parse(source);

    const metadataTime = getMetadataTime(gpx);
    const points = gpx.tracks.flatMap((track) =>
        track.points
            .filter(({ lat, lon }) => Number.isFinite(lat) && Number.isFinite(lon))
            .map((point) => {
                const hasTrackPointTime = isValidDate(point.time);
                const time = hasTrackPointTime ? point.time : metadataTime;

                return {
                    ...point,
                    fileName: file.name,
                    time,
                    timeSource: hasTrackPointTime
                        ? "trackpoint"
                        : metadataTime
                            ? "metadata"
                            : "missing"
                };
            })
    );

    return {
        fileName: file.name,
        points,
        hasMetadataTime: metadataTime !== null,
        trackPointTimeCount: points.filter(({ timeSource }) => timeSource === "trackpoint").length,
        metadataTimeCount: points.filter(({ timeSource }) => timeSource === "metadata").length
    };
}

export { isValidDate };
