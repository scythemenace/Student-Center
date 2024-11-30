import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
import flooringImage from "./assets/floor.png"; // Flooring image
import bookshelfImage from "./assets/bookshelf.png"; // Bookshelf image

const PixiCanvas = () => {
    const pixiContainer = useRef(null);
    const [socket, setSocket] = useState(null);
    const [users, setUsers] = useState({}); // Keep track of all users' positions

    useEffect(() => {
        const newSocket = io("http://localhost:3000"); // Replace with your backend URL
        setSocket(newSocket);

        const app = new PIXI.Application({
            resizeTo: window,
            backgroundColor: 0x1099bb,
        });

        if (pixiContainer.current) {
            pixiContainer.current.appendChild(app.view);
        }

        const tileSize = 128; // Corrected size of each tile
        const userSprites = {}; // Store sprites for all users

        // Create the tiling background
        const tileTexture = PIXI.Texture.from(flooringImage);
        const background = new PIXI.TilingSprite(
            tileTexture,
            app.screen.width,
            app.screen.height
        );
        background.tileScale.set(tileSize / tileTexture.width, tileSize / tileTexture.height); // Scale tiles correctly
        app.stage.addChild(background);

        // Create the bookshelf
        const bookshelf = PIXI.Sprite.from(bookshelfImage);
        bookshelf.anchor.set(0.5); // Center anchor for better positioning
        bookshelf.x = app.screen.width * 0.2; // Relative position: 20% from the left
        bookshelf.y = app.screen.height * 0.4; // Relative position: 40% from the top
        app.stage.addChild(bookshelf);

        // Create the local player sprite
        const localSprite = PIXI.Sprite.from("https://pixijs.io/examples/examples/assets/bunny.png");
        localSprite.anchor.set(0.5);
        localSprite.x = Math.floor(app.screen.width / 2 / tileSize) * tileSize; // Centered horizontally
        localSprite.y = Math.floor(app.screen.height / 2 / tileSize) * tileSize; // Centered vertically
        app.stage.addChild(localSprite);

        // Update local player position on movement
        const movement = { left: false, right: false, up: false, down: false };
        const speed = tileSize;

        const moveLocalPlayer = () => {
            if (movement.left) localSprite.x -= speed;
            if (movement.right) localSprite.x += speed;
            if (movement.up) localSprite.y -= speed;
            if (movement.down) localSprite.y += speed;

            // Keep localSprite within bounds
            localSprite.x = Math.max(0, Math.min(app.screen.width - tileSize, localSprite.x));
            localSprite.y = Math.max(0, Math.min(app.screen.height - tileSize, localSprite.y));

            // Notify the server of the local player's movement
            if (socket) {
                socket.emit("playerMove", { x: localSprite.x, y: localSprite.y });
            }
        };

        // Handle other players' movements
        const updateOtherPlayers = (data) => {
            Object.keys(data).forEach((userId) => {
                if (userId !== socket.id) {
                    if (!userSprites[userId]) {
                        // Create a sprite for a new player
                        const newSprite = PIXI.Sprite.from("https://pixijs.io/examples/examples/assets/bunny.png");
                        newSprite.anchor.set(0.5);
                        app.stage.addChild(newSprite);
                        userSprites[userId] = newSprite;
                    }
                    // Update the sprite's position
                    userSprites[userId].x = data[userId].x;
                    userSprites[userId].y = data[userId].y;
                }
            });
        };

        // Resize handler
        const resizeHandler = () => {
            app.renderer.resize(window.innerWidth, window.innerHeight);
            background.width = app.screen.width;
            background.height = app.screen.height;

            // Update bookshelf position relative to the new screen size
            bookshelf.x = app.screen.width * 0.2;
            bookshelf.y = app.screen.height * 0.4;
        };

        // Event listeners for movement
        const handleKeyDown = (event) => {
            switch (event.code) {
                case "ArrowLeft":
                case "KeyA":
                    movement.left = true;
                    break;
                case "ArrowRight":
                case "KeyD":
                    movement.right = true;
                    break;
                case "ArrowUp":
                case "KeyW":
                    movement.up = true;
                    break;
                case "ArrowDown":
                case "KeyS":
                    movement.down = true;
                    break;
                default:
                    break;
            }
            moveLocalPlayer();
        };

        const handleKeyUp = (event) => {
            switch (event.code) {
                case "ArrowLeft":
                case "KeyA":
                    movement.left = false;
                    break;
                case "ArrowRight":
                case "KeyD":
                    movement.right = false;
                    break;
                case "ArrowUp":
                case "KeyW":
                    movement.up = false;
                    break;
                case "ArrowDown":
                case "KeyS":
                    movement.down = false;
                    break;
                default:
                    break;
            }
        };

        // Socket event listeners
        newSocket.on("currentUsers", (data) => {
            setUsers(data); // Update state for all users
            updateOtherPlayers(data); // Update other players in PIXI
        });

        newSocket.on("userDisconnected", (data) => {
            const { userId } = data;
            if (userSprites[userId]) {
                app.stage.removeChild(userSprites[userId]); // Remove the sprite from the stage
                delete userSprites[userId];
            }
        });

        // Attach event listeners
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("resize", resizeHandler);

        // Cleanup
        return () => {
            newSocket.close();
            app.destroy(true, true);
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("resize", resizeHandler);
        };
    }, []);

    return <div ref={pixiContainer} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />;
};

export default PixiCanvas;
