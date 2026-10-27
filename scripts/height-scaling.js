
function createImage(imageSrc) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Image load failed'));
        image.src = imageSrc;
    });
}

function getImagePixels(image) {
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', {
        willReadFrequently: true
    });
    context.drawImage(image, 0, 0);
    return {
        canvas,
        pixels: context.getImageData(
            0, 0, canvas.width, canvas.height
        ).data
    };
}

function getVisibleBounds(pixels, width, height) {
    const bounds = {
        minX: width, minY: height, maxX: -1, maxY: -1
    };

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const alpha = pixels[(y * width + x) * 4 + 3];
            if (alpha > 0) updateBounds(bounds, x, y);
        }
    }
    return bounds;
}

function updateBounds(bounds, x, y) {
    bounds.minX = Math.min(bounds.minX, x);
    bounds.minY = Math.min(bounds.minY, y);
    bounds.maxX = Math.max(bounds.maxX, x);
    bounds.maxY = Math.max(bounds.maxY, y);
}

function cropVisibleImage(image, bounds) {
    const width = bounds.maxX - bounds.minX + 1;
    const height = bounds.maxY - bounds.minY + 1;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(
        image, bounds.minX, bounds.minY, width, height,
        0, 0, width, height
    );
    return { src: canvas.toDataURL('image/png'), width, height };
}

async function getVisibleImageBounds(imageSrc) {
    const image = await createImage(imageSrc);
    const { pixels } = getImagePixels(image);
    const bounds = getVisibleBounds(
        pixels, image.naturalWidth, image.naturalHeight
    );
    if (bounds.maxX === -1) throw new Error('Image is transparent');
    return cropVisibleImage(image, bounds);
}