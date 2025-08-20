import {Input} from "../../input/input.js";
import { Camera } from "../../render/camera.js";

export class Player
{
    constructor(entity, canvas)
    {
        this.entity = entity;
        this.input = new Input(canvas);
        this.cameraPos = {x: this.entity.position.x + this.entity.size.w /2, y:this.entity.position.y + this.entity.size.h /2};
        this.camera = new Camera({position: this.cameraPos, scale: 0.9, rotation: 0});
    }

    set cameraScale(value)
    {
        this.camera.scale = value;
    }

    move()
    {
        console.warn("Method move() is meant to be overwritten");
    }

}