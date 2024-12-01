import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";
import { io } from "socket.io-client";
// Remove PeerJS import
// import Peer from "peerjs"; // Remove this line
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
			"https://student-center-129q.onrender.com";
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

			const isPolite = pc.isPolite;

			try {
				if (signalData.type === "offer") {
					const offerCollision =
						pc.makingOffer || pc.signalingState !== "stable";

					const ignoreOffer = !isPolite && offerCollision;
					if (ignoreOffer) {
						console.log("Ignoring offer from", from);
						return;
					}

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
					try {
						await pc.addIceCandidate(new RTCIceCandidate(signalData));
					} catch (err) {
						if (!pc.ignoreOffer) {
							console.error("Error adding received ice candidate", err);
						}
					}
				}
			} catch (err) {
				console.error("Error handling signal", err);
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

			// Determine isPolite based on socket IDs
			pc.isPolite = newSocket.id > targetId;

			pc.makingOffer = false;
			pc.ignoreOffer = false;
			pc.isSettingRemoteAnswerPending = false;

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

			// Handle negotiation needed
			pc.onnegotiationneeded = async () => {
				try {
					pc.makingOffer = true;
					const offer = await pc.createOffer();
					if (pc.signalingState !== "stable") return;
					await pc.setLocalDescription(offer);
					newSocket.emit("signal", {
						to: targetId,
						signalData: pc.localDescription,
					});
				} catch (err) {
					console.error("Error during negotiation", err);
				} finally {
					pc.makingOffer = false;
				}
			};

			return pc;
		};

		const initiateConnection = (targetId) => {
			if (!peerConnections.current[targetId]) {
				const pc = createPeerConnection(targetId);
				peerConnections.current[targetId] = pc;
			}
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
