if typeof document !== 'undefined'
	const link = document.createElement('link')
	link.rel = 'stylesheet'
	link.href = 'https://fonts.googleapis.com/css2?family=Young+Serif&display=swap'
	document.head.appendChild(link)

let projectDescriptions = {
	soliloquy: "soliloquy is a new type of operating system based on the zircon kernel built from the ground up for web. what makes soliloquy different is aside from being faster, with a smaller footprint, and using less resources is the web based desktop environment built with servo and v8.\n\nbuilt primarily with rust."
	plates: "plates is a universal ai assistant, that links all your devices together. it is local first, utilising on device language models and tools to interact with your services. it works on any time, anywhere. own your data with a local server, syncing photos, clipboard and your accounts. pickup where you left off on any device.\n\nbuilt with swiftui + rust. tableware (web ui) and mcp built with go and svelte."
	standpoint: "standpoint is an opinion based social media platform to create tierlists and polls to share standpoints. it is ai powered and web-focused allowing you to grab photos across the web, as well as collaborate in real time.\n\nbuilt with svelte and python."
	infrastruct: "infrastruct is an online ai-powered jurisprudence platform. compare opinions on any topic from the worlds religions as well as the culmination of knowledge from the greatest philosophers in history in one place. mix and match your own ideas and create your own system with our online tool. save your stances.\n\nbuilt with next.js, and backend r2 built with vlang."
	vuno: "vuno is the text editor to end all text editors. keyboard based, but not complicated like vim, edit at lightspeed. ai copilot to help you write, code and more, with live notion-style markdown editing.\n\nbuilt with tauri (svelte+rust)."
}

