import { Player } from "../game/gameObjects/player.js";

export class MyPlayer extends Player
{
    constructor(entity, canvas)
    {
       super(entity, canvas);
    }

    move({speed = 200 * 10, jump = 500 * 100, MAX_SPEED = 150} = {})
    {
        const INPUT = this.input;

        let speedX = 0, speedY = 0;

        if(INPUT.isKeyDown('KeyA')) speedX = -speed;
        else if(INPUT.isKeyDown('KeyD')) speedX = speed;

        if(INPUT.isKeyDown('KeyW')) speedY = -speed;
        else if(INPUT.isKeyDown('KeyS')) speedY = speed;

        
        if(INPUT.isKeyPressed('Space')) speedY = -jump;

        this.entity.body.addForce({x:speedX,y:speedY});

        let vx = this.entity.body.linearVelocity.x;
        let vy = this.entity.body.linearVelocity.y;

        if (vx > MAX_SPEED) vx = MAX_SPEED;
        if (vx < -MAX_SPEED) vx = -MAX_SPEED;

        if (vy > MAX_SPEED) vy = MAX_SPEED;
        if (vy < -MAX_SPEED) vy = -MAX_SPEED;

        this.entity.body.linearVelocity.x = vx;
        //this.entity.body.linearVelocity.y = vy;

        INPUT.update();
    }

}



/*
this.entity.body.linearVelocity.x = -speed;
else this.entity.body.linearVelocity.x = 0;
//this.entity.body.linearVelocity.y = -jump;



   move()
    {
        console.alert("Method move() must be overriden");
    }



 

*/