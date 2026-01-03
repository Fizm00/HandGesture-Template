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

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, height / 2);

        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        const validPixels: { x: number, y: number }[] = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                if (data[i] > 128) {
                    validPixels.push({ x, y });
                }
            }
        }

        if (validPixels.length === 0) return [];

        for (let i = 0; i < count; i++) {
            const pixel = validPixels[Math.floor(Math.random() * validPixels.length)];
            const x = (pixel.x / width - 0.5) * 15;
            const y = -(pixel.y / height - 0.5) * 8;
            const z = (Math.random() - 0.5) * 1.0;

            positions.push({ x, y, z });
        }

        return positions;
    }
}
