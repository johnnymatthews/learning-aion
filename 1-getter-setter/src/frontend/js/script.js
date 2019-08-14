const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=ab40c8f567874400a69c1e80a1399350";
let contractAddress = "0xa003cd11951f9a58f81df851e83cf7b5eca4b2ca5d6429dadb49021c13603357";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));

async function getString() {
    let data = web3.avm.contract.method("getString").encode();
    const transactionObject = {
        to: contractAddress,
        data: data,
        type: "0x1"
    };

    let initialResponse = await web3.eth.call(transactionObject);
    let avmResponse = await web3.avm.contract.decode("string", initialResponse);
    document.querySelector('#current_string_output').innerHTML = avmResponse;
}

async function setString() {
    document.querySelector('#submit_button').innerHTML = 'Loading...';
    document.querySelector('#submit_button').disabled = true;

    let privateKeyInput = document.querySelector('#private_key_input').value;
    let newStringInput = document.querySelector("#new_string_input").value;

    const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);

    let data = web3.avm.contract
        .method("setString")
        .inputs(["string"], [newStringInput])
        .encode();

    const transaction = {
        from: account.address,
        to: contractAddress,
        data: data,
        gasPrice: 10000000000,
        gas: 2000000,
        type: "0x1"
    };

    const signedTransaction = await web3.eth.accounts
        .signTransaction(transaction, account.privateKey)
        .then(transactionResponse => (signedCall = transactionResponse));
    console.log("Signed Transaction: ", signedTransaction);

    const transactionReceipt = await web3.eth
        .sendSignedTransaction(signedTransaction.rawTransaction)
        .on("receipt", receipt => {
            console.log(
                "Receipt received!\ntransactionHash =",
                receipt.transactionHash
            );
        });

    console.log("Transaction Receipt: ", transactionReceipt);
    getString();

    document.querySelector('#submit_button').innerHTML = 'Submit';
    document.querySelector('#submit_button').disabled = false;
}

window.onload = function() {
    getString();
}
