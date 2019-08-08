const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=ab40c8f567874400a69c1e80a1399350";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

async function sendAion() {
    document.querySelector('#submit_button').innerHTML = 'Loading...';
    document.querySelector('#submit_button').disabled = true;

    let receivingAddressInput = document.querySelector("#receiving_address_input").value;


    const transactionObject = {
        to: receivingAddressInput,
        value: 1000000000000000000,
        gasPrice: 10000000000,
        gas: 2000000,
    };

    let txHash = await aionweb3.sendTransaction(transactionObject);
    console.log("txHash", txHash);

    let timer = setInterval(
        async function() {
            if(await web3.eth.getTransactionReceipt(txHash)){
                console.log("getTransactionReceipt", txHash);
                console.log("onTxComplete");
                document.querySelector('#submit_button').innerHTML = 'Submit';
                document.querySelector('#submit_button').disabled = false;
                clearInterval(timer);
            } else {
                console.log("Txn Pending", txHash);
            }
        },
        1000
    );
}
