import * as faceapi from 'face-api.js';

export class SmoothingService {
    private bufferSize: number;
    private history: faceapi.FaceExpressions[];

    constructor(bufferSize: number = 5) {
        this.bufferSize = bufferSize;
        this.history = [];
    }

    add(expressions: faceapi.FaceExpressions): faceapi.FaceExpressions {
        this.history.push(expressions);
        if (this.history.length > this.bufferSize) {
            this.history.shift();
        }
        return this.calculateAverage();
    }

    private calculateAverage(): faceapi.FaceExpressions {
        if (this.history.length === 0) return {} as faceapi.FaceExpressions;

        const sums: Record<string, number> = {};
        const keys = Object.keys(this.history[0]) as (keyof faceapi.FaceExpressions)[];

        // Initialize sums
        keys.forEach(key => sums[key] = 0);

        // Sum up
        this.history.forEach(expr => {
            keys.forEach(key => {
                const val = expr[key];
                if (typeof val === 'number') {
                    sums[key] += val;
                }
            });
        });

        // Average
        const result = {} as faceapi.FaceExpressions;
        keys.forEach(key => {
            // @ts-ignore - faceapi types are a bit strict/loose here
            result[key] = sums[key] / this.history.length;
        });

        return result;
    }

    reset() {
        this.history = [];
    }
}
