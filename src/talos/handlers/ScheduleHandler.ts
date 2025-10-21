class Schedule {
    objects: ScheduleObject[];
    forcedExlusions: timeRange[];

    constructor() {
        this.objects = [];
        this.forcedExlusions = [];
    }

    addObject(id: string): ScheduleObject {
        const obj = new ScheduleObject(id);
        this.objects.push(obj);
        return obj;
    }

    addForcedExclusion(start: number, end: number) {
        this.forcedExlusions.push({ start, end });
    }
}

class ScheduleObject {
    id: string;
    inclusions: timeRange[];
    exclusions: timeRange[];

    constructor(id: string) {
        this.id = id;
        this.inclusions = [];
        this.exclusions = [];
    }

    addInclusion(start: number, end: number) {
        this.inclusions.push({ start, end });
    }

    addExclusion(start: number, end: number) {
        this.exclusions.push({ start, end });
    }
}

interface timeRange {
    start: number;
    end: number;
}