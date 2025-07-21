function buttonClicks(btn) {
    switch (btn) {
        case 'R':
            confirm('Are you sure you want to restart the game?') && restartGame()
            break;

        case 'N':
            // Show name for each position on board
            showNotation = !showNotation
            document.getElementById('btnNotation').classList.toggle('clicked')
            break;

        case 'P':
            // Show plays in the DOM 
            showLogs = !showLogs
            document.getElementById('btnHistory').classList.toggle('clicked')
            showPlays()
            break;

        case 'F':
            // Toggle fullscreen mode
            toggleFullscreen()
            document.getElementById('btnFullscreen').classList.toggle('clicked')
            break;

        case 'H':
            showHighlights = !showHighlights
            document.getElementById('btnHighlights').classList.toggle('clicked')
            break;

        default:
            break;
    }
}

function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            console.error(`Error attempting fullscreen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}