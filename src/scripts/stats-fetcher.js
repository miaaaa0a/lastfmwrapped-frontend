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
        progressBar.style.width = `${progress}%`;
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
            updateProgressBar(0);
            const minutesResponse = await fetch(`http://127.0.0.1:8000/api/minuteslistened/${username}`);
            const minutesData = await minutesResponse.json();
            updateProgressBar(20);

            const topSongResponse = await fetch(`http://127.0.0.1:8000/api/topsong/${username}`);
            const topSongData = await topSongResponse.json();
            updateProgressBar(40);

            const topFiveResponse = await fetch(`http://127.0.0.1:8000/api/top5songs/${username}`);
            const topFiveData = await topFiveResponse.json();
            updateProgressBar(60);

            const genreEvolutionResponse = await fetch(`http://127.0.0.1:8000/api/genreevolution/${username}`);
            const genreEvolutionData = await genreEvolutionResponse.json();
            updateProgressBar(80);

            const finalResponse = await fetch(`http://127.0.0.1:8000/api/finalimage/${username}`);
            const finalData = await finalResponse.json();
            updateProgressBar(99);

            await Promise.all([
                loadImage(minutesListenedImg, minutesData.image),
                loadImage(topSongImg, topSongData.image),
                loadImage(topFiveImg, topFiveData.image),
                loadImage(finalImg, finalData.image)
            ]);
            loadImages(genreEvolutionImgs, genreEvolutionData.images);

            statsContainer.classList.remove('stats-hidden');
            updateProgressBar(100);
            
            setTimeout(resetProgressBar, 500);
            disableLoadingScreen();

        } catch (error) {
            console.error('Error fetching stats:', error);
            alert('Failed to retrieve stats. Please check the username and try again.');
            resetProgressBar();
            disableLoadingScreen();
        }
    });
});