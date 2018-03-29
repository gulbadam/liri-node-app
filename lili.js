require('dotenv').config();
const fs = require('fs');
const keys = require('./keys.js');
const request = require('request');
const Twitter = require('twitter');
const Spotify = require('node-spotify-api');
const colors = require('colors');
const inquirer = require('inquirer');
const spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});
const client = new Twitter({
    consumer_key: keys.twitter.consumer_key,
    consumer_secret: keys.twitter.consumer_secret,
    access_token_key: keys.twitter.access_token_key,
    access_token_secret: keys.twitter.access_token_secret,
});
let command = process.argv[2];
let argArr = process.argv.slice(3, process.argv.length);
let dateTime = new Date();
logFile('\n===========================================');
logFile('| ' + dateTime.toString() + ' |');
logFile('===========================================\n');

function start(cmd, argv) {
    switch (cmd) {
        case 'my-tweets':
            logFile('[*] ' + cmd + ' <' + argv + '>');
            myTweets();
            break;

        case 'spotify-this-song':
            logFile('[*] ' + cmd + ' <' + argv + '>');
            let song = argv || 'The Sign Ace of Base';
            spotifyThisSong(song);
            break;

        case 'movie-this':
            logFile('[*] ' + cmd + ' <' + argv + '>');
            let movie = argv || "Mr.+Nobody";
            movieThis(movie);
            break;

        case 'do-what-it-says':
            logFile('[*] ' + cmd + ' <' + argv + '>');
            doWhatItSays();
            break;

        default:
            inquirer.prompt([{
                    type: 'list',
                    name: 'program',
                    message: 'What program do you want to run?',
                    choices: [
                        'my-tweets',
                        'spotify-this-song',
                        'movie-this',
                        'do-what-it-says'
                    ]
                }])
                .then((answers) => {

                    switch (answers.program) {

                        case 'my-tweets':
                            myTweets();
                            break;

                        case 'spotify-this-song':
                            inquirer.prompt([{
                                    type: 'input',
                                    name: 'song',
                                    message: 'What song would you like info for?',
                                }])
                                .then((answers) => {
                                    let song = answers.song || 'The Sign Ace of Base';
                                    spotifyThisSong(song);
                                });
                            break;

                        case 'movie-this':
                            inquirer.prompt([{
                                    type: 'input',
                                    name: 'movie',
                                    message: 'What movie would you like info for?',
                                }])
                                .then((answers) => {
                                    let movie = answers.movie || "Mr.+Nobody";
                                    movieThis(movie);
                                });
                            break;

                        case 'do-what-it-says':
                            doWhatItSays();
                            break;

                        default:
                            logFile("Invalid command! Come again with one of [my-tweets, spotify-this-song, movie-this, do-what-it-says]");
                            console.log("You've done something wrong, try again...\n".red);
                            break;
                    }
                });
    }
}

function myTweets() {
    let params = { screen_name: 'Gulbadam', count: 20 };
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        if (error) {
            return logFile('Error occurred: ' + error);
        }

        for (var i = 0; i < tweets.length; i++) {
            if (i + 1 < 10) {
                logFile(
                    '[0' +
                    (i + 1) +
                    ']--------------------------------------------------------'
                );
            } else {
                logFile(
                    '[' +
                    (i + 1) +
                    ']--------------------------------------------------------'
                );
            }
            logFile('* ' + tweets[i].created_at);
            logFile('* ' + tweets[i].text);
            logFile(
                '-------------------------------------------------------------\n'
            );
        }
    });

}

function spotifyThisSong(argv) {
    var songName = argv[0];

    for (var i = 1; i < argv.length; i++) {
        songName += ' ' + argv[i];
    }

    if (songName === undefined) {
        logFile('You should add a song name!\n');
        return;
    }
    spotify.search({ type: 'track', query: songName, limit: 20 }, function(
        err,
        data
    ) {
        if (err) {
            return logFile('Error occurred: ' + err);
        }
        var foundSong = data.tracks.items;

        for (var j = 0; j < foundSong.length; j++) {
            if (j + 1 < 10) {
                logFile(
                    '[0' +
                    (j + 1) +
                    ']--------------------------------------------------------'
                );
            } else {
                logFile(
                    '[' +
                    (j + 1) +
                    ']--------------------------------------------------------'
                );
            }
            logFile('* Artist(s): ' + foundSong[j].artists[0].name);
            logFile("* The song's name: " + foundSong[j].name);
            logFile('* A preview link: ' + foundSong[j].preview_url);
            logFile('* The album: ' + foundSong[j].album.name);
            logFile(
                '-------------------------------------------------------------\n'
            );
        }
    });
}

function movieThis(argv) {
    var movieName = argv[0];

    for (var i = 1; i < argv.length; i++) {
        movieName += '+' + argv[i];
    }

    if (movieName === undefined) {
        logFile('You should add a movie name!\n');
        return;
    }

    let queryURL = "http://www.omdbapi.com/?t=" + argv + "&y=&plot=short&apikey=trilogy";

    request(queryURL, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var foundMovie = JSON.parse(body);

            logFile(
                '-------------------------------------------------------------'
            );
            logFile('* Title: ' + foundMovie.Title);
            logFile('* Year: ' + foundMovie.Year);
            logFile('* IMDB Rating: ' + foundMovie.Ratings[0].Value);
            logFile('* Rotten Tomatoes Rating: ' + foundMovie.Ratings[1].Value);
            logFile('* Country: ' + foundMovie.Country);
            logFile('* Language: ' + foundMovie.Language);
            logFile('* Plot: ' + foundMovie.Plot);
            logFile('* Actors: ' + foundMovie.Actors);
            logFile(
                '-------------------------------------------------------------\n'
            );
        } else {
            logFile('Error occurred: ' + error);
        }
    });
}

function doWhatItSays() {
    fs.readFile('random.txt', 'utf8', function(error, data) {
        if (error) {
            return logFile('Error occurred: ' + error);
        }

        var read = data.split(',');
        var argv = [];

        argv.push(read[1].replace(/\"/g, ''));
        start(read[0], argv);
    });
}

function logFile(str) {
    console.log(str.rainbow);


    fs.appendFileSync('log.txt', str + '\n', function(err) {
        if (err) {
            return console.log(err);
        }
    });
}

start(command, argArr);