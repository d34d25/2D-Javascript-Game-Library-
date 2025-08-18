import * as scenes from "../game/scene/scene.js";
import { testData } from "../game/scene/sceneData.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const loadedData = scenes.loadSceneData(testData, canvas);

let testLevel = new scenes.Scene(
    {
        player: loadedData.player,
        bodies: loadedData.bodies,
        entities: loadedData.entities,
        gravity: {x:0, y:550},
        canvas: canvas
    }
)

console.log("", testLevel.player.entity.body.rotates);

let lastTime = 0;
let accumulator = 0;
let elapsed = 0;

let fps = 0;
let frames = 0;
let fpsTimer = 0;


function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;
    elapsed += dt;

    frames++;
    fpsTimer += dt;

    if (fpsTimer >= 1) 
    {
        fps = frames;
        frames = 0;
        fpsTimer = 0;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    function customUpdate()
    {
        
    }

    testLevel.update({
        dt,
        customUpdate: customUpdate
    })

    
    function customRender()
    {

    }

    testLevel.player.camera.drawWithCamera({ctx, canvas, drawScene: () => testLevel.render({
        ctx: ctx,
        loadedData: loadedData,
        customDrawing: customRender,
        darkOverlay: true
    })});


    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);