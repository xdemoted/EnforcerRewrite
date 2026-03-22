export class OverlayUpdate {
    constructor(
        public overlayId: string,
        public team1: number,
        public team2: number,
        public round: number = 1
    ) {}
}