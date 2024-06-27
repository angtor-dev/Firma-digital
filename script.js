//======================================================================
// VARIABLES
//======================================================================
const canvas = document.querySelector('#canvas');
const lines = [];
const ongoingTouches = [];
let lastX, lastY;
let isDrawing = false;

let canvasPosition = canvas.getBoundingClientRect()
let offsetX = canvasPosition.x;
let offsetY = canvasPosition.y;

canvas.width = 500;
canvas.height = 500;
const lineColor = '#000';
const lineWidth = 3


//======================================================================
// FUNCIONES
//======================================================================

/** Empieza a dibujar una linea */
function handleMouseDown(evt) {
    isDrawing = true;
    lastX = evt.offsetX;
    lastY = evt.offsetY;
    lines.push([]);
    saveLinePoint(lastX, lastY);

    let ctx = canvas.getContext('2d')
    ctx.beginPath();
    ctx.arc(lastX, lastY, lineWidth / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = lineColor;
    ctx.fill();
};

/** Dibuja el segmento de la linea */
function handleMouseMove(evt) {
    if (isDrawing) {
        let ctx = canvas.getContext('2d')
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = lineColor;

        saveLinePoint(evt.offsetX, evt.offsetY);
        ctx.beginPath(evt.offsetY);
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(evt.offsetX, evt.offsetY);
        ctx.stroke();

        lastX = evt.offsetX;
        lastY = evt.offsetY;
    }
}

/** Deja de dibujar la linea */
function handleMouseUp(evt) {
    isDrawing = false;
    saveLinePoint(evt.offsetX, evt.offsetY);
}

/** Empieza a dibujar (pantallas tactiles) */
function handleTouchStart(evt) {
    evt.preventDefault();
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
        ctx.beginPath();
        ctx.arc(touches[i].pageX - offsetX, touches[i].pageY - offsetY,
            lineWidth / 2, 0, 2 * Math.PI, false);
        ctx.fillStyle = lineColor;
        ctx.fill();
    }
}

/** Dibuja los segmentos de cada toque */
function handleTouchMove(evt) {
    evt.preventDefault();
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        const ti = ongoingTouchIndexById(touches[i].identifier);

        if (ti >= 0) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = lineColor;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[ti].pageX - offsetX, ongoingTouches[ti].pageY - offsetY);
            ctx.lineTo(touches[i].pageX - offsetX, touches[i].pageY - offsetY);
            ctx.stroke();

            ongoingTouches.splice(ti, 1, copyTouch(touches[i]));
        } else {
            console.warn("No se pudo detectar que toque continuar", touches[i]);
        }
    }
}

/** Dibuja el ultimo segmento de linea */
function handleTouchEnd(evt) {
    evt.preventDefault();
    const el = document.getElementById("canvas");
    const ctx = el.getContext("2d");
    const touches = evt.changedTouches;

    for (let i = 0; i < touches.length; i++) {
        let ti = ongoingTouchIndexById(touches[i].identifier);

        if (ti >= 0) {
            ctx.lineWidth = lineWidth;
            ctx.fillStyle = lineColor;
            ctx.lineJoin = ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(ongoingTouches[ti].pageX - offsetX, ongoingTouches[ti].pageY - offsetY);
            ctx.lineTo(touches[i].pageX - offsetX, touches[i].pageY - offsetY);
            ctx.arc(touches[i].pageX - offsetX, touches[i].pageY - offsetY,
                lineWidth / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = lineColor;
            ctx.fill();

            ongoingTouches.splice(ti, 1);
        } else {
            console.warn("No se pudo detectar que toque terminar", touches[i]);
        }
    }
}

/** Guarda la posicion de un segmento de linea */
function saveLinePoint(x, y) {
    lines[lines.length - 1].push({
        x: x,
        y: y
    });
}

/** retorna solo la informacion necesaria de un toque */
function copyTouch({ identifier, pageX, pageY }) {
    return { identifier, pageX, pageY };
}

/** Retorna el indice de un toque activo segun su id */
function ongoingTouchIndexById(idToFind) {
    for (let i = 0; i < ongoingTouches.length; i++) {
        const id = ongoingTouches[i].identifier;

        if (id === idToFind) {
            return i;
        }
    }
    return -1;
}

//======================================================================
// EVENTOS
//======================================================================

// Eventos raton
canvas.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener('mousemove', handleMouseMove, false);
canvas.addEventListener('mouseup', handleMouseUp, false);

// Eventos pantallas táctiles
canvas.addEventListener('touchstart', handleTouchStart, false);
canvas.addEventListener('touchmove', handleTouchMove, false);
canvas.addEventListener('touchend', handleTouchEnd, false);

const saveButton = document.getElementById('saveButton');
saveButton.addEventListener('click', () => {
    const dataURL = canvas.toDataURL('image/png');
    
    const link = document.createElement('a');
    link.download = 'dibujo.png';
    link.href = dataURL;
    link.click();
});