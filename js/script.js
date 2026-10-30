(function () {
    "use strict";

    var welcome = document.getElementById("welcome");
    var main = document.getElementById("birthday-page");
    var song = document.getElementById("birthday-song");
    var backgroundVideo = document.getElementById("background-video");
    var wishButton = document.getElementById("make-wish");
    var wishMessage = document.getElementById("wish-message");
    var letterStep = document.getElementById("letter-step");
    var openLetterButton = document.getElementById("open-letter");
    var letter = document.getElementById("birthday-letter");
    var scrollHint = document.getElementById("scroll-hint");
    var memoriesStep = document.getElementById("memories-step");
    var finalStep = document.getElementById("final-step");
    var photoInput = document.getElementById("memory-photos");
    var memoryGrid = document.getElementById("memory-grid");
    var emptyAlbum = document.getElementById("empty-album");
    var roseReveal = document.getElementById("rose-reveal");
    var wishTypedMessage = document.getElementById("wish-typed-message");
    var wishAnnouncement = document.getElementById("wish-announcement");
    var wishIndicators = document.getElementById("wish-indicators");
    var canvas = document.getElementById("confetti");
    var celebrationOverlay = document.getElementById("celebration-overlay");
    var celebrationParticles = document.getElementById("celebration-particles");
    var context = canvas.getContext("2d");
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var animationFrame = null;
    var celebrationTimer = null;
    var particles = [];
    var wishMessageIndex = 0;
    var wishMessages = [
        "One year older, ten times hotter..",
        "May all your delulu come trululu..",
        "Have a purrfect birthday..",
        "A million extra wishes to you!..",
        "You are a limited edition with unlimited potential..",
        "You are flippin' awesome..",
        "Wishing you a rizzful year ahead..",
        "Roses are red, skies are blue.. I just wanna say Happy Birthday to you <3...",
        "Hope your birthday lights up with dreams and stars..."
    ];

    wishMessages.forEach(function (_, index) {
        var indicator = document.createElement("span");
        indicator.className = "wish-indicator";
        indicator.setAttribute("aria-hidden", "true");
        wishIndicators.appendChild(indicator);
    });

    var recipient = new URLSearchParams(window.location.search).get("name");
    if (recipient && recipient.trim()) {
        recipient = recipient.trim().slice(0, 60);
        document.getElementById("name").textContent = recipient;
        document.getElementById("letter-name").textContent = recipient;
    }

    [
        "IMG_20240603_214305_471.jpg",
        "IMG_20240403_191203_884.jpg",
        "IMG_20240218_184306_596.jpg",
        "IMG_20240216_224144_016.jpg",
        "IMG_20240116_222153_502.jpg",
        "IMG_20230316_214842_752.jpg",
        "img.jpg",
        "IMG-20240510-WA0032.jpg",
        "IMG-20240705-WA0002.jpg"
    ].forEach(function (filename, index) {
        addMemoryPhoto("photos/" + filename, "A favorite memory " + (index + 1), false);
    });

    document.getElementById("play").addEventListener("click", function () {
        welcome.hidden = true;
        main.hidden = false;
        document.getElementById("birthday-title").focus();

        var videoPlayback = backgroundVideo.play();
        if (videoPlayback && typeof videoPlayback.catch === "function") {
            videoPlayback.catch(function () {
                backgroundVideo.controls = true;
            });
        }

        var playback = song.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(function () {
                song.controls = true;
                song.classList.add("song--available");
            });
        }
    });

    var greetings = [
        "Wishing you a day as lovely as you are.",
        "May this year bring you a million little reasons to smile.",
        "Today, the world gets to celebrate you."
    ];
    var greetingIndex = 0;
    window.setInterval(function () {
        var typed = document.getElementById("typed");
        greetingIndex = (greetingIndex + 1) % greetings.length;
        typed.textContent = greetings[greetingIndex];
    }, 4200);

    wishButton.addEventListener("click", function () {
        wishButton.disabled = true;
        wishMessage.hidden = false;
        celebrate(wishButton);

        window.setTimeout(function () {
            letterStep.hidden = false;
            openLetterButton.focus({ preventScroll: true });
            letterStep.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        }, reducedMotion ? 0 : 2400);
    });

    openLetterButton.addEventListener("click", function () {
        if (!letter.hidden) {
            return;
        }

        letter.hidden = false;
        openLetterButton.setAttribute("aria-expanded", "true");
        scrollHint.hidden = false;
        memoriesStep.hidden = false;
        finalStep.hidden = false;
        window.setTimeout(function () {
            letter.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
        }, 80);
    });

    photoInput.addEventListener("change", function () {
        var files = Array.prototype.slice.call(photoInput.files || []);
        files.forEach(function (file) {
            if (!file.type || file.type.indexOf("image/") !== 0) {
                return;
            }

            addMemoryPhoto(URL.createObjectURL(file), "Memory photo: " + file.name, true);
        });

        photoInput.value = "";
    });

    document.getElementById("answer-yes").addEventListener("click", function () {
        roseReveal.hidden = false;
        document.getElementById("answer-yes").disabled = true;
        startWishMessageSequence();
        celebrate(document.getElementById("answer-yes"));
        roseReveal.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    });

    function resizeCanvas() {
        var ratio = Math.min(window.devicePixelRatio || 1, 2);
        var viewportWidth = document.documentElement.clientWidth;
        canvas.width = Math.round(viewportWidth * ratio);
        canvas.height = Math.round(window.innerHeight * ratio);
        canvas.style.width = viewportWidth + "px";
        canvas.style.height = window.innerHeight + "px";
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function addMemoryPhoto(source, captionText, isUpload) {
        var figure = document.createElement("figure");
        var image = document.createElement("img");
        var caption = document.createElement("figcaption");

        image.src = source;
        image.alt = isUpload ? captionText : "A special birthday memory";
        image.loading = "lazy";
        caption.textContent = captionText;
        figure.className = "memory-card";
        figure.appendChild(image);
        figure.appendChild(caption);
        memoryGrid.appendChild(figure);
        emptyAlbum.hidden = true;
    }

    function startWishMessageSequence() {
        var indicators = wishIndicators.children;
        var message = wishMessages[wishMessageIndex];
        var characterIndex = 0;

        Array.prototype.forEach.call(indicators, function (indicator, index) {
            indicator.classList.toggle("is-active", index === wishMessageIndex);
        });
        wishTypedMessage.textContent = "";
        wishAnnouncement.textContent = "";

        function typeNextCharacter() {
            if (characterIndex < message.length) {
                wishTypedMessage.textContent += message.charAt(characterIndex);
                characterIndex += 1;
                window.setTimeout(typeNextCharacter, reducedMotion ? 0 : 55);
                return;
            }

            wishAnnouncement.textContent = message;
            window.setTimeout(function () {
                wishMessageIndex = (wishMessageIndex + 1) % wishMessages.length;
                startWishMessageSequence();
            }, reducedMotion ? 4000 : 2600);
        }

        typeNextCharacter();
    }

    function celebrate(button) {
        var bounds = button.getBoundingClientRect();
        var originX = bounds.left + bounds.width / 2;
        var originY = bounds.top + bounds.height / 2;
        var colors = ["#bd526c", "#f0ac62", "#f4d477", "#9a76b8", "#78a98e"];
        showCelebration(originX, originY, colors);

        for (var index = 0; index < 280; index += 1) {
            var angle = -Math.PI / 2 + (Math.random() - 0.5) * 2.7;
            var speed = 6 + Math.random() * 11;
            particles.push({
                x: originX,
                y: originY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                gravity: 0.14 + Math.random() * 0.12,
                size: 7 + Math.random() * 10,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.24,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: index % 4 === 0 ? "star" : index % 3 === 0 ? "streamer" : "confetti",
                life: 130 + Math.random() * 55
            });
        }

        for (var showerIndex = 0; showerIndex < 200; showerIndex += 1) {
            particles.push({
                x: Math.random() * window.innerWidth,
                y: -Math.random() * window.innerHeight * 0.12,
                vx: (Math.random() - 0.5) * 2.5,
                vy: 4 + Math.random() * 5,
                gravity: 0.035,
                size: 7 + Math.random() * 9,
                rotation: Math.random() * Math.PI,
                spin: (Math.random() - 0.5) * 0.15,
                color: colors[Math.floor(Math.random() * colors.length)],
                shape: showerIndex % 5 === 0 ? "star" : showerIndex % 3 === 0 ? "streamer" : "confetti",
                life: 210 + Math.random() * 50
            });
        }

        if (reducedMotion) {
            drawStaticBurst();
            return;
        }

        if (animationFrame === null) {
            animationFrame = window.requestAnimationFrame(drawConfetti);
        }
    }

    function showCelebration(originX, originY, colors) {
        var symbols = ["✦", "★", "♥", "✧", "●", "◆"];
        var viewportWidth = document.documentElement.clientWidth;

        window.clearTimeout(celebrationTimer);
        celebrationParticles.replaceChildren();
        celebrationOverlay.hidden = false;

        for (var index = 0; index < 56; index += 1) {
            var angle = (Math.PI * 2 * index / 56) + (Math.random() - 0.5) * 0.3;
            var distance = 90 + Math.random() * Math.min(viewportWidth * 0.45, 260);
            var horizontalTravel = Math.cos(angle) * distance;
            var verticalTravel = Math.sin(angle) * distance - 45;
            var piece = document.createElement("span");
            var spin = (Math.random() - 0.5) * 760;
            var endHorizontalTravel = horizontalTravel * 1.2;
            var endVerticalTravel = verticalTravel + 130 + Math.random() * 150;

            piece.className = "celebration-piece";
            piece.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            piece.style.setProperty("--start-x", (reducedMotion ? Math.random() * viewportWidth : originX) + "px");
            piece.style.setProperty("--start-y", (reducedMotion ? Math.random() * window.innerHeight : originY) + "px");
            piece.style.setProperty("--burst-x", horizontalTravel + "px");
            piece.style.setProperty("--burst-y", verticalTravel + "px");
            piece.style.setProperty("--end-x", endHorizontalTravel + "px");
            piece.style.setProperty("--end-y", endVerticalTravel + "px");
            piece.style.setProperty("--piece-spin", spin + "deg");
            piece.style.setProperty("--end-spin", spin * 1.7 + "deg");
            piece.style.setProperty("--piece-color", colors[index % colors.length]);
            piece.style.setProperty("--piece-size", (14 + Math.random() * 22) + "px");
            piece.style.setProperty("--piece-duration", (reducedMotion ? 2 : 4.4 + Math.random() * 0.8) + "s");
            piece.style.setProperty("--piece-delay", (reducedMotion ? 0 : Math.random() * 0.25) + "s");
            celebrationParticles.appendChild(piece);
        }

        celebrationTimer = window.setTimeout(function () {
            celebrationOverlay.hidden = true;
            celebrationParticles.replaceChildren();
        }, reducedMotion ? 2200 : 6400);
    }

    function drawStaticBurst() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles.forEach(function (particle) {
            context.fillStyle = particle.color;
            context.fillRect(
                particle.x + particle.vx * 5,
                particle.y + particle.vy * 5,
                particle.size,
                particle.size * 0.65
            );
        });
        window.setTimeout(function () {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            particles = [];
        }, 700);
    }

    function drawConfetti() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        particles = particles.filter(function (particle) {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += particle.gravity;
            particle.rotation += particle.spin;
            particle.life -= 1;

            if (particle.life <= 0 || particle.y > window.innerHeight + 20) {
                return false;
            }

            context.save();
            context.translate(particle.x, particle.y);
            context.rotate(particle.rotation);
            context.fillStyle = particle.color;
            if (particle.shape === "star") {
                drawStar(particle.size);
            } else if (particle.shape === "streamer") {
                context.strokeStyle = particle.color;
                context.lineWidth = Math.max(2, particle.size / 3);
                context.beginPath();
                context.moveTo(-particle.size, 0);
                context.bezierCurveTo(-particle.size / 2, -particle.size, particle.size / 2, particle.size, particle.size, 0);
                context.stroke();
            } else {
                context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.65);
            }
            context.restore();
            return true;
        });

        if (particles.length) {
            animationFrame = window.requestAnimationFrame(drawConfetti);
        } else {
            context.clearRect(0, 0, window.innerWidth, window.innerHeight);
            animationFrame = null;
        }
    }

    function drawStar(size) {
        context.beginPath();
        for (var point = 0; point < 10; point += 1) {
            var angle = -Math.PI / 2 + point * Math.PI / 5;
            var radius = point % 2 === 0 ? size : size * 0.45;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            if (point === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fill();
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
}());
