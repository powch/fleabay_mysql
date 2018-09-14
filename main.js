const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'fleabay_db'
});

connection.connect((err) => {
    if (err) console.log(err);

    console.log(`Connected as id ${connection.threadId}`);

    bidApp();
    
});

function bidApp() {
    inquirer.prompt(
        {
            message: 'What would you like to do?',
            type: 'list',
            choices: [
                'Create Auction',
                'Bid',
                'Quit'
            ],
            name: 'mainMenu'
        }
    ).then((answer) => {
        if (answer.mainMenu === 'Bid') {
            bidItems();
        } else if (answer.mainMenu === 'Quit') {
            return connection.end();
        }
    });
}

function bidItems() {
    connection.query('SELECT * FROM items', (err, res) => {
        if (err) console.log(err);
        let itemArr = [];
        res.forEach((key) => {
            itemArr.push(key.item_name);
        });
        inquirer.prompt([
            {
                message: 'What would you like to bid on?',
                type: 'list',
                choices: itemArr,
                name: 'bidMenu'
            },
            {
                message: 'How much would you like to bid?',
                name: 'bidAmount'
            }
        ]).then((answer) => {
            connection.query(
                'UPDATE items SET ? WHERE ?',
                [
                    {
                        current_bid: answer.bidAmount
                    },
                    {
                        item_name: answer.bidMenu
                    }
                ],
                function(err, res) {
                    if (err) console.log(err);
                }
            );
                bidApp();
        });
    });
}

function addSong() {
    console.log('adding new song...');
    let query = connection.query(
        'INSERT INTO songs SET ?',
        {
            title: 'marigold',
            artist: 'periphery',
            genre: 'progmetal'
        },
        function (err, res) {
            console.log(`${res.affectedRows} added.`);
        }
    );
    console.log(query);
    updateSong();
}

function updateSong() {
    console.log('Updating song.');
    let query = connection.query(
        'UPDATE songs SET ? WHERE ?',
        [
            {
                title: 'Widowmaker'
            },
            {
                artist: 'TBDM'
            }
        ],
        function (err, res) {
            console.log(`${res.affectedRows} updated.`);
        }
    );
    deleteSong();
}

function deleteSong() {
    console.log('Deleting song.');
    let query = connection.query(
        'DELETE FROM songs WHERE ?',
        {
            artist: 'clap cotton'
        },
        function (err, res) {
            console.log(`${res.affectedRows} deleted.`);
        }
    );
    console.log(query);
}

function readSongs() {
    console.log('Reading songs.');
    let query = connection.query(
        'SELECT * FROM songs', function (err, res) {
            console.log(res);
        }
    );
    console.log(query);
}