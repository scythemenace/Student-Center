import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
import flooringImage from "./assets/floor2.png"; // Flooring image
import bookshelfImage from "./assets/bookshelf.png"; // Bookshelf image
import bookshelfv2Image from "./assets/bookshelf_v2.png"; // Bookshelf image
import bookshelfv3Image from "./assets/bookshelf_v3.png"; // Bookshelf image
import bookshelfv4Image from "./assets/bookshelf_v4.png"; // Bookshelf image
import carpetImage from "./assets/carpet.png"; // Carpet image
import pianoImage from "./assets/piano.png"; // Carpet image
import poolImage from "./assets/pool.png"; // Carpet image

const PixiCanvas = () => {
	const pixiContainer = useRef(null);
	const [socket, setSocket] = useState(null);
	const userSprites = useRef({}); // Store sprites for all users
	const tileSize = 32; // Size of each tile

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

		// Create the tiling background
		const tileTexture = PIXI.Texture.from(flooringImage);
		const background = new PIXI.TilingSprite(
			tileTexture,
			app.screen.width,
			app.screen.height
		);
		// Add the tiling background to the stage
		app.stage.addChild(background);

		// Carpet textures for the plus sign
		const carpetTexture = PIXI.Texture.from(carpetImage);

		// Function to create a horizontal strip
		const createHorizontalStrip = (yOffset) => {
			const strip = new PIXI.TilingSprite(
				carpetTexture,
				app.screen.width, // Full screen width
				tileSize // Fixed height for the carpet
			);
			strip.tileScale.set(0.1); // Adjust the scale to show the full carpet
			strip.anchor.set(0.5);
			strip.x = app.screen.width / 2;
			strip.y = app.screen.height / 2 + yOffset;
			return strip;
		};

		// Function to create a vertical strip
		const createVerticalStrip = (xOffset) => {
			const strip = new PIXI.TilingSprite(
				carpetTexture,
				tileSize, // Fixed width for the carpet
				app.screen.height // Full screen height
			);
			strip.tileScale.set(0.1); // Adjust the scale to show the full carpet
			strip.anchor.set(0.5);
			strip.x = app.screen.width / 2 + xOffset;
			strip.y = app.screen.height / 2;
			return strip;
		};

		// Create and add horizontal strips
		const horizontalStrips = [
			createHorizontalStrip(-tileSize),
			createHorizontalStrip(0),
			createHorizontalStrip(tileSize),
		];
		horizontalStrips.forEach((strip) => app.stage.addChild(strip));

		// Create and add vertical strips
		const verticalStrips = [
			createVerticalStrip(-tileSize),
			createVerticalStrip(0),
			createVerticalStrip(tileSize),
		];
		verticalStrips.forEach((strip) => app.stage.addChild(strip));

		// Resize handler to adjust the tiling background and carpet on window resize
		const resizeHandler = () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);

			// Resize the floor background
			background.width = app.screen.width;
			background.height = app.screen.height;

			// Resize and reposition the carpet strips
			horizontalStrips.forEach((strip, index) => {
				strip.width = app.screen.width; // Full screen width
				strip.x = app.screen.width / 2;
				strip.y = app.screen.height / 2 + (index - 1) * tileSize;
			});

			verticalStrips.forEach((strip, index) => {
				strip.height = app.screen.height; // Full screen height
				strip.x = app.screen.width / 2 + (index - 1) * tileSize;
				strip.y = app.screen.height / 2;
			});
		};
		window.addEventListener("resize", resizeHandler);
		// Create the bookshelf
		const bookshelf1 = PIXI.Sprite.from(bookshelfImage);
		bookshelf1.anchor.set(0.5); // Center anchor for better positioning
		bookshelf1.width = 150;
		bookshelf1.height = 200;
		bookshelf1.x = app.screen.width * 0.025; // Relative position: 20% from the left
		bookshelf1.y = app.screen.height * 0.095; // Relative position: 40% from the top
		app.stage.addChild(bookshelf1);

		const bookshelfv2 = PIXI.Sprite.from(bookshelfv2Image);
		bookshelfv2.anchor.set(0.5); // Center anchor for better positioning
		bookshelfv2.width = 500;
		bookshelfv2.height = 600;
		bookshelfv2.x = app.screen.width * 0.069; // Relative position: 20% from the left
		bookshelfv2.y = app.screen.height * 0.21; // Relative position: 40% from the top
		app.stage.addChild(bookshelfv2);

		const bookshelfv4 = PIXI.Sprite.from(bookshelfv4Image);
		bookshelfv4.anchor.set(0.5); // Center anchor for better positioning
		bookshelfv4.width = 500;
		bookshelfv4.height = 600;
		bookshelfv4.x = app.screen.width * 0.09; // Relative position: 20% from the left
		bookshelfv4.y = app.screen.height * 0.138; // Relative position: 40% from the top
		app.stage.addChild(bookshelfv4);

		const bookshelfv3 = PIXI.Sprite.from(bookshelfv3Image);
		bookshelfv3.anchor.set(0.5); // Center anchor for better positioning
		bookshelfv3.width = 500;
		bookshelfv3.height = 600;
		bookshelfv3.x = app.screen.width * 0.132; // Relative position: 20% from the left
		bookshelfv3.y = app.screen.height * 0.187; // Relative position: 40% from the top
		app.stage.addChild(bookshelfv3);

		const bookshelf2 = PIXI.Sprite.from(bookshelfImage);
		bookshelf2.anchor.set(0.5); // Center anchor for better positioning
		bookshelf2.width = 150;
		bookshelf2.height = 200;
		bookshelf2.x = app.screen.width * 0.157; // Relative position: 20% from the left
		bookshelf2.y = app.screen.height * 0.098; // Relative position: 40% from the top
		app.stage.addChild(bookshelf2);

		const piano = PIXI.Sprite.from(pianoImage);
		piano.anchor.set(0.5); // Center anchor for better positioning
		piano.width = 1000;
		piano.height = 1000;
		piano.x = app.screen.width * 0.96; // Relative position: 20% from the left
		piano.y = app.screen.height * 0.117; // Relative position: 40% from the top
		app.stage.addChild(piano);

		// const pool = PIXI.Sprite.from(poolImage);
		// piano.anchor.set(0.5); // Center anchor for better positioning
		// piano.width = 1000;
		// piano.height = 1000;
		// piano.x = app.screen.width * 0.96; // Relative position: 20% from the left
		// piano.y = app.screen.height * 0.117; // Relative position: 40% from the top
		// app.stage.addChild(piano);

		// Create the local player sprite
		const localSprite = PIXI.Sprite.from(
			"https://pixijs.io/examples/examples/assets/bunny.png"
		);
		localSprite.anchor.set(0.5);
		localSprite.width = 40;
		localSprite.height = 60;
		localSprite.x = Math.floor(app.screen.width / 2 / tileSize) * tileSize; // Centered horizontally
		localSprite.y = Math.floor(app.screen.height / 2 / tileSize) * tileSize; // Centered vertically
		app.stage.addChild(localSprite);

		// Notify the server about the new player
		newSocket.emit("move", { x: localSprite.x, y: localSprite.y });

		// Movement state
		const movement = { left: false, right: false, up: false, down: false };
		const speed = tileSize;

		const moveLocalPlayer = () => {
			if (movement.left) localSprite.x -= speed;
			if (movement.right) localSprite.x += speed;
			if (movement.up) localSprite.y -= speed;
			if (movement.down) localSprite.y += speed;

			// Keep localSprite within bounds
			localSprite.x = Math.max(
				0,
				Math.min(app.screen.width - tileSize, localSprite.x)
			);
			localSprite.y = Math.max(
				0,
				Math.min(app.screen.height - tileSize, localSprite.y)
			);

			// Notify the server of the local player's movement
			newSocket.emit("move", { x: localSprite.x, y: localSprite.y });
		};

		// Handle other players' movements
		newSocket.on("userMoved", (data) => {
			if (data.userId !== newSocket.id) {
				let otherSprite = userSprites.current[data.userId];
				if (!otherSprite) {
					// Create a sprite for the new player
					otherSprite = PIXI.Sprite.from(
						"https://pixijs.io/examples/examples/assets/bunny.png"
					);
					otherSprite.anchor.set(0.5);
					otherSprite.width = 40;
					otherSprite.height = 60;
					app.stage.addChild(otherSprite);
					userSprites.current[data.userId] = otherSprite;
				}
				// Update the position of the other player
				otherSprite.x = data.x;
				otherSprite.y = data.y;
			}
		});

		newSocket.on("userDisconnected", (data) => {
			const { userId } = data;
			if (userSprites.current[userId]) {
				app.stage.removeChild(userSprites.current[userId]); // Remove the sprite from the stage
				delete userSprites.current[userId];
			}
		});

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

		// Attach event listeners
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		// Cleanup
		return () => {
			newSocket.close();
			app.destroy(true, true);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("resize", resizeHandler);
		};
	}, []);

	return (
		<div
			ref={pixiContainer}
			style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
		/>
	);
};

export default PixiCanvas;
