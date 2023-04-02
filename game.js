// Get width and height of webview
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

// Split width and height into columns and rows of 32 pixels
const NUMBER_OF_COLS = Math.round(WIDTH / 32);
const NUMBER_OF_ROWS = Math.round(HEIGHT / 32);

// Initialise Kaboom. with width and height and a plain white background
kaboom({
    width: WIDTH,
    height: HEIGHT,
    background: [255, 255, 255]
});

loadRoot("https://i.ibb.co/"); // ImgBB server as root directory for graphics

// Kaboom appears to have some issues with getting graphics from local storage
// Load graphics for floor, obstacle, and player as sprites
loadSprite("floor", "2qNxmjx/floor.png");
loadSprite("obstacle", "yhxQFwV/obstacle.png");
loadSprite("player", "phSywtR/player.png");

// Main scene; this will be the game itself
scene("main", () => {
    const player = add([
        sprite("player"),
        area(),
        pos(0, 32*(NUMBER_OF_ROWS-2)),
        body(),
        solid()
    ]); // Setup player sprite

    const score = add([
        text("Score: 0", {
            size: 25
        }),
        pos(0, 0),
        color(0, 0, 0),
        { value: 0 }
    ]) // Setup score text

    // Generate map based on width and height of page
    var map = [];
    
    for (let y = 0; y < NUMBER_OF_ROWS; y++) { // Loop y from 0 to NUMBER_OF_ROWS
        let row = ""; // Start row as an empty string
    
        for (let x = 0; x < NUMBER_OF_COLS; x++) { // Loop x from 0 to NUMBER_OF_COLS
            if (y == NUMBER_OF_ROWS-1) { // The final row will be the floor
                row += "F"; // Add 'F' for Kaboom to parse later on
            } else { // Otherwise
                row += " "; // Add empty space; this will be ignored
            }
        }
    
        map.push(row); // Push row to map
    }
    
    addLevel(map, {
        width: 32,
        height: 32,
        "F": () => [
            sprite("floor"),
            area(),
            solid()
        ] // Spawn the floor sprite for F on the map
    });
    
    let lastObstacle = 0; // Define lastObstacle; this will be used to avoid multiple obstacles appearing next to one another
    
    loop(0.2, () => { // Every 200 milliseconds
        let obstacleChance = Math.floor(Math.random() * 2); // Randomly pick number between 0 and 1 and round it
        if (lastObstacle > 3 && obstacleChance == 1) { // Make sure there is space between obstacles and obstacleChance is 1
            add([
                sprite("obstacle"),
                area(),
                pos(32*(NUMBER_OF_COLS-1), 32*(NUMBER_OF_ROWS-2)),
                body(),
                solid(),
                "obstacle"
            ]); // Setup obstacle
            lastObstacle = 0; // Reset lastObstacle to 0
        } else { 
            lastObstacle++; // Increment lastObstacle
        }
    });
    
    onUpdate("obstacle", (obstacle) => { // Update "obstacle" every frame
        obstacle.move(-200, 0); // Move to the left at speed of 200/s
        if (obstacle.pos.x < -32) { // Player has avoided the obstacle
            score.value++; // Increment score
            score.text = "Score: " + score.value; // Update score text
            destroy(obstacle); // Stop counting any further to score
        }
    });
    
    onKeyPress("space", () => { // When the space key is pressed
        player.jump(500); // Jump at speed 500/s
    });

    onClick(() => { // When mouse is clicked
        player.jump(500);
    });

    player.collides("obstacle", () => { // When player collides with any obstacle
        shake(10); // Shake camera mildly
        // Wait half a second before switching to Game Over scene
        setTimeout(() => {
            go("game-over", score.value);
        }, 500);
    })
});

// Game Over scene; this will appear when the player collides with an obstacle
scene("game-over", (score) => {
    add([
        text("Game Over\nYour score was "+score+"\nPress any key to play again", {
            size: 35
        }),
        pos(center()),
        origin("center"),
        color(0, 0, 0)
    ]); // Setup three lines of text informing game is over, the score, and to press any key to restart

    onKeyPress(() => { // Any key pressed
        go("main"); // Go to Main scene
    });
});

go("main");