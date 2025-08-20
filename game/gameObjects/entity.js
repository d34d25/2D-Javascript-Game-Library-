import{createBodyBox, createBodyCircle, createBodyTriangle} from "../../physics engine/rigidbody.js";
import {drawPolygon, drawCircle, drawPolygonOutline, drawCircleOutline} from "../../render/basicDrawing.js";
import {loadImageLazy, cropImage, playAnimation} from "../../render/imageDrawing.js";
import {CircularLight, ConeLight} from "../../render/light.js";

export class Entity
{
    constructor({
        position = {x:0, y:0}, 
        size = {w:10,h:10}, 
        radius = 20, 
        drawBody = true,
        drawEntityImage = true, 
        color = {r:255,g:0,b:0}, 
        imagePath = "",
        spriteSheetPath = "", 
        frameW = 10, 
        frameH = 10})
    {

        this.position = position;
        this.size = size;
        this.radius = radius;

        this.body = null;
        this.drawBody = drawBody;
        this.drawEntityImage = drawEntityImage;
        this.color = color;

        this.image = null;

        this.spriteSheet = null;
        this.sprites = [];
        this.currentSprite = null;

        if(imagePath != null && imagePath !== "")
        {
            this.image = loadImageLazy(imagePath);
        }

        if(spriteSheetPath != null && spriteSheetPath !== "")
        {
            this.spriteSheet = loadImageLazy(spriteSheetPath);
        }

        if(this.spriteSheet !== null)
        {
            this.spriteSheet.onLoad(() => {
                this.sprites = cropImage(this.spriteSheet, frameW, frameH);
            })
        }

        this.lights = [];
        this.tags = [];
    }

    createBox({
        density = 1, 
        bounciness = 0.3, 
        hasGravity = true, 
        linearDamping = {x:0,y:0}, 
        angularDamping = 0, 
        staticFriction = 0.6, 
        dynamicFriction = 0.4, 
        isStatic = false, 
        hasRotations = true,
        infMass = false, 
        angle = 0})
    {
        this.body = createBodyBox({
            position: this.position, 
            size: this.size, 
            density, 
            restitution: 
            bounciness, 
            affectedByGravity: 
            hasGravity, 
            linearDamping, 
            angularDamping,
            staticFriction, 
            dynamicFriction, 
            isStatic, 
            noRotation: !hasRotations});
        this.body.setAngle(angle);
        if(infMass) this.body.mass = Infinity;
    }

    createCircle({
        density = 1, 
        bounciness = 0.3,
        hasGravity = true, 
        linearDamping = {x:0,y:0}, 
        angularDamping = 0, 
        staticFriction = 0.6, 
        dynamicFriction = 0.4, 
        isStatic = false, 
        hasRotations = true,
        infMass = false,
        angle = 0})
    {
        this.body = createBodyCircle({
            position: this.position, 
            radius: this.radius, 
            density, restitution: 
            bounciness, 
            affectedByGravity: hasGravity, 
            linearDamping, angularDamping,
            staticFriction, dynamicFriction, 
            isStatic, 
            noRotation: !hasRotations});
        this.body.setAngle(angle);
        if(infMass) this.body.mass = Infinity;
    }

    createTriangle({
        density = 1, 
        bounciness = 0.3, 
        hasGravity = true, 
        linearDamping = {x:0,y:0}, 
        angularDamping = 0, 
        staticFriction = 0.6, 
        dynamicFriction = 0.4, 
        isStatic = false, 
        hasRotations = true, 
        infMass = false,
        angle = 0})
    {
        this.body = createBodyTriangle({
            position: this.position, 
            size: this.size, 
            density, restitution: bounciness, 
            affectedByGravity: hasGravity, 
            linearDamping, angularDamping,
            staticFriction, dynamicFriction, 
            isStatic, 
            noRotation: !hasRotations});
        this.body.setAngle(angle);
        if(infMass) this.body.mass = Infinity;
    }

    addTag(tag)
    {
        this.tags.push(tag);
    }


    addCircularLight({position = {x:0, y:0}, radius = 10, intensity = 1, color = { r: 255, g: 255, b: 255}, alpha = 0.2})
    {
        this.lights.push(new CircularLight({position, radius, intensity, color, alpha}));
    }

    addConeLight({position = { x: 0, y: 0 },angle = 0,spread = 6,length = 100,intensity = 1,color = { r: 255, g: 200, b: 100 }, alpha = 0.2}) 
    {
        this.lights.push(new ConeLight({position, angle, spread, length, intensity, color, alpha}));
    }

    drawRigidbodyFull(ctx, color, alpha)
    {
        if(this.body === null) return;
        
        if(!this.body.isCircle)
        {
            drawPolygon({ctx, vertices: this.body.transformedVertices, fillStyle: color, alpha});
        }
        else
        {
            drawCircle({ctx, point: this.body.position, color, radius: this.body.radius, rotation: this.body.angle, rotationIndicator: true, alpha});
        }
        
    }

    drawRigidbodyOutline({ctx, color, thickness = 2,alpha = 1})
    {
        if(this.body === null) return;

        if(!this.body.isCircle)
        {
            drawPolygonOutline({ctx, vertices: this.body.transformedVertices, strokeStyle: color, alpha, lineWidth: thickness});
        }
        else
        {
            drawCircleOutline({ctx, point: this.body.position, color, radius: this.body.radius, rotation: this.body.angle, rotationIndicator: true, alpha});
        }
    }

    drawImage({ctx, scaleX = 1, scaleY = 1, alpha = 1, flipX = false, flipY = false})
    {
        if(this.image === null || !this.image.loaded) return;
        const rotation = this.body ? this.body.angle : 0;
        this.image.draw({ctx,x:  this.position.x - this.size.w /2 - 1, y: this.position.y - this.size.h /2 - 1,scaleX,scaleY, rotationRadians: rotation, flipHorizontally: flipX, flipVertically: flipY, alpha});
    }

    drawSprite({ctx,startFrame, endFrame, animationSpeed, elapsedTime, scaleX = 1, scaleY = 1, alpha = 1, flipX = false, flipY = false})
    {
        if(this.sprites == []) return;
        this.currentSprite = playAnimation({
            spriteArray: this.sprites,
            startFrame,
            endFrame,
            animationSpeed,
            elapsedTime
        });

        if(this.currentSprite !== null)
        {
            this.currentSprite.draw({ctx, dx: this.position.x, dy: this.position.y, scaleX, scaleY, alpha, flipHorizontally: flipX, flipVertically: flipY});
        }
    }
    
}

export function howToCenterTheCamera()
{
    return "(position + size /2) - canvas size / 2 / camera scale";
}

export function centerCameraOnEntity(camera, entity, canvas, offset = {x: 0, y: 0}) 
{
    const centerX = entity.position.x + entity.size.w / 2 + offset.x;
    const centerY = entity.position.y + entity.size.h / 2 + offset.y;

    camera.position = {
        x: centerX - canvas.width / 2 / camera.scale,
        y: centerY - canvas.height / 2 / camera.scale
    };
    
}


