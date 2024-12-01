import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
// Remove PeerJS import
// import Peer from "peerjs"; // Remove this line
import flooringImage from "./assets/floor2.png"; // Flooring image
import bookshelfImage from "./assets/bookshelf.png"; // Bookshelf image
import bookshelfv2Image from "./assets/bookshelf_v2.png"; // Bookshelf image
import bookshelfv3Image from "./assets/bookshelf_v3.png"; // Bookshelf image
import bookshelfv4Image from "./assets/bookshelf_v4.png"; // Bookshelf image
import carpetImage from "./assets/carpet.png"; // Carpet image
import pianoImage from "./assets/piano.png"; // Piano image
import poolImage from "./assets/pool.png"; // Pool image
import clockImage from "./assets/clock.png"; // Clockimage
import arcadeImage from "./assets/arcade.png"; // Arcade image
import deskImage from "./assets/desk.png"; // Desk image
import deskv2Image from "./assets/desk_v2.png"; // Deskimage
import deskv3Image from "./assets/desk_v3.png"; // Desk image
import tableImage from "./assets/table.png"; // Table image
import tablev2Image from "./assets/table_2.png"; // Table image
import rugImage from "./assets/rug.png"; // Table image
import tablev3Image from "./assets/table_v3.png"; // Table image
import tablev4Image from "./assets/table_v4.png"; // Table image

