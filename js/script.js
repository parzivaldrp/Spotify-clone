console.log("lets write javascript");

let currentSong = new Audio();
let songs = [];
let currFolder;
let currentTrack = "";

// Utility function to format time in MM:SS
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Fetch songs from the specified folder
async function getSongs(folder) {
    currFolder = folder;

    try {

let response = await fetch(`./${folder}/tracks.json`);
songs = await response.json();
 let songUL = document.querySelector(".content ul");
        songUL.innerHTML = songs.map(song => `
            <li>
                <img src="svgs/music.svg" alt="">
                <div class="info">
                    <div>${decodeURIComponent(song).replaceAll("%20", " ")}</div>
                </div>
                <img src="svgs/play.svg" alt="">
            </li>`).join('');

             Array.from(songUL.getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", element => {
                playMusic(e.querySelector(".info").textContent.trim());
            });
        });

        document.querySelector(".songFolderName").textContent = decodeURIComponent(folder.split("/").pop());

    }

    catch (err){
        console.error(`Could not fetch songs from ${folder}/tracks.json`, err);
    }
  /*  
    let response = await fetch(`./songs/${folder}/`);
    let html = await response.text();
    let div = document.createElement("div");
    div.innerHTML = html;
    let anchors = div.getElementsByTagName("a");
    songs = Array.from(anchors)
        .filter(anchor => anchor.href.endsWith(".mp3"))
        .map(anchor => anchor.href.split(`/${folder}/`)[1]);

    let songUL = document.querySelector(".content ul");
    songUL.innerHTML = songs.map(song => `
        <li>
            <img src="svgs/music.svg" alt="">
            <div class="info">
                <div>${decodeURIComponent(song).replaceAll("%20", " ")}</div>
            </div>
            <img src="svgs/play.svg" alt="">
        </li>`).join('');

    Array.from(songUL.getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").textContent.trim());
        });
    });

    document.querySelector(".songFolderName").textContent = decodeURIComponent(folder.split("/").pop());

    */
}

// Play the specified track
const playMusic = (track, pause = false) => {

    currentTrack = track;
    currentSong.src = `./${currFolder}/${track}`;   


    if (!pause) {
        currentSong.play();
        play.src = "svgs/pause.svg";
    }

    document.querySelector(".songName").textContent = decodeURI(track);
    document.querySelector(".songTime").textContent = "00:00/00:00";
    document.querySelector(".songsTime2").textContent = "00:00/00:00";
}

// Fetch and display albums
async function displayAlbums() {
    console.log("display albums");

    try {
        let response = await fetch(`./songs/songs.json`);
        let albums =  await response.json();
        let cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        for (let albumInfo of albums) {
            let folder = albumInfo.folder;
            if (!folder || folder.toLowerCase() === "songs") continue;

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="1.5" stroke-linejoin="round">
                            <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" />
                        </svg>
                    </div>
                    <img id="resI" src="/songs/${folder}/songcover1.jpeg" alt="song">
                    <h3 id="resT">${albumInfo.title}</h3>
                    <p id="resD">${albumInfo.description}</p>
                </div>`;
        }


        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async item => {
                await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                playMusic(songs[0]);
            });
        });
    }
    catch (error) {
        console.error("Error fetching albums:", error);
        return;
    }

}

// Main function to initialize the player
async function main() {
    await getSongs("./songs/Music");
    playMusic(songs[0], true);
    await displayAlbums();

    let play = document.getElementById("play");
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "svgs/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        const currentTime = currentSong.currentTime;
        const duration = currentSong.duration;
        if (duration && !isNaN(currentTime)) {
            const percent = (currentTime / duration) * 100;
            document.querySelector(".songTime").textContent = `${secondsToMinutesSeconds(currentTime)}/${secondsToMinutesSeconds(duration)}`;
            document.querySelector(".songsTime2").textContent = `${secondsToMinutesSeconds(currentTime)}/${secondsToMinutesSeconds(duration)}`;
            document.querySelector(".circle").style.left = percent + "%";
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });


    let previous = document.getElementById("previous");
    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentTrack);
        if (index > 0) {
            playMusic(songs[index - 1]);
        }
    });

    let next = document.getElementById("next");
    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentTrack);
        if (index >= 0 && index < songs.length - 1) {
            playMusic(songs[index + 1]);
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.10;
            document.querySelector(".range input").value = 10;
        }
    });
}

main();
