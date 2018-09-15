const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'fleabay_db'
});

connection.connect(err => {
  if (err) console.log(err);

  console.log(`Connected as id ${connection.threadId}`);

  bidApp();
});

function bidApp() {
  inquirer
    .prompt({
      message: 'What would you like to do?',
      type: 'list',
      choices: ['Create Auction', 'Bid', 'Quit'],
      name: 'mainMenu'
    })
    .then(answer => {
      if (answer.mainMenu === 'Create Auction') {
        auctionItems();
      } else if (answer.mainMenu === 'Bid') {
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
    res.forEach(key => {
      itemArr.push({
        name: `${key.item_name} - $${
          key.current_bid ? key.current_bid : key.starting_bid
        }`,
        value: key.item_name,
        short: key.item_name
      });
    });
    inquirer
      .prompt([
        {
          message: 'What would you like to bid on?',
          type: 'rawlist',
          choices: itemArr,
          name: 'bidChoice'
        },
        {
          message: 'How much would you like to bid?',
          name: 'bidAmount'
        }
      ])
      .then(answer => {
        console.log(answer.bidChoice);
        connection.query(
          'SELECT starting_bid, current_bid FROM items WHERE ?',
          {
            item_name: answer.bidChoice
          },
          (err, res) => {
            const starting_bid = res[0].starting_bid;
            const current_bid = res[0].current_bid;
            const bidNumber = parseInt(answer.bidAmount);

            if (starting_bid < bidNumber && current_bid < bidNumber) {
              connection.query(
                'UPDATE items SET ? WHERE ?',
                [
                  {
                    current_bid: parseInt(answer.bidAmount)
                  },
                  {
                    item_name: answer.bidChoice
                  }
                ],
                (err, res) => {
                  if (err) console.log(err);
                  console.log(
                    `Bid accepted. Current highest bid is ${answer.bidAmount}`
                  );
                  bidApp();
                }
              );
            } else {
              console.log('Your bid is too low! Try again!');
              bidItems();
            }
          }
        );
      });
  });
}

function auctionItems() {
  inquirer
    .prompt([
      {
        name: 'itemName',
        message: 'What do you want to sell?'
      },
      {
        name: 'itemPrice',
        message: 'What is the starting price?'
      }
    ])
    .then(answer => {
      connection.query(
        'INSERT INTO items SET ?',
        {
          item_name: answer.itemName,
          starting_bid: parseInt(answer.itemPrice),
          current_bid: 0
        },
        (err, res) => {
          if (err) console.log(err);

          console.log('Item added.');
          bidApp();
        }
      );
    });
}