const PixiCanvas = () => {
	const pixiContainer = useRef(null);
	const [socket, setSocket] = useState(null);
	const userSprites = useRef({});
	const peerConnections = useRef({});
	const userStreams = useRef({});
	const tileSize = 32;

	// Player's own data
	const localSpriteRef = useRef(null);
	const localStreamRef = useRef(null);

	// Constants for audio
	const SOUND_CUTOFF_RANGE = 200; // Maximum distance to hear others
	const SOUND_NEAR_RANGE = 50; // Distance for maximum volume

	useEffect(() => {
		const backendUrl =
			process.env.REACT_APP_BACKEND_URL ||
			"https://student-center-ba.onrender.com";

		const newSocket = io(backendUrl, {
			transports: ["websocket"],
		});
		setSocket(newSocket);

		// Get user media
		const getUserMedia = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				localStreamRef.current = stream;
				console.log("Microphone access granted");
			} catch (err) {
				console.error("Error accessing microphone:", err);
			}
		};

		getUserMedia();

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

		const pool = PIXI.Sprite.from(poolImage);
		pool.anchor.set(0.5); // Center anchor for better positioning
		pool.width = 201;
		pool.height = 132;
		pool.x = app.screen.width * 0.8; // Relative position: 20% from the left
		pool.y = app.screen.height * 0.117; // Relative position: 40% from the top
		app.stage.addChild(pool);

		const arcade = PIXI.Sprite.from(arcadeImage);
		arcade.anchor.set(0.5); // Center anchor for better positioning
		arcade.width = 400;
		arcade.height = 400;
		arcade.x = app.screen.width * 0.7; // Relative position: 20% from the left
		arcade.y = app.screen.height * 0.117; // Relative position: 40% from the top
		app.stage.addChild(arcade);

		const clock = PIXI.Sprite.from(clockImage);
		clock.anchor.set(0.5); // Center anchor for better positioning
		clock.width = 36.3;
		clock.height = 134.31;
		clock.x = app.screen.width * 0.2; // Relative position: 20% from the left
		clock.y = app.screen.height * 0.1; // Relative position: 40% from the top
		app.stage.addChild(clock);

		const desk = PIXI.Sprite.from(deskImage);
		desk.anchor.set(0.5); // Center anchor for better positioning
		desk.width = 512;
		desk.height = 512;
		desk.x = app.screen.width * 0.1; // Relative position: 20% from the left
		desk.y = app.screen.height * 0.817; // Relative position: 40% from the top
		app.stage.addChild(desk);

		const deskv2 = PIXI.Sprite.from(deskv2Image);
		deskv2.anchor.set(0.5); // Center anchor for better positioning
		deskv2.width = 512;
		deskv2.height = 512;
		deskv2.x = app.screen.width * 0.2; // Relative position: 20% from the left
		deskv2.y = app.screen.height * 0.835; // Relative position: 40% from the top
		app.stage.addChild(deskv2);

		const deskv3 = PIXI.Sprite.from(deskv3Image);
		deskv3.anchor.set(0.5); // Center anchor for better positioning
		deskv3.width = 512;
		deskv3.height = 512;
		deskv3.x = app.screen.width * 0.14; // Relative position: 20% from the left
		deskv3.y = app.screen.height * 0.94; // Relative position: 40% from the top
		app.stage.addChild(deskv3);

		const deskv4 = PIXI.Sprite.from(deskImage);
		deskv4.anchor.set(0.5); // Center anchor for better positioning
		deskv4.width = 512;
		deskv4.height = 512;
		deskv4.x = app.screen.width * 0.37; // Relative position: 20% from the left
		deskv4.y = app.screen.height * 0.817; // Relative position: 40% from the top
		app.stage.addChild(deskv4);

		const deskv5 = PIXI.Sprite.from(deskv2Image);
		deskv5.anchor.set(0.5); // Center anchor for better positioning
		deskv5.width = 512;
		deskv5.height = 512;
		deskv5.x = app.screen.width * 0.34; // Relative position: 20% from the left
		deskv5.y = app.screen.height * 0.835; // Relative position: 40% from the top
		app.stage.addChild(deskv5);

		const deskv6 = PIXI.Sprite.from(deskv3Image);
		deskv6.anchor.set(0.5); // Center anchor for better positioning
		deskv6.width = 512;
		deskv6.height = 512;
		deskv6.x = app.screen.width * 0.34; // Relative position: 20% from the left
		deskv6.y = app.screen.height * 0.94; // Relative position: 40% from the top
		app.stage.addChild(deskv6);

		const table = PIXI.Sprite.from(tableImage);
		table.anchor.set(0.5); // Center anchor for better positioning
		table.width = 512;
		table.height = 512;
		table.x = app.screen.width * 0.34; // Relative position: 20% from the left
		table.y = app.screen.height * 0.2; // Relative position: 40% from the top
		app.stage.addChild(table);

		const table2 = PIXI.Sprite.from(tablev2Image);
		table2.anchor.set(0.5); // Center anchor for better positioning
		table2.width = 512;
		table2.height = 512;
		table2.x = app.screen.width * 0.34; // Relative position: 20% from the left
		table2.y = app.screen.height * 0.1; // Relative position: 40% from the top
		app.stage.addChild(table2);

		const table3 = PIXI.Sprite.from(tablev3Image);
		table3.anchor.set(0.5); // Center anchor for better positioning
		table3.width = 512;
		table3.height = 512;
		table3.x = app.screen.width * 0.1; // Relative position: 20% from the left
		table3.y = app.screen.height * 0.35; // Relative position: 40% from the top
		app.stage.addChild(table3);

		const table4 = PIXI.Sprite.from(tablev4Image);
		table4.anchor.set(0.5); // Center anchor for better positioning
		table4.width = 512;
		table4.height = 512;
		table4.x = app.screen.width * 0.21; // Relative position: 20% from the left
		table4.y = app.screen.height * 0.35; // Relative position: 40% from the top
		app.stage.addChild(table4);

		const rug = PIXI.Sprite.from(rugImage);
		rug.anchor.set(0.5); // Center anchor for better positioning
		rug.width = 98;
		rug.height = 96;
		rug.x = app.screen.width * 0.35; // Relative position: 20% from the left
		rug.y = app.screen.height * 0.35; // Relative position: 40% from the top
		app.stage.addChild(rug);

		// Create local player sprite
		const localSprite = PIXI.Sprite.from(
			"https://pixijs.io/examples/examples/assets/bunny.png"
		);
		localSprite.anchor.set(0.5);
		localSprite.width = 40;
		localSprite.height = 60;
		localSprite.x = Math.floor(app.screen.width / 2 / tileSize) * tileSize;
		localSprite.y = Math.floor(app.screen.height / 2 / tileSize) * tileSize;
		app.stage.addChild(localSprite);
		localSpriteRef.current = localSprite;

		newSocket.on("connect", () => {
			console.log("Socket.IO connected with ID:", newSocket.id);
			newSocket.emit("move", { x: localSprite.x, y: localSprite.y });
		});

		// Handle incoming signaling data
		newSocket.on("signal", async (data) => {
			const { from, signalData } = data;
			let pc = peerConnections.current[from];

			if (!pc) {
				pc = createPeerConnection(from);
				peerConnections.current[from] = pc;
			}

			if (signalData.type === "offer") {
				await pc.setRemoteDescription(new RTCSessionDescription(signalData));
				const answer = await pc.createAnswer();
				await pc.setLocalDescription(answer);
				newSocket.emit("signal", {
					to: from,
					signalData: pc.localDescription,
				});
			} else if (signalData.type === "answer") {
				await pc.setRemoteDescription(new RTCSessionDescription(signalData));
			} else if (signalData.candidate) {
				await pc.addIceCandidate(new RTCIceCandidate(signalData));
			}
		});

		newSocket.on("userMoved", (data) => {
			if (data.userId !== newSocket.id) {
				let otherSprite = userSprites.current[data.userId];
				if (!otherSprite) {
					otherSprite = PIXI.Sprite.from(
						"https://pixijs.io/examples/examples/assets/bunny.png"
					);
					otherSprite.anchor.set(0.5);
					otherSprite.width = 40;
					otherSprite.height = 60;
					app.stage.addChild(otherSprite);
					userSprites.current[data.userId] = otherSprite;

					// Initiate WebRTC connection
					initiateConnection(data.userId);
				}
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
				userStreams.current[userId].audio.pause();
				userStreams.current[userId].audio.srcObject = null;
				delete userStreams.current[userId];
			}
			if (peerConnections.current[userId]) {
				peerConnections.current[userId].close();
				delete peerConnections.current[userId];
			}
		});

		const createPeerConnection = (targetId) => {
			const pc = new RTCPeerConnection({
				iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
			});

			// Add local stream tracks
			localStreamRef.current?.getTracks().forEach((track) => {
				pc.addTrack(track, localStreamRef.current);
			});

			// Handle ICE candidates
			pc.onicecandidate = (event) => {
				if (event.candidate) {
					newSocket.emit("signal", {
						to: targetId,
						signalData: event.candidate,
					});
				}
			};

			// Handle remote stream
			pc.ontrack = (event) => {
				const [remoteStream] = event.streams;
				if (!userStreams.current[targetId]) {
					userStreams.current[targetId] = {
						stream: remoteStream,
						audio: createAudioElement(remoteStream),
					};
				}
			};

			return pc;
		};

		const initiateConnection = async (targetId) => {
			const pc = createPeerConnection(targetId);
			peerConnections.current[targetId] = pc;

			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			newSocket.emit("signal", {
				to: targetId,
				signalData: pc.localDescription,
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

		// Movement handling
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
			window.removeEventListener("resize", resizeHandler);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);

			Object.values(userStreams.current).forEach((userStream) => {
				userStream.audio.pause();
				userStream.audio.srcObject = null;
			});

			Object.values(peerConnections.current).forEach((pc) => {
				pc.close();
			});
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
