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
		const newSocket = io("https://student-center-ba.onrender.com", {
			transports: ["websocket"], // Use WebSocket transport
		});
		setSocket(newSocket);

		const initPeer = (id) => {
			console.log("Initializing PeerJS with ID:", id);

			const newPeer = new Peer({
				id: id,
				host: "peerjs.com", // Use a reliable public PeerJS server
				port: 443,
				path: "/",
				secure: true,
				debug: 2, // Reduced debug level for cleaner logs
			});

			newPeer.on("open", (peerId) => {
				console.log("Peer connection open with ID:", peerId);
			});

			newPeer.on("error", (err) => {
				console.error("PeerJS error:", err);
			});

			setPeer(newPeer);

			// Handle incoming calls
			newPeer.on("call", handleIncomingCall);
		};

		const handleIncomingCall = (call) => {
			console.log("Handling incoming call from:", call.peer);
			call.on("stream", (remoteStream) => {
				console.log("Received remote stream from:", call.peer);
				userStreams.current[call.peer] = {
					stream: remoteStream,
					audio: createAudioElement(remoteStream),
				};
			});

			call.on("error", (err) => {
				console.error("Call error with", call.peer, ":", err);
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

		// Add background
		const tileTexture = PIXI.Texture.from(flooringImage);
		const background = new PIXI.TilingSprite(
			tileTexture,
			app.screen.width,
			app.screen.height
		);
		app.stage.addChild(background);

		// Resize handler
		const resizeHandler = () => {
			app.renderer.resize(window.innerWidth, window.innerHeight);
			background.width = app.screen.width;
			background.height = app.screen.height;
		};
		window.addEventListener("resize", resizeHandler);

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
		myPos.current = { x: localSprite.x, y: localSprite.y };

		newSocket.on("connect", () => {
			console.log("Socket.IO connected with ID:", newSocket.id);
			initPeer(newSocket.id);
			newSocket.emit("move", { x: localSprite.x, y: localSprite.y });
		});

		newSocket.on("userMoved", (data) => {
			console.log("User moved:", data.userId);
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

					if (peer && peer.open) {
						startCall(data.userId);
					} else {
						console.warn(
							"PeerJS not initialized yet, delaying call to",
							data.userId
						);
						peer?.on("open", () => {
							startCall(data.userId);
						});
					}
				}
				otherSprite.x = data.x;
				otherSprite.y = data.y;
			}
		});

		newSocket.on("userDisconnected", (data) => {
			console.log("User disconnected:", data.userId);
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
		});

		const startCall = async (targetId) => {
			if (!peer) {
				console.warn("PeerJS not initialized yet");
				return;
			}
			console.log("Attempting to start call with:", targetId);
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				console.log("Microphone access granted");
				const call = peer.call(targetId, stream);
				console.log("Call initiated to:", targetId);

				call.on("stream", (remoteStream) => {
					console.log("Received remote stream from:", targetId);
					userStreams.current[targetId] = {
						stream: remoteStream,
						audio: createAudioElement(remoteStream),
					};
				});

				call.on("error", (err) => {
					console.error("Call error with", targetId, ":", err);
				});
			} catch (err) {
				console.error("Error accessing microphone:", err);
			}
		};

		// Cleanup
		return () => {
			newSocket.close();
			peer?.destroy();
			app.destroy(true, true);
			window.removeEventListener("resize", resizeHandler);

			Object.values(userStreams.current).forEach((userStream) => {
				userStream.audio.pause();
				userStream.audio.srcObject = null;
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
