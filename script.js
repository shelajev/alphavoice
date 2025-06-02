const letterDisplay = document.getElementById('letter-display');
const micButton = document.getElementById('mic-button');
const scoreDisplay = document.getElementById('score');
const streakDisplay = document.getElementById('streak');
const feedbackDisplay = document.getElementById('feedback');
const body = document.body;

const englishAlphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const allLetters = englishAlphabet;

let currentLetter = '';
let score = 0;
let streak = 0;
let newLetterPending = false; // Flag to manage button state during correct answer processing
let recognition;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US'; // Default, can be changed
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
        const spokenText = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        checkAnswer(spokenText);
    };

    recognition.onerror = (event) => {
        feedbackDisplay.textContent = 'Error recognizing speech: ' + event.error;
        feedbackDisplay.style.color = 'red';
        micButton.disabled = false;
        micButton.textContent = 'Press to Speak';
    };

    recognition.onend = () => {
        if (!newLetterPending) { // Only reset button if not waiting for new letter after correct
            micButton.disabled = false;
            micButton.textContent = 'Press to Speak';
        }
        // If newLetterPending is true, the timeout in checkAnswer will handle
        // re-enabling the button and setting the text appropriately after the new letter.
    };

} else {
    feedbackDisplay.textContent = 'Speech recognition not supported in this browser.';
    micButton.disabled = true;
    micButton.style.backgroundColor = 'grey';
}

function getRandomLetter() {
    const randomIndex = Math.floor(Math.random() * allLetters.length);
    return allLetters[randomIndex];
}

function displayNewLetter() {
    currentLetter = getRandomLetter();
    letterDisplay.textContent = currentLetter;
    feedbackDisplay.textContent = '';
    feedbackDisplay.style.color = ''; // Reset color
    // Dynamically set lang for recognition based on char
    recognition.lang = 'en-US'; // Default to English
}

function checkAnswer(spoken) {
    // Normalize spoken input, e.g. "capital a" -> "a" or "big a" -> "a"
    // Or "letter a" -> "a"
    let normalizedSpoken = spoken.replace(/^(capital|big|letter|väike|suur|täht)\s/i, '').trim();
    if (normalizedSpoken.length > 1) { // if it's a word, try to take the first letter
        normalizedSpoken = normalizedSpoken.charAt(0);
    }


    if (normalizedSpoken.toLowerCase() === currentLetter.toLowerCase()) {
        score++;
        streak++;
        feedbackDisplay.textContent = 'Correct!';
        feedbackDisplay.style.color = 'green';

        newLetterPending = true;
        micButton.textContent = 'Correct!'; // Indicate status on the button
        micButton.disabled = true;        // Keep button disabled during feedback

        setTimeout(() => {
            displayNewLetter(); // This updates the letter and also clears feedbackDisplay
            micButton.disabled = false; // Now enable the button
            micButton.textContent = 'Press to Speak'; // Set final button text
            newLetterPending = false; // Reset the flag
        }, 1500); // Keep the delay for "Correct!" feedback visibility
    } else {
        streak = 0;
        feedbackDisplay.textContent = `Incorrect. You said: "${spoken}". Correct was: "${currentLetter}"`;
        feedbackDisplay.style.color = 'red';
        // Do not automatically advance on incorrect answer
    }
    updateStats();
    updateBackgroundColor();
}

function updateStats() {
    scoreDisplay.textContent = score;
    streakDisplay.textContent = streak;
}

const rainbowColors = [
    '#F0F0F0', // Default
    '#9B59B6', // Purple
    '#8E44AD',
    '#3498DB', // Blue
    '#2980B9',
    '#1ABC9C', // Turquoise
    '#16A085',
    '#2ECC71', // Green
    '#27AE60',
    '#F1C40F', // Yellow
    '#F39C12', // Orange
    '#E67E22',
    '#D35400', // Darker Orange
    '#E74C3C', // Red
    '#C0392B'  // Darker Red
];

function updateBackgroundColor() {
    // Cycle through rainbow colors based on streak, repeating if streak is high
    const colorIndex = streak > 0 ? ((streak -1) % (rainbowColors.length -1)) + 1 : 0;
    body.style.backgroundColor = rainbowColors[colorIndex];
}


micButton.addEventListener('mousedown', () => {
    if (recognition && !micButton.disabled) {
        try {
            micButton.disabled = true;
            micButton.textContent = 'Listening...';
            feedbackDisplay.textContent = '';
            recognition.start();
        } catch (e) {
            // Handle cases where recognition might already be started or other errors
            console.error("Error starting recognition:", e);
            feedbackDisplay.textContent = 'Could not start listening. Please try again.';
            micButton.disabled = false;
            micButton.textContent = 'Press to Speak';
        }
    }
});

micButton.addEventListener('mouseup', () => {
    if (recognition && micButton.textContent === 'Listening...') {
        recognition.stop();
        // onend will re-enable the button
    }
});


// Initial setup
displayNewLetter();
updateStats();
updateBackgroundColor();

feedbackDisplay.addEventListener('click', () => {
    // If the feedback message is an error (indicated by red color)
    if (feedbackDisplay.style.color === 'red') {
        displayNewLetter();
    }
}); 