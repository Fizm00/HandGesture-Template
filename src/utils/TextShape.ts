interface Position {
    x: number;
    y: number;
    z: number;
}

export class TextShape {
    static generatePositions(text: string, count: number): Position[] {
        const positions: Position[] = [];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return [];

        const width = 200;
        const height = 100;
        canvas.width = width;
        canvas.height = height;

        // Draw text
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px Arial'; // Simplified font choice for reliability
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const validPixels: { x: number, y: number }[] = [];

        // Scan for white pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                if (data[i] > 128) { // Red channel > 128 (Whiteish)
                    validPixels.push({ x, y });
                }
            }
        }

        if (validPixels.length === 0) return [];

        // Sample pixels to match particle count
        for (let i = 0; i < count; i++) {
            const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];

            // Map 2D pixel to 3D space
            // Canvas coords: 0,0 is top-left. 3D: 0,0 is center.
            const x = (pixel.x / width - 0.5) * 15; // Scale to scene width
            const y = -(pixel.y / height - 0.5) * 8; // Scale and invert Y
            const z = (Math.random() - 0.5) * 1.0; // Minimal depth

            positions.push({ x, y, z });
        }

        return positions;
    }
}
