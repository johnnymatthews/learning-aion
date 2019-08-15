# Send Aion

In this project, we'll create a simple web application where the user can send `AION` to another address.

The great thing about this project is that you don't need to use Maven or IntelliJ, or even compile and deploy a contract! Everything happens within a JavaScript file and utilizes the Aion Web3.js library to do everything. In fact, unlike the _Getter-Setter_ project, there isn't even an `src` folder. Everything is kept with the root of the `2-send-aion-aiwa` folder.

## Running the Project

To view the frontend, since Aiwa needs a server to run for security reasons, you can easily deploy by following the steps below:

1. Install npm serve with:

    ```bash
    npm install -g serve
    ```

2. Navigate to the folder that contains the `index.html` file for your frontend
3. Deploy the local server with:

    ```bash
    $ serve

    > ┌────────────────────────────────────────────────┐
    > │                                                │
    > │   Serving!                                     │
    > │                                                │
    > │   - Local:            http://localhost:5000    │
    > │   - On Your Network:  http://yourPublicIP:5000 │
    > │                                                │
    > │   Copied local address to clipboard!           │
    > │                                                │
    > └────────────────────────────────────────────────┘
    ```

    You can type `http://localhost:5000` into your browser to access the frontend.

4. To close, press `CTRL`+`C`

## File Layout

There are three main sections within this project that we're concerned with:

- `index.html`: The markup for the webpage, this is just plain HTML.
- `css`: contains the `marx.min.css` file, which is just a classless CSS framework.
- `js`:
  - `web3.min.js`: creates a `Web3` object that allows us to integrate into the blockchain network.
  - `script.js`: contains our custom logic that lets the user interact with our application.

### Index

The purpose of this front end is to allow users to:

1. Enter an address to send `1 AION` to.
2. Allow the use of Aiwa to send `AION` from.

This file is incredibly simple, and just contains two input fields to take our private key, and the address of the account we want to send `AION` to. It should be noted that having a user enter their private key into a webpage is incredibly dangerous and should never be done in applications that real users are going to use. We've just done it here to simplify things.

The _to account_ input field has an `id` of `receiving_address_input`. There is also a hidden field with an `id` of `transaction_receipt_output` which shows the user the transaction receipt once everything has finished.

### CSS

We're using [Mblode's](https://github.com/mblode) incredible [Marx CSS framework](https://github.com/mblode/marx). Not only is it incredibly simple to use with no classes or JavaScript to deal with, but it's very lightweight. Everything is contained within a single 11kb `marx.min.css` file.

### JavaScript

As mentioned before, we have two JavaScript files: `web3.min.js` and `script.js`. The `web3.min.js` file is taken from the [Aion Web3.js repository](https://github.com/aionnetwork/aion_web3), and we won't be changing anything within this file. All of our coding takes place within the `script.js` file.

Right at the top of `script.js` we define two global variables:

- `nodeUrl`: the URL of the Aion node we want to connect to.
- `web3`: a copy of the `Web3` objected defined by `web3.min.js`. This object takes our `nodeUrl` as an argument so it knows where to route the calls through.

There is only one function within this script, `sendAion()`. This function has the `async` attribute, meaning that it will be executed asynchronously as soon as it is available. You can find out more about `async` functions from the [Mozilla Developers Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

Let's delve into the `sendAion` method. First up, we disable the button and change it's text to `Loading...`. This is just to make sure the user doesn't accidentally keep sending the same transaction over and over again.

```javascript
document.querySelector('#submit_button').innerHTML = 'Loading...';
document.querySelector('#submit_button').disabled = true;
```

When making a transaction call to a blockchain application there are three steps to take:

1. Create a transaction object.
2. Make the call to the blockchain by sending the transaction object.
3. Get the response from the blockchain.

The transaction contains vital information that the blockchain network needs to understand our request. The transaction object will look different for different types of requests, but for our transaction call we just need to supply:

- The _to_ address.
- The amount of `AION` we want to send in `NAmps`.
- The gas amount and gas price.

```java
const transaction = {
 to: receivingAddressInput,
 value: 1000000000000000000,
 gasPrice: 10000000000,
 gas: 2000000
};
```

> Note: the `from` address does not need to be added to the transaction object when working with Aiwa because Aiwa will add the account details the object for you.

While the `value` fields _should_ seem fairly intuitive, the fact that there's such a large number is a bit strange. That's because that number doesn't represent the amount of `AION` that we want to send. It represents the amount of `NAmp` we want to send. Every single `AION` is made up of `1000000000000000000 NAmps`. That's a `1` followed by 18 `0`. The reasons for this can get a bit complicated, but the basic gist is that having such a large number allows us to send tiny amounts of value to each other. Right now 1 Bitcoin `BTC` is worth about `USD 11000`, so if users we forced to use `BTC` as the `value` field then they'd have to have _at least_ $11000 worth of Bitcoin available. Most people don't have this much money, so allowing users to send smaller amounts makes everything much more approachable for everyday users!

The `gasPrice` and `gas` fields relate to each other. The first, `gasPrice` is the amount you're willing to pay for every _unit_ of gas. The `gas` field is the amount of _units_ of gas you're willing to pay. Again, these values are in `NAmp`, not `AION`. So we're willing to pay `10000000000 * 2000000 NAmp` to send this transaction.

Next up we need to tell Aiwa to propose a transaction to the user.

```javascript
let txHash = await aionweb3.sendTransaction(transactionObject);
```

Again, because we're working with a blockchain network things happen asynchronously, so we put the `await` modifier at the start of the function call. It's a similar situation for getting the transaction receipt.

After a transaction hash is returned, we will create an asynchronous `setInterval()` function to periodically check for a transaction receipt, meaning the transaction was complete.

```javascript
    let timer = setInterval(
        async function() {
            if(await web3.eth.getTransactionReceipt(txHash)){
                document.querySelector('#transaction_receipt_output').innerHTML = `Tranasction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${txHash}">${txHash}</a>`
                document.querySelector('#submit_button').innerHTML = 'Submit';
                document.querySelector('#submit_button').disabled = false;
                clearInterval(timer);
            } else {
                console.log("Txn Pending", txHash);
            }
        },
        1000
    );
```

Something to note here is that we're outputting our `transactionHash` object into the browser console using `console.log`. This is useful for debugging purposes.

Finally, we enable the button again and reset its text. We also show the user the transaction hash and supply a link so that they can view the transaction on the [Aion Mastery dashboard](https://mastery.aion.network).

```javascript
document.querySelector('#transaction_receipt_output').innerHTML = `Tranasction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${txHash}">${txHash}</a>`
document.querySelector('#submit_button').innerHTML = 'Submit';
document.querySelector('#submit_button').disabled = false;
```

## Suggested Improvements

There's some room for improvement in this application. For example, there is no validation on any of the input fields, which would be a big issue if this application were in a production environment.
