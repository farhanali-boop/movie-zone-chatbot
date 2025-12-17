const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware ----------
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));  // Serve static files (index.html)

// ---------- History File ----------
const historyFilePath = path.join(__dirname, 'history.json');
let history = [];

if (fs.existsSync(historyFilePath)) {
    const data = fs.readFileSync(historyFilePath, 'utf8');
    try { history = JSON.parse(data); } 
    catch { history = []; }
}

// ---------- Movie Dataset ----------
const movies = {
    "avengers endgame": {title:"Avengers: Endgame", release:"26 April 2019", genre:"Action, Adventure, Sci-Fi", length:"181 min", episodes:"1", platform:"Disney+"},
    "inception": {title:"Inception", release:"16 Jul 2010", genre:"Sci-Fi/Thriller", length:"148 min", episodes:"1", platform:"Netflix"},
    "interstellar": {title:"Interstellar", release:"7 Nov 2014", genre:"Adventure, Drama, Sci-Fi", length:"169 min", episodes:"1", platform:"Amazon Prime"},
    "the dark knight": {title:"The Dark Knight", release:"18 Jul 2008", genre:"Action, Crime, Drama", length:"152 min", episodes:"1", platform:"Netflix"},
    "joker": {title:"Joker", release:"4 Oct 2019", genre:"Crime, Drama, Thriller", length:"122 min", episodes:"1", platform:"HBO Max"},
    // Add more movies as needed
};

// ---------- Greetings ----------
const greetings = [
    "Hi there! Welcome to Movie Zone 🎬. Ask me about any movie or series!",
    "Hello! I'm your Movie Zone Bot. I can give you details about movies and series.",
    "Hey! Type the name of a movie or series and I’ll fetch its info.",
];

// ---------- Helper Functions ----------
function saveHistoryFile() {
    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
}

function getBotReply(message) {
    const msgLower = message.toLowerCase().trim();
    const greetingKeywords = ['hi','hello','hey','how are you','greetings'];

    if (greetingKeywords.some(g => msgLower.includes(g))) {
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

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

    return "Sorry, I don't have that movie info.";
}

// ---------- API Routes ----------
app.post('/api/chat', (req,res) => {
    const { message } = req.body;
    const reply = getBotReply(message);
    history.push({text: message, type:'user'});
    history.push({text: reply, type:'bot'});
    saveHistoryFile();
    res.json({reply});
});

app.get('/api/history', (req,res) => res.json({history}));

app.get('/api/suggestions', (req,res) => {
    const query = req.query.q ? req.query.q.toLowerCase() : '';
    const suggestions = Object.keys(movies)
        .filter(key => key.includes(query))
        .map(key => movies[key].title)
        .slice(0,10);
    res.json({suggestions});
});

// ---------- Start Server ----------
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
