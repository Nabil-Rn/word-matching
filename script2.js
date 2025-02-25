document.addEventListener('DOMContentLoaded', () => {
    let selectedFrench = null; // Store the selected French word element
    let score = 0;
    let totalPairs = 0;
    let currentParagraphIndex = -1;
    let paragraphsData = [];
    const paragraphSelect = document.getElementById('paragraph-select');

    // Load and sort paragraphs
    fetch('data2.json')
        .then(response => response.json())
        .then(data => {
            paragraphsData = sortParagraphs(data.paragraphs);
            populateParagraphSelector(paragraphsData);
            if (paragraphsData.length > 0) {
                currentParagraphIndex = 0;
                loadParagraph(currentParagraphIndex);
            }
        });

    // Sort paragraphs alphabetically by title
    function sortParagraphs(paragraphs) {
        return paragraphs.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        darkModeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });

    // Load saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️ Light Mode';
    }

    // Populate paragraph selector dropdown
    function populateParagraphSelector(paragraphs) {
        paragraphSelect.innerHTML = '<option value="-1">Choose a paragraph</option>';
        paragraphs.forEach((para, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = para.title;
            paragraphSelect.appendChild(option);
        });
    }

    // Load a specific paragraph
    function loadParagraph(index) {
        if (index < 0 || index >= paragraphsData.length) return;
        currentParagraphIndex = index;
        paragraphSelect.value = index;
        startGame(paragraphsData[index].pairs);
    }

    // Start the matching game
    function startGame(pairs) {
        const frenchColumn = document.getElementById('french-column');
        const englishColumn = document.getElementById('english-column');

        // Clear previous content
        frenchColumn.innerHTML = '';
        englishColumn.innerHTML = '';
        score = 0;
        document.getElementById('score').textContent = score;
        totalPairs = pairs.length;
        document.getElementById('total').textContent = totalPairs;

        // Create French elements
        pairs.forEach((pair, index) => {
            const div = document.createElement('div');
            div.className = 'word';
            div.textContent = pair.french;
            div.dataset.index = index; // Store the index
            div.dataset.class = pair.class; // Store the class
            div.addEventListener('click', selectFrench);
            frenchColumn.appendChild(div);
        });

        // Create shuffled English elements
        shuffleArray([...pairs]).forEach((pair, index) => {
            const div = document.createElement('div');
            div.className = 'word';
            div.textContent = pair.english;
            div.dataset.index = pairs.indexOf(pair); // Store the original index
            div.dataset.class = pair.class; // Store the class
            div.addEventListener('click', selectEnglish);
            englishColumn.appendChild(div);
        });
    }

    // Shuffle array function
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Restart the current paragraph
    function restartGame() {
        if (currentParagraphIndex === -1) return;
        loadParagraph(currentParagraphIndex);
    }

    // Load the next paragraph
    function nextParagraph() {
        if (paragraphsData.length === 0) return;
        const nextIndex = (currentParagraphIndex + 1) % paragraphsData.length;
        loadParagraph(nextIndex);
    }

    // Select a French word
    function selectFrench(e) {
        if (e.target.classList.contains('matched')) return;
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        selectedFrench = e.target; // Store the clicked element
        e.target.classList.add('selected');
    }

    function selectEnglish(e) {
        if (!selectedFrench || e.target.classList.contains('matched')) return;

        // Check if the indices match (i.e., they are the correct pair)
        if (selectedFrench.dataset.index === e.target.dataset.index) {
            // Mark both as matched
            if (selectedFrench) selectedFrench.classList.add('matched'); // Null check
            e.target.classList.add('matched');
            document.getElementById('score').textContent = ++score;

            if (score === totalPairs) {
                // Optional: Add completion feedback
            }
        } else {
            // Optional: Provide feedback for incorrect match (e.g., shake animation)
            if (selectedFrench) selectedFrench.classList.add('incorrect'); // Null check
            e.target.classList.add('incorrect');
            setTimeout(() => {
                if (selectedFrench) selectedFrench.classList.remove('incorrect'); // Null check
                e.target.classList.remove('incorrect');
            }, 500);
        }

        // Reset selection
        selectedFrench = null;
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    }

    // Event listeners
    paragraphSelect.addEventListener('change', (e) => loadParagraph(parseInt(e.target.value)));
    document.getElementById('restart').addEventListener('click', restartGame);
    document.getElementById('next').addEventListener('click', nextParagraph);
});