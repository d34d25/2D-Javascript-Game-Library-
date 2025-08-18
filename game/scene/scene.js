import{PhysWorld} from "../../physics engine/physics.js"
import{createBodyBox, createBodyCircle, createBodyTriangle} from "../../physics engine/rigidbody.js";
import {Entity, centerCameraOnEntity } from "../gameObjects/entity.js";
import { Player } from "../../testing/player.js";
import {drawPolygon, drawCircle, drawPolygonOutline, drawCircleOutline} from "../../render/basicDrawing.js";
import {setDarkOverlayUnified} from "../../render/light.js";

export class Scene
{

    constructor({canvas, player,entities = [] ,bodies = [], gravity = {x:0, y:150}})
    {
        this.canvas = canvas;
        this.player = player;
        this.entities = entities;
        this.bodies = bodies;
        this.gravity = gravity;

        const entityBodies = entities
        .filter(entity => entity.body)    // Only entities that have a body
        .map(entity => entity.body);      // Get the body from each entity

        this.allBodies = [...entityBodies, ...bodies];
        
        this.physWorld = new PhysWorld(this.allBodies, this.gravity);
    }


    update({
        dt, 
        useRotations = true, 
        iterations = 20, 
        directionalFriction = true, 
        angleTolerance = 0.75,
        customUpdate
    })
    {
        if(this.player)
        {
            this.player.move(dt);

            if(this.player.camera) centerCameraOnEntity(this.player.camera, this.player.entity, this.canvas);
        }

        customUpdate();

        this.physWorld.step({
            dt, 
            useRotations, 
            iterations, 
            directionalFriction, 
            angleTolerance
        });
    }
    

    render({
        ctx,
        loadedData,
        drawHitboxes = false, 
        darkOverlay = false, 
        overlayXstart = -500, 
        overlayYstart = -500,
        overlayWidth,
        overlayHeight,
        coloredLights = true,
        customDrawing
    })
    {
        overlayWidth = overlayWidth ?? this.canvas.width * 4;
        overlayHeight = overlayHeight ?? this.canvas.height * 4;

        customDrawing();

        for(let i = 0; i < this.bodies.length; i++)
        {
            const currentBody = this.bodies[i];
    
            if(!currentBody.isCircle)
            {
                drawPolygon({
                    ctx,
                    vertices: currentBody.transformedVertices,
                    fillStyle: loadedData.bodyColors[i],
                    alpha: 1
                })
            }
            else
            {
                drawCircle({
                    ctx,
                    point: currentBody.position,
                    color: loadedData.bodyColors[i],
                    radius: currentBody.radius,
                    rotationIndicator: false
                })
            }
    
        }
        
        for(let i = 0; i < this.entities.length; i++)
        {
            
            const currentEntity = this.entities[i];
    
            if(!currentEntity.drawBody)
            {
                if(currentEntity.drawEntityImage)
                {
                    currentEntity.drawImage({ctx});
                }
            }
            else
            {
    
                if(!currentEntity.body.isCircle)
                {
                    drawPolygon({
                        ctx,
                        vertices: currentEntity.body.transformedVertices,
                        fillStyle: currentEntity.color,
                        alpha: 1
                    })
                }
                else
                {
                    drawCircle({
                        ctx,
                        point: currentEntity.body.position,
                        color: currentEntity.color,
                        radius: currentEntity.body.radius,
                        rotationIndicator: false
                    })
                }
            }
        }
    
        if(darkOverlay)
        {
            setDarkOverlayUnified({
                ctx,
                x: overlayXstart,
                y: overlayYstart,
                width: overlayWidth,
                height: overlayHeight,
                lights: loadedData.lights,
                hasColor: coloredLights
            })
        }
    
        if(drawHitboxes)
        {
            for(let i = 0; i < this.allBodies.length; i++)
            {
                const currentBody = this.allBodies[i];
    
                if(!currentBody.isCircle)
                {
                    drawPolygonOutline({
                        ctx,
                        vertices: currentBody.transformedVertices,
                        fillStyle: 'crimson',
                        alpha: 1
                    })
                }
                else
                {
                    drawCircleOutline({
                        ctx,
                        point: currentBody.position,
                        color: 'green',
                        radius: currentBody.radius,
                        rotationIndicator: false
                    })
                }
    
            }
        }
    }
    
}


