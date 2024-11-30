import React, { useRef, useEffect } from 'react';
import * as PIXI from 'pixi.js';

const PixiCanvas = () => {
    const pixiContainer = useRef(null);

    useEffect(() => {
        // Create the PixiJS application
        const app = new PIXI.Application({
            resizeTo: window, // Automatically resize to fill the window
            backgroundColor: 0x1099bb, // Light blue background
        });

        // Append the PixiJS view (canvas) to the ref container
        if (pixiContainer.current) {
            pixiContainer.current.appendChild(app.view);
        }

        // Create the sprite (character)
        const character = PIXI.Sprite.from('https://pixijs.io/examples/examples/assets/bunny.png');
        character.x = app.screen.width / 2;
        character.y = app.screen.height / 2;
        character.anchor.set(0.5);
        app.stage.addChild(character);

        // Movement state
        const movement = { left: false, right: false, up: false, down: false };
        const speed = 5; // Movement speed

        // Update character position based on key presses
        const updateCharacterPosition = () => {
            if (movement.left) character.x -= speed;
            if (movement.right) character.x += speed;
            if (movement.up) character.y -= speed;
            if (movement.down) character.y += speed;

            // Keep the character within bounds
            character.x = Math.max(0, Math.min(app.screen.width, character.x));
            character.y = Math.max(0, Math.min(app.screen.height, character.y));
        };

        // Keyboard event listeners
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
        };

        // Add event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Game loop for movement
        app.ticker.add(updateCharacterPosition);

        // Cleanup on component unmount
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            app.ticker.remove(updateCharacterPosition);
            app.destroy(true, true);
        };
    }, []);

    // Full-screen container
    return <div ref={pixiContainer} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }} />;
};

export default PixiCanvas;
