import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

const PixiCanvas = () => {
    const pixiContainer = useRef(null);

    useEffect(() => {
        const app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x1099bb,
        });

        if (pixiContainer.current) {
            pixiContainer.current.appendChild(app.view);
        }

        const tileSize = 32; // Step size for pixel movement
        const character = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
        character.x = Math.floor(app.screen.width / 2 / tileSize) * tileSize;
        character.y = Math.floor(app.screen.height / 2 / tileSize) * tileSize;
        character.anchor.set(0.5);
        app.stage.addChild(character);

        const movement = { left: false, right: false, up: false, down: false };
        const speed = tileSize;
        let movementInterval = null;
        const holdDelay = 250; // Initial delay in milliseconds before continuous movement
        const repeatRate = 200; // Continuous movement speed in milliseconds

        const moveCharacter = () => {
            if (movement.left) character.x -= speed;
            if (movement.right) character.x += speed;
            if (movement.up) character.y -= speed;
            if (movement.down) character.y += speed;

            // Ensure the character stays within bounds
            character.x = Math.max(0, Math.min(app.screen.width - tileSize, character.x));
            character.y = Math.max(0, Math.min(app.screen.height - tileSize, character.y));
        };

        const handleKeyDown = (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    movement.left = true;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    movement.right = true;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    movement.up = true;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    movement.down = true;
                    break;
                default:
                    break;
            }

            if (!movementInterval) {
                // Move character immediately and set up continuous movement with a delay
                moveCharacter();
                movementInterval = setTimeout(() => {
                    movementInterval = setInterval(moveCharacter, repeatRate);
                }, holdDelay);
            }
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case 'ArrowLeft':
                case 'KeyA':
                    movement.left = false;
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    movement.right = false;
                    break;
                case 'ArrowUp':
                case 'KeyW':
                    movement.up = false;
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    movement.down = false;
                    break;
                default:
                    break;
            }

            // If no movement keys are pressed, clear the interval
            if (!Object.values(movement).some(Boolean)) {
                clearInterval(movementInterval);
                movementInterval = null;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            clearInterval(movementInterval);
            app.destroy(true, true);
        };
    }, []);

    return <div ref={pixiContainer} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default PixiCanvas;