export function loadSceneData(sceneData, canvas)
{
    let bodies = [];
    let bodyColors = [];
    
    let entities = [];
    let lights = [];

    let images = [];

    let player = null;

    for(let i = 0; i < sceneData.length; i++)
    {
        if(!sceneData[i].isEntity)
        {
            if (sceneData[i].imagePath != "" && sceneData[i].imagePath) 
            {
                images.push(sceneData[i].imagePath);
            }
        }

        if(sceneData[i].isEntity)
        {
            let color = rgbToCss(sceneData[i].color);

            let tempEntity = new Entity({position: sceneData[i].position, 
                size: sceneData[i].size, 
                radius:sceneData[i].radius, 
                drawBody: sceneData[i].drawBody, 
                color: color,
                imagePath: sceneData[i].imagePath,
                spriteSheetPath: sceneData[i].spriteSheetPath
            });

            if(sceneData[i].lights && sceneData[i].lights.length > 0)
            {
                for(let j = 0; j < sceneData[i].lights.length; j++)
                {
                    let light = sceneData[i].lights[j];


                    if (light.isCircular && !light.isCone)
                    {
                        tempEntity.addCircularLight({position: sceneData[i].position, radius: sceneData[i].lights[j].radius,
                            intensity: sceneData[i].lights[j].intensity,
                            color: sceneData[i].lights[j].color,
                            alpha: sceneData[i].lights[j].alpha});
                        
                        
                    }
                    else if (light.isCone && !light.isCircular)
                    {

                        tempEntity.addConeLight({position: sceneData[i].position, 
                            angle: sceneData[i].lights[j].angle,
                            spread: sceneData[i].lights[j].spread,
                            length: sceneData[i].lights[j].length,
                            intensity: sceneData[i].lights[j].intensity,
                            color: sceneData[i].lights[j].color,
                            alpha: sceneData[i].lights[j].alpha})
                    }

                }
            

                for (let k = 0; k < tempEntity.lights.length; k++) 
                {
                    lights.push(tempEntity.lights[k]);
                }

            }

            if (sceneData[i].tags && sceneData[i].tags.length > 0) 
            {
                for (let j = 0; j < sceneData[i].tags.length; j++) 
                {
                    let tag = sceneData[i].tags[j].tag;
                    tempEntity.addTag(tag);
                }
            }


            if(sceneData[i].hasBody)
            {
                if(sceneData[i].type === "box")
                {
                    tempEntity.createBox({density: sceneData[i].density, hasRotations: sceneData[i].hasRotations, bounciness: sceneData[i].bounciness,
                        dynamicFriction: sceneData[i].dynamicFriction, staticFriction: sceneData[i].staticFriction,
                        hasGravity: sceneData[i].hasGravity,
                        infMass: sceneData[i].infiniteMass,
                        angle: sceneData[i].angle
                    });
                }
                else if(sceneData[i].type === "triangle")
                {
                    tempEntity.createTriangle({density: sceneData[i].density, hasRotations: sceneData[i].hasRotations, bounciness: sceneData[i].bounciness,
                        dynamicFriction: sceneData[i].dynamicFriction, staticFriction: sceneData[i].staticFriction,
                        hasGravity: sceneData[i].hasGravity,
                        infMass: infiniteMass,
                        angle: sceneData[i].angle
                    });
                }
                else if(sceneData[i].type === "circle")
                {

                    tempEntity.createCircle({density: sceneData[i].density, hasRotations: sceneData[i].hasRotations, bounciness: sceneData[i].bounciness,
                        dynamicFriction: sceneData[i].dynamicFriction, staticFriction: sceneData[i].staticFriction,
                        hasGravity: sceneData[i].hasGravity,
                        infMass: sceneData[i].infiniteMass,
                        angle: sceneData[i].angle
                    });
                }


                if(sceneData[i].isPlayer)
                {
                    player = new Player(tempEntity, canvas);
                }
                
            }
            
            entities.push(tempEntity);
            
        }
        else if(sceneData[i].hasBody && !sceneData[i].isEntity)
        {
            let tempBody = null;
            let color = rgbToCss(sceneData[i].color);
            bodyColors.push(color);

            if(sceneData[i].type === "box")
            {
                tempBody = createBodyBox({position: sceneData[i].position, size: sceneData[i].size,
                    density: sceneData[i].density,
                    restitution: sceneData[i].bounciness,
                    linearDamping: sceneData[i].linearDamping,
                    angularDamping: sceneData[i].angularDamping,
                    isStatic: sceneData[i].isStatic,
                    noRotation: !sceneData[i].hasRotations,
                    affectedByGravity: sceneData[i].hasGravity,
                    dynamicFriction: sceneData[i].dynamicFriction,
                    staticFriction: sceneData[i].staticFriction
                });
                tempBody.setAngle(sceneData[i].angle);
                if(sceneData[i].infiniteMass) tempBody.mass = Infinity;
            }
            else if(sceneData[i].type === "triangle")
            {
                tempBody = createBodyTriangle({position: sceneData[i].position, size: sceneData[i].size,
                    density: sceneData[i].density,
                    restitution: sceneData[i].bounciness,
                    linearDamping: sceneData[i].linearDamping,
                    angularDamping: sceneData[i].angularDamping,
                    isStatic: sceneData[i].isStatic,
                    noRotation: !sceneData[i].hasRotations,
                    affectedByGravity: sceneData[i].hasGravity,
                    dynamicFriction: sceneData[i].dynamicFriction,
                    staticFriction: sceneData[i].staticFriction
                });
                tempBody.setAngle(sceneData[i].angle);
                if(sceneData[i].infiniteMass) tempBody.mass = Infinity;
            }
            else if(sceneData[i].type === "circle")
            {
                tempBody = createBodyCircle({position: sceneData[i].position, radius: sceneData[i].radius,
                    density: sceneData[i].density,
                    restitution: sceneData[i].bounciness,
                    linearDamping: sceneData[i].linearDamping,
                    angularDamping: sceneData[i].angularDamping,
                    isStatic: sceneData[i].isStatic,
                    noRotation: !sceneData[i].hasRotations,
                    affectedByGravity: sceneData[i].hasGravity,
                    dynamicFriction: sceneData[i].dynamicFriction,
                    staticFriction: sceneData[i].staticFriction
                });
                tempBody.setAngle(sceneData[i].angle);
                if(sceneData[i].infiniteMass) tempBody.mass = Infinity;
            }

            if(tempBody !== null) 
            {
                bodies.push(tempBody);
            }   
        }
    }


    return {bodies, bodyColors, entities, lights, player}

}



function rgbToCss({ r, g, b }) 
{
    return `rgb(${r}, ${g}, ${b})`;
}