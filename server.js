const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// --- Path for history file ---
const historyFilePath = path.join(__dirname, 'history.json');

// --- Load history from file on startup ---
let history = [];
if (fs.existsSync(historyFilePath)) {
    const data = fs.readFileSync(historyFilePath, 'utf8');
    try {
        history = JSON.parse(data);
    } catch (err) {
        console.log('Error parsing history.json, starting fresh.');
        history = [];
    }
}

// --- Movie dataset (sample, add more 100+ movies similarly) ---
const movies = {
    "avengers endgame": {title:"Avengers: Endgame", release:"26 April 2019", genre:"Action, Adventure, Sci-Fi", length:"181 min", episodes:"1", platform:"Disney+"},
    "inception": {title:"Inception", release:"16 Jul 2010", genre:"Sci-Fi/Thriller", length:"148 min", episodes:"1", platform:"Netflix"},
    "interstellar": {title:"Interstellar", release:"7 Nov 2014", genre:"Adventure, Drama, Sci-Fi", length:"169 min", episodes:"1", platform:"Amazon Prime"},
    "the dark knight": {title:"The Dark Knight", release:"18 Jul 2008", genre:"Action, Crime, Drama", length:"152 min", episodes:"1", platform:"Netflix"},
    "joker": {title:"Joker", release:"4 Oct 2019", genre:"Crime, Drama, Thriller", length:"122 min", episodes:"1", platform:"HBO Max"},
    "parasite": {title:"Parasite", release:"30 May 2019", genre:"Comedy, Drama, Thriller", length:"132 min", episodes:"1", platform:"Hulu"},
    // continue adding 100+ movies here
};

// --- Greeting dataset ---
const greetings = [
    "Hi there! Welcome to Movie Zone 🎬. Ask me about any movie or series!",
    "Hello! I'm your Movie Zone Bot. I can give you details about movies and series.",
    "Hey! Type the name of a movie or series and I’ll fetch its info.",
    "Hi! Ready to explore movies and series? Ask me anything.",
    "Greetings! Ask me about any movie or series and I'll tell you the details.",
];

// --- Save history to file ---
function saveHistoryFile() {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
}

// --- Get bot reply ---
function getBotReply(message) {
    const msgLower = message.toLowerCase().trim();

    // Greetings handling
    const greetingKeywords = ['hi','hello','hey','how are you','greetings'];
    if (greetingKeywords.some(g => msgLower.includes(g))) {
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Movie info
    if (movies[msgLower]) {
        const m = movies[msgLower];
        return `<b>${m.title}</b>
            <table class="movie-table">
            <tr><th>Attribute</th><th>Details</th></tr>
            <tr><td>Release Date</td><td>${m.release}</td></tr>
            <tr><td>Genre</td><td>${m.genre}</td></tr>
            <tr><td>Length</td><td>${m.length}</td></tr>
            <tr><td>Episodes</td><td>${m.episodes}</td></tr>
            <tr><td>OTT Platform</td><td>${m.platform}</td></tr>
            </table>`;
    }

    // Default fallback
    return "Sorry, I don't have that movie info.";
}

// --- Chat API ---
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const reply = getBotReply(message);

    // Add to history
    history.push({ text: message, type: 'user' });
    history.push({ text: reply, type: 'bot' });
    saveHistoryFile();

    res.json({ reply });
});

// --- Fetch history API ---
app.get('/api/history', (req, res) => {
    res.json({ history });
});

// --- Start server ---
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
