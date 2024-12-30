import axios from 'axios';

document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username-input');
    const fetchButton = document.getElementById('fetch-stats');
    const statsContainer = document.getElementById('stats-container');
    const minutesListenedImg = document.querySelector('#minutes-listened img');
    const topSongImg = document.querySelector('#top-song img');
    const topFiveImg = document.querySelector('#top-5-songs img');
    const genreEvolutionImgs = document.querySelectorAll('#genre-evolution img');
    const finalImg = document.querySelector('#finalimage img');
    const modeToggle = document.getElementById('mode-toggle');
    const modeToggleIcon = modeToggle.querySelector('i');
    const progressContainer = document.querySelector('.progress-container');
    const progressBar = document.querySelector('.progress-bar');
    const loadingScreen = document.querySelector('.loading-screen');
    const dimmer = document.querySelector('.dimmer');

    var total_minutes = 0;

    const savedMode = localStorage.getItem('spotify-stats-mode') || 'dark';
    document.documentElement.className = savedMode + '-mode';
    modeToggleIcon.className = savedMode === 'dark' 
        ? 'fas fa-moon' 
        : 'fas fa-sun';

    modeToggle.addEventListener('click', () => {
        const currentMode = document.documentElement.className.includes('dark-mode') ? 'dark' : 'light';
        const newMode = currentMode === 'dark' ? 'light' : 'dark';
        
        document.documentElement.className = newMode + '-mode';
        localStorage.setItem('spotify-stats-mode', newMode);
        
        modeToggleIcon.className = newMode === 'dark' 
            ? 'fas fa-moon' 
            : 'fas fa-sun';
    });

    const loadImage = (img, imageData) => {
        return new Promise((resolve, reject) => {
            img.onload = () => {
                img.classList.add('image-loaded');
                resolve();
            };
            img.onerror = reject;
            img.src = "data:image/png;base64, " + imageData;
        });
    };

    const loadImages = (img, images) => {
        for (var i = 0; i < 3; i++) {
            img[i].src = "data:image/png;base64, " + images[i];
            img[i].classList.add('image-loaded');
        }
    };

    const resetProgressBar = () => {
        progressContainer.style.opacity = '0';
        progressBar.style.width = '0';
    };

    const updateProgressBar = (progress) => {
        progressContainer.style.opacity = '1';
        let currwidth = Number(progressBar.style.width.replace("%", "").replace("px", ""));
        progressBar.style.width = `${currwidth + progress}%`;
    };

    const enableLoadingScreen = () => {
        loadingScreen.style.display = '';
        dimmer.style.opacity = '1';
    }

    const disableLoadingScreen = () => {
        loadingScreen.style.display = 'none';
        dimmer.style.opacity = '0';
    }
    disableLoadingScreen();

    fetchButton.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        
        if (!username) {
            alert('Please enter a username');
            return;
        }

        statsContainer.classList.add('stats-hidden');
        minutesListenedImg.classList.remove('image-loaded');
        topSongImg.classList.remove('image-loaded');
        minutesListenedImg.src = '';
        topSongImg.src = '';
        resetProgressBar();
        enableLoadingScreen();


        try {
            await axios.get(`/api/isuserprocessable/${username}`).then(res => {
                let data = res.data;
                if (!data.processable) {
                    throw Error(`Can't process user! (${data.error})`);
                }
            });
            updateProgressBar(0);
            let reqs = [
                axios.get(`/api/minuteslistened/${username}`, {timeout: 0}).then(res => {
                    loadImage(minutesListenedImg, res.data.image);
                    total_minutes = res.data.minutes;
                    updateProgressBar(20);
                }),
                axios.get(`/api/topsong/${username}`, {timeout: 0}).then(res => {
                    loadImage(topSongImg, res.data.image);
                    updateProgressBar(20);
                }),
                axios.get(`/api/top5songs/${username}`, {timeout: 0}).then(res => {
                    loadImage(topFiveImg, res.data.image);
                    updateProgressBar(20);
                }),
                axios.get(`/api/genreevolution/${username}`, {timeout: 0}).then(res => {
                    loadImages(genreEvolutionImgs, res.data.images);
                    updateProgressBar(20);
                }),
            ]
            Promise.all(reqs).then(() => {
                axios.get(`/api/finalimage/${username}/${total_minutes}`, {timeout: 0}).then(res => {
                    loadImage(finalImg, res.data.image);
                    updateProgressBar(20);
                    statsContainer.classList.remove('stats-hidden');
                
                    setTimeout(resetProgressBar, 500);
                    disableLoadingScreen();
                });
            });
        } catch (error) {
            alert(`Failed to retrieve stats. ${error}`);
            resetProgressBar();
            disableLoadingScreen();
        }
    });
});