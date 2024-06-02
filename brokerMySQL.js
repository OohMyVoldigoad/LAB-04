var mosca = require('mosca');
var mysql = require('mysql');
var settings = { port: 1234 };
var broker = new mosca.Server(settings);

// MySQL configuration
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'airtect'
});
db.connect(function (err) {
    if (err) throw err;
    console.log('Database connected!');
});

var lastData = null;

// Function to save the last data to database
function saveLastDataToDatabase() {
    if (lastData) {
        var dbStat = 'INSERT INTO sensorreceives (humidity, temperatureC, temperatureF, H2, CH4) VALUES (?, ?, ?, ?, ?)';
        var values = [lastData.humidity, lastData.temperatureC, lastData.temperatureF, lastData.H2, lastData.CH4];
        db.query(dbStat, values, function (error, results) {
            if (error) {
                console.error('Error saving data to database:', error);
            } else {
                console.log('Data saved to database!');
                lastData = null; // Clear lastData after saving to database
            }
        });
    }
}

// Schedule data saving every 1 minute
setInterval(saveLastDataToDatabase, 60000); // 60000 ms = 1 minute

broker.on('ready', function () {
    console.log('Broker is ready!');
});

broker.on('published', function (packet, client) {
    var message = packet.payload.toString();
    console.log('Received:', message);

    // Check if the message is a JSON string
    if (message.startsWith('{')) {
        try {
            var data = JSON.parse(message);
            lastData = data; // Update lastData with the latest received data
        } catch (e) {
            console.error('Error parsing JSON:', e);
        }
    }
});