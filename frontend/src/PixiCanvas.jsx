// PixiCanvas.jsx
import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
import Peer from "peerjs"; // Import PeerJS
import flooringImage from "./assets/floor2.png";
import bookshelfImage from "./assets/bookshelf.png";
import bookshelfv2Image from "./assets/bookshelf_v2.png";
import bookshelfv3Image from "./assets/bookshelf_v3.png";
import bookshelfv4Image from "./assets/bookshelf_v4.png";
import carpetImage from "./assets/carpet.png";
import pianoImage from "./assets/piano.png";
import poolImage from "./assets/pool.png";

const PixiCanvas = () => {
	const pixiContainer = useRef(null);
	const [socket, setSocket] = useState(null);
	const [peer, setPeer] = useState(null);
	const userSprites = useRef({});
	const userStreams = useRef({});
	const tileSize = 32;

	// Player's own data
	const localSpriteRef = useRef(null);
	const myPos = useRef({ x: 0, y: 0 });
	const lastPos = useRef({ x: 0, y: 0 });

	// Constants for audio
	const SOUND_CUTOFF_RANGE = 200; // Maximum distance to hear others
	const SOUND_NEAR_RANGE = 50; // Distance for maximum volume

	useEffect(() => {
		const newSocket = io("http://localhost:3000"); // Update with your server URL
		setSocket(newSocket);

		const getMicrophoneAccess = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				console.log("Microphone access granted");
				// Store the stream if needed
			} catch (err) {
				console.error("Error accessing microphone:", err);
			}
		};

		getMicrophoneAccess();

		const initPeer = (id) => {
			console.log("Initializing PeerJS with ID:", id);
			const newPeer = new Peer(id, {
				host: "localhost",
				port: 3000,
				path: "/peerjs",
				secure: true,
			});

			newPeer.on("open", () => {
				console.log("Peer connection open with ID:", newPeer.id);
			});

			newPeer.on("call", async (call) => {
				console.log("Received call from:", call.peer);
				try {
					const stream = await navigator.mediaDevices.getUserMedia({
						audio: true,
					});
					console.log("Microphone access granted for incoming call");
					call.answer(stream);
					handleIncomingCall(call);
				} catch (err) {
					console.error("Error accessing microphone:", err);
				}
			});

			newPeer.on("error", (err) => {
				console.error("PeerJS error:", err);
			});

			newPeer.on("disconnected", () => {
				console.warn("PeerJS disconnected");
			});

			newPeer.on("close", () => {
				console.warn("PeerJS connection closed");
			});

			setPeer(newPeer);
		};

		const handleIncomingCall = (call) => {
			call.on("stream", (remoteStream) => {
				userStreams.current[call.peer] = {
					stream: remoteStream,
					audio: createAudioElement(remoteStream),
				};
			});
		};

		const createAudioElement = (stream) => {
			const audio = new Audio();
			audio.srcObject = stream;
			audio.autoplay = true;
			audio.muted = false;
			audio.volume = 1;
			audio.play().catch((error) => {
				console.error("Error playing audio:", error);
			});
			return audio;
		};

		// Initialize PIXI application
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
		app.stage.addChild(background);

		// Carpet textures for the plus sign
		const carpetTexture = PIXI.Texture.from(carpetImage);

		// Function to create a horizontal strip
		const createHorizontalStrip = (yOffset) => {
			const strip = new PIXI.TilingSprite(
				carpetTexture,
				app.screen.width,
				tileSize
			);
			strip.tileScale.set(0.1);
			strip.anchor.set(0.5);
			strip.x = app.screen.width / 2;
			strip.y = app.screen.height / 2 + yOffset;
			return strip;
		};

		// Function to create a vertical strip
		const createVerticalStrip = (xOffset) => {
			const strip = new PIXI.TilingSprite(
				carpetTexture,
				tileSize,
				app.screen.height
			);
			strip.tileScale.set(0.1);
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

		// Resize handler
		const resizeHandler = () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);

			// Resize the floor background
			background.width = app.screen.width;
			background.height = app.screen.height;

			// Resize and reposition the carpet strips
			horizontalStrips.forEach((strip, index) => {
				strip.width = app.screen.width;
				strip.x = app.screen.width / 2;
				strip.y = app.screen.height / 2 + (index - 1) * tileSize;
			});

			verticalStrips.forEach((strip, index) => {
				strip.height = app.screen.height;
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

		// Create the local player sprite
		const localSprite = PIXI.Sprite.from(
			"https://pixijs.io/examples/examples/assets/bunny.png"
		);
		localSprite.anchor.set(0.5);
		localSprite.width = 40;
		localSprite.height = 60;
		localSprite.x = Math.floor(app.screen.width / 2 / tileSize) * tileSize;
		localSprite.y = Math.floor(app.screen.height / 2 / tileSize) * tileSize;
		app.stage.addChild(localSprite);

		// Store reference to local sprite
		localSpriteRef.current = localSprite;
		myPos.current = { x: localSprite.x, y: localSprite.y };

		// Initialize peer after socket connects
		newSocket.on("connect", () => {
			initPeer(newSocket.id);

			// Notify the server about the new player
			newSocket.emit("move", { x: localSprite.x, y: localSprite.y });
		});

		// Handle other players' movements and connections
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

					// Start a call with the new user
					startCall(data.userId);
				}
				// Update the position of the other player
				otherSprite.x = data.x;
				otherSprite.y = data.y;
			}
		});

		newSocket.on("userDisconnected", (data) => {
			const { userId } = data;
			if (userSprites.current[userId]) {
				app.stage.removeChild(userSprites.current[userId]);
				delete userSprites.current[userId];
			}
			if (userStreams.current[userId]) {
				// Stop and remove audio stream
				userStreams.current[userId].audio.pause();
				userStreams.current[userId].audio.srcObject = null;
				delete userStreams.current[userId];
			}
		});

		const startCall = async (targetId) => {
			if (!peer) return;
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				const call = peer.call(targetId, stream);
				call.on("stream", (remoteStream) => {
					userStreams.current[targetId] = {
						stream: remoteStream,
						audio: createAudioElement(remoteStream),
					};
				});
			} catch (err) {
				console.error("Error accessing microphone:", err);
			}
		};

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

			// Update positions
			myPos.current = { x: localSprite.x, y: localSprite.y };

			// Notify the server of the local player's movement
			newSocket.emit("move", { x: localSprite.x, y: localSprite.y });

			// Update audio volumes based on proximity
			updateAudioVolumes();
		};

		const updateAudioVolumes = () => {
			Object.keys(userSprites.current).forEach((userId) => {
				if (userId === newSocket.id) return;
				const otherSprite = userSprites.current[userId];
				const distance = Math.hypot(
					localSprite.x - otherSprite.x,
					localSprite.y - otherSprite.y
				);

				let volume = 0;
				if (distance < SOUND_NEAR_RANGE) {
					volume = 1;
				} else if (distance < SOUND_CUTOFF_RANGE) {
					volume =
						1 -
						(distance - SOUND_NEAR_RANGE) /
							(SOUND_CUTOFF_RANGE - SOUND_NEAR_RANGE);
				}

				if (userStreams.current[userId]) {
					userStreams.current[userId].audio.volume = volume;
				}
			});
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

		// Attach event listeners
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		// Cleanup
		return () => {
			newSocket.close();
			if (peer) peer.destroy();
			app.destroy(true, true);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("resize", resizeHandler);

			// Stop all audio streams
			Object.values(userStreams.current).forEach((userStream) => {
				userStream.audio.pause();
				userStream.audio.srcObject = null;
			});
			userStreams.current = {};
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
