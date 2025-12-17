const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files like index.html

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

// --- Movie dataset ---
const movies = {
    "avengers endgame": {title:"Avengers: Endgame", release:"26 April 2019", genre:"Action, Adventure, Sci-Fi", length:"181 min", episodes:"1", platform:"Disney+"},
    "inception": {title:"Inception", release:"16 Jul 2010", genre:"Sci-Fi/Thriller", length:"148 min", episodes:"1", platform:"Netflix"},
    "interstellar": {title:"Interstellar", release:"7 Nov 2014", genre:"Adventure, Drama, Sci-Fi", length:"169 min", episodes:"1", platform:"Amazon Prime"},
    "the dark knight": {title:"The Dark Knight", release:"18 Jul 2008", genre:"Action, Crime, Drama", length:"152 min", episodes:"1", platform:"Netflix"},
    "joker": {title:"Joker", release:"4 Oct 2019", genre:"Crime, Drama, Thriller", length:"122 min", episodes:"1", platform:"HBO Max"},
    "parasite": {title:"Parasite", release:"30 May 2019", genre:"Comedy, Drama, Thriller", length:"132 min", episodes:"1", platform:"Hulu"},
    "tenet": {title:"Tenet", release:"3 Sep 2020", genre:"Action, Sci-Fi, Thriller", length:"150 min", episodes:"1", platform:"HBO Max"},
    "dune": {title:"Dune", release:"22 Oct 2021", genre:"Adventure, Sci-Fi", length:"155 min", episodes:"1", platform:"HBO Max"},
    "avatar": {title:"Avatar", release:"18 Dec 2009", genre:"Action, Adventure, Sci-Fi", length:"162 min", episodes:"1", platform:"Disney+"},
    "titanic": {title:"Titanic", release:"19 Dec 1997", genre:"Drama, Romance", length:"195 min", episodes:"1", platform:"Disney+"},
    "matrix": {title:"The Matrix", release:"31 Mar 1999", genre:"Action, Sci-Fi", length:"136 min", episodes:"1", platform:"HBO Max"},
    "matrix revolutions": {title:"The Matrix Revolutions", release:"5 Nov 2003", genre:"Action, Sci-Fi", length:"129 min", episodes:"1", platform:"HBO Max"},
    "the godfather": {title:"The Godfather", release:"24 Mar 1972", genre:"Crime, Drama", length:"175 min", episodes:"1", platform:"Amazon Prime"},
    "the godfather part ii": {title:"The Godfather Part II", release:"20 Dec 1974", genre:"Crime, Drama", length:"202 min", episodes:"1", platform:"Amazon Prime"},
    "fight club": {title:"Fight Club", release:"15 Oct 1999", genre:"Drama", length:"139 min", episodes:"1", platform:"Netflix"},
    "pulp fiction": {title:"Pulp Fiction", release:"14 Oct 1994", genre:"Crime, Drama", length:"154 min", episodes:"1", platform:"Netflix"},
    // --- add more movies up to 100+ ---
};

// --- Greetings dataset ---
const greetings = [
    "Hi there! Welcome to Movie Zone 🎬. Ask me about any movie or series!",
    "Hello! I'm your Movie Zone Bot. I can give you details about movies and series.",
    "Hey! Type the name of a movie or series and I’ll fetch its info.",
    "Hi! Ready to explore movies and series? Ask me anything.",
    "Greetings! Ask me about any movie or series and I'll tell you the details.",
];

// --- Save history ---
function saveHistoryFile() {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
}

// --- Bot reply logic ---
function getBotReply(message) {
    const msgLower = message.toLowerCase().trim();

    // Greetings
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

    history.push({ text: message, type: 'user' });
    history.push({ text: reply, type: 'bot' });
    saveHistoryFile();

    res.json({ reply });
});

// --- History API ---
app.get('/api/history', (req, res) => {
    res.json({ history });
});

// --- Suggestions API ---
app.get('/api/suggestions', (req, res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const suggestions = Object.keys(movies)
        .filter(key => key.includes(query))
        .map(key => movies[key].title)
        .slice(0, 10);
    res.json({ suggestions });
});

// --- Export app for Vercel ---
module.exports = app;
