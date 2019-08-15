const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=ab40c8f567874400a69c1e80a1399350";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

async function sendAion() {
    document.querySelector('#submit_button').innerHTML = 'Loading...';
    document.querySelector('#submit_button').disabled = true;

    let privateKeyInput = document.querySelector('#private_key_input').value;
    let receivingAddressInput = document.querySelector("#receiving_address_input").value;

    const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);

    const transaction = {
        from: account.address,
        to: receivingAddressInput,
        value: 1000000000000000000,
        gasPrice: 10000000000,
        gas: 2000000,
    };

    const signedTransaction = await web3.eth.accounts
        .signTransaction(transaction, account.privateKey)
        .then(transactionResponse => (signedCall = transactionResponse));

    const transactionReceipt = await web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
        .on("receipt", receipt => {
            console.log(
                "Receipt received!\ntransactionHash =",
                receipt.transactionHash
            );
        });

    document.querySelector('#transaction_receipt_output').innerHTML = `Transaction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${transactionReceipt.transactionHash}">${transactionReceipt.transactionHash}</a>`

    document.querySelector('#submit_button').innerHTML = 'Submit';
    document.querySelector('#submit_button').disabled = false;
}
