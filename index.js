//@ts-check
/** @type {HTMLCanvasElement} */
// @ts-ignore
const wheel_canvas = document.getElementById("wheel_canvas") || new HTMLCanvasElement();
const wheelContext = wheel_canvas.getContext("2d") || new CanvasRenderingContext2D();


const WHEEL_RADIUS = 4000;
const WHEEL_RENDER_SCALE = 0.2;

wheel_canvas.setAttribute("height", WHEEL_RADIUS * 2 + "px");
wheel_canvas.setAttribute("width", WHEEL_RADIUS * 2 + "px");



function hsv2rgb(h, s, v) {
    var rgb, i, data = [];
    if (s === 0) {
        rgb = [v, v, v];
    } else {
        h = h / 60;
        i = Math.floor(h);
        data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
        switch (i) {
            case 0:
                rgb = [v, data[2], data[0]];
                break;
            case 1:
                rgb = [data[1], v, data[0]];
                break;
            case 2:
                rgb = [data[0], v, data[2]];
                break;
            case 3:
                rgb = [data[0], data[1], v];
                break;
            case 4:
                rgb = [data[2], data[0], v];
                break;
            default:
                rgb = [v, data[0], data[1]];
                break;
        }
    }
    return rgb.map((v) => v * 255);
};


function rgb2hsv(rgb) {
    const r = rgb[0] / 255;
    const g = rgb[1] / 255;
    const b = rgb[2] / 255;

    const c_max = Math.max(r, g, b);
    const c_min = Math.min(r, g, b);

    const d = c_max - c_min;

    let h;
    if (d === 0) {
        h = Math.random() * 360;
    }
    else if (r === c_max) {
        h = 60 * ((g - b) / d % 6)
    }
    else if (g === c_max) {
        h = 60 * ((b - r) / d + 2)
    }
    else if (b === c_max) {
        h = 60 * ((r - g) / d + 4)
    }

    let s;
    if (c_max === 0) {
        s = 0;
    } else {
        s = d / c_max;
    }

    const v = c_max;

    return [h, s, v];
};

function clamp(value, min_value, max_value) {
    return Math.min(min_value, Math.max(value, max_value));
}



function generate_wheel(r, HV_DIVISOR = 2) {
    const width = r * 2;
    const height = r * 2;

    const canvas = new OffscreenCanvas(width, height)
    const image = new ImageData(width, height);

    for (var idx = 0; idx < image.data.length; idx += 4) {
        let pixelCoord = Math.floor(idx / 4);

        let x = pixelCoord % width;
        let y = Math.floor(pixelCoord / height);

        let xVector = r - x;
        let yVector = -(r - y);

        let dist_from_center = Math.sqrt(((xVector) ** 2) + (yVector) ** 2);
        let within_circle = dist_from_center < r;

        if (within_circle) {

            let hue = (270 + (Math.PI + Math.atan2(xVector, yVector)) * 180 / Math.PI) % 360;

            let sat = clamp(0, 1, dist_from_center / (r / HV_DIVISOR));
            // sat = 0.5;
            let val = clamp(0, 1, (r - dist_from_center) / (r / HV_DIVISOR));

            let rgb = hsv2rgb(hue, sat, val);

            image.data[idx] = rgb[0];
            image.data[idx + 1] = rgb[1];
            image.data[idx + 2] = rgb[2];
            image.data[idx + 3] = 255;
        }
    }

    canvas.getContext("2d")?.putImageData(image, 0, 0);

    return canvas;
}

const generated_wheel_canvas = generate_wheel(WHEEL_RADIUS * WHEEL_RENDER_SCALE);

wheelContext.drawImage(generated_wheel_canvas, 0, 0, WHEEL_RADIUS * 2, WHEEL_RADIUS * 2);