tag App
	prop shapes = []
	prop backgroundVisible = false
	prop textVisible = false
	prop hoveredProject = null
	prop svgElement = null
	animationFrameId = null

	def animateLetters e
		const letters = e.target.querySelectorAll('.letter')
		letters.forEach do(letter, i)
			const x = Math.floor(Math.random! * 201) - 100
			const y = Math.floor(Math.random! * 201) - 100
			const rot = Math.floor(Math.random! * 201) - 100
			letter.style.transform = "translate({x}%, {y}%) rotate({rot}deg)"
			setTimeout(&, 300) do
				letter.style.transform = ""

	def createShape id\number, type\string
		# All shapes move right to left, start from right side
		const x = 120
		const y = Math.random! * 100 - 10
		const speed = Math.random! * 0.05 + 0.02
		const dx = -speed
		const dy = 0
		# Truly randomize colors with RGB values
		const r = Math.floor(Math.random! * 256)
		const g = Math.floor(Math.random! * 256)
		const b = Math.floor(Math.random! * 256)
		const randomColor = "rgb({r}, {g}, {b})"

		{
			id: id
			x: x
			y: y
			size: Math.random! * 40 + 25
			rotation: Math.random! * 360
			color: randomColor
			type: type
			dx: dx
			dy: dy
			rotationSpeed: (Math.random! - 0.5) * 0.5
		}

	def getTrianglePoints size\number
		const height = size * Math.sqrt(3) / 2
		"0,{-height/2} {size/2},{height/2} {-size/2},{height/2}"

	def animate
		shapes = shapes.map do(shape)
			let x = shape.x + shape.dx
			let y = shape.y + shape.dy
			let rotation = (shape.rotation + shape.rotationSpeed) % 360

			# Restart shape when it moves off screen to the left
			if x < -50
				createShape(shape.id, shape.type)
			else
				{...shape, x: x, y: y, rotation: rotation}

		# Keep 3-5 shapes on screen at all times
		let onScreen = shapes.filter do(s)
			s.x > -50 and s.x < 120
		
		if onScreen.length < 3
			# Add a new shape if we have less than 3 on screen
			const newType = ['triangle', 'circle', 'square'][Math.floor(Math.random! * 3)]
			shapes.push(createShape(shapes.length, newType))

		imba.commit!
		animationFrameId = window.requestAnimationFrame do
			animate!

	def mount
		const initialShapes = []
		# Start with 4 shapes at different positions
		const types = ['triangle', 'circle', 'square']
		for i in [0...4]
			let shape = createShape(i, types[i % 3])
			shape.x = 30 + (i * 25)
			initialShapes.push(shape)
		shapes = initialShapes
		
		console.log("✅ Mounted with shapes:", shapes.length)

		# Animate visibility with native methods
		setTimeout(&, 100) do
			backgroundVisible = true
			console.log("✅ Background visible")
		setTimeout(&, 600) do
			textVisible = true
			console.log("✅ Text visible")

		animationFrameId = window.requestAnimationFrame do
			animate!

	def unmount
		if animationFrameId
			window.cancelAnimationFrame(animationFrameId)

	css body
		margin: 0
		padding: 0
		font-family: 'Young Serif', serif

	def render
		<self>
			<div[pos:relative w:100% h:100vh bg:black overflow:hidden ff:'Young Serif' color:white]>
				# Animated Background
				<div[pos:absolute inset:0] style="opacity: {backgroundVisible ? 1 : 0}; transition: opacity 1s;">
					# Dot matrix
					<div[pos:absolute inset:0 pointer-events:none opacity:0.1] style="
						background-image: radial-gradient(circle, #b21f1f 1px, transparent 1px);
						background-size: 15px 15px;
					">

					# SVG Shapes - always render with dot mask
					<svg[pos:absolute inset:0 w:100% h:100% opacity:0.5 pointer-events:none] viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style="
						mask-image: radial-gradient(circle, rgba(255, 255, 255, 1) 1.5px, transparent 1.5px);
						mask-size: 15px 15px;
						-webkit-mask-image: radial-gradient(circle, rgba(255, 255, 255, 1) 1.5px, transparent 1.5px);
						-webkit-mask-size: 15px 15px;
					">
						<defs>
							for shape in shapes
								<linearGradient id="gradient-{shape.id}" x1="0%" y1="0%" x2="100%" y2="100%">
									<stop offset="0%" stop-color=shape.color>
									<stop offset="100%" stop-color=shape.color>

						for shape in shapes
							<g style="transform: translate({shape.x}%, {shape.y}%) rotate({shape.rotation}deg); transform-origin: center;">
								if shape.type === 'triangle'
									<polygon points=getTrianglePoints(shape.size) fill="url(#gradient-{shape.id})" style="mix-blend-mode: screen; filter: blur(0.5px);">
								elif shape.type === 'circle'
									<circle r=(shape.size / 2) fill="url(#gradient-{shape.id})" style="mix-blend-mode: screen; filter: blur(0.5px);">
								elif shape.type === 'square'
									<rect x=(-shape.size / 2) y=(-shape.size / 2) width=shape.size height=shape.size fill="url(#gradient-{shape.id})" style="mix-blend-mode: screen; filter: blur(0.5px);">

				# Content
				<div[pos:relative z:10 w:100% h:100%]>
					# Top Navigation
					<div[pos:absolute top:50px right:50px d:flex gap:15px ai:center c:white fs:24px flex-wrap:wrap] style="
						transition: all 1s;
						opacity: {textVisible ? 1 : 0};
						transform: {textVisible ? 'translateY(0)' : 'translateY(-20px)'};
					">
						<a.fancy-link[color:white td:underline transition:all_0.3s d:inline-block] href="https://github.com/undivisible" @mouseenter=animateLetters>
							for char in "see more at my github"
								<span.letter[d:inline-block transition:all_0.3s]> char
						<a.fancy-link[color:white td:underline transition:all_0.3s d:inline-block] href="https://instagram.com/undivisible.dev" @mouseenter=animateLetters>
							for char in "instagram"
								<span.letter[d:inline-block transition:all_0.3s]> char
						<a.fancy-link[color:white td:underline transition:all_0.3s d:inline-block] href="#" @mouseenter=animateLetters>
							for char in "read my philosophy"
								<span.letter[d:inline-block transition:all_0.3s]> char
						<a.fancy-link[color:white td:underline transition:all_0.3s d:inline-block] href="#" @mouseenter=animateLetters>
							for char in "gizzmoelectronics.com"
								<span.letter[d:inline-block transition:all_0.3s]> char
						<a.fancy-link[color:white transition:all_0.3s d:inline-block] href="#" @mouseenter=animateLetters>
							<span.letter[d:inline-block c:#ff5705 transition:all_0.3s]> "a"
							for char in "technology.company"
								<span.letter[d:inline-block transition:all_0.3s]> char

					# Main Content
					<div[pos:absolute left:50px top:50%] style="
						transition: all 1s;
						transition-delay: 0.3s;
						opacity: {textVisible ? 1 : 0};
						transform: {textVisible ? 'translate(0, -50%)' : 'translate(-30px, -50%)'};
					">
						<div[c:white fs:24px mb:32px]>
							<p[m:0 mb:0 d:flex ai:center gap:0]>
								"Hi. I'm Max Carter. 🇭🇰🇦🇺🇷🇺🇨🇳🇮🇩"
								<img[w:22px h:17px d:inline-block ml:4px mb:2px] src="/static/chechen.png" alt="">
							<p[m:0]> "I make things, think about life and speak languages."
							<p[m:0 mb:16px]> "Here's some of my projects:"

						<div[d:flex gap:15px ai:center c:white fs:24px flex-wrap:wrap]>
							for project in ['soliloquy', 'plates', 'standpoint', 'infrastruct', 'vuno']
								<span[c:white td:underline cursor:pointer transition:all_0.3s d:inline-block]
									@mouseenter=(hoveredProject = project)
									@mouseleave=(hoveredProject = null)
								> project

				if hoveredProject
					<div[pos:absolute left:50px top:calc(50% + 80px) c:white fs:18px lh:1.8 max-width:800px pointer-events:none] style="animation: popup 0.3s ease-out forwards;">
						projectDescriptions[hoveredProject]

global css @keyframes fadeIn
	0%
		opacity: 0
		transform: translateY(-10px)
	100%
		opacity: 1
		transform: translateY(0)

global css @keyframes popup
	0%
		opacity: 0
		transform: translateY(3vh)
	100%
		opacity: 1
		transform: translateY(0)

global css a
	&:hover
		transform: scale(1.05)

global css span
	&:hover
		transform: scale(1.05)

global css .fancy-link
	position: relative

global css .letter
	display: inline-block
	transition: all 0.3s ease

imba.mount <App>

# Add random color on letter hover
if typeof document !== 'undefined'
	setTimeout(&, 1000) do
		const letters = document.querySelectorAll('.letter')
		letters.forEach do(letter)
			letter.addEventListener('mouseenter', do
				const r = Math.floor(Math.random! * 256)
				const g = Math.floor(Math.random! * 256)
				const b = Math.floor(Math.random! * 256)
				letter.style.color = "rgb({r}, {g}, {b})"
				letter.style.transform = "scale(1.2) translateY(-3px)"
			)
			letter.addEventListener('mouseleave', do
				letter.style.color = ""
				letter.style.transform = ""
			)
