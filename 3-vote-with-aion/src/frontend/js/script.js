const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=da85417fac594f0099708ad6e7ea2e97";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
const pk = "d2abbfb69e2927abea2388ce74aa3199d86293a4704de0c6ff3572ec6719fefa83f31c24396498eccd1f4eaf690f9e24110c5a1c55ef436c1fe1aea5b452af40";

let contractAddress = "0xa04e1e6990feb8182f53e286a5d113b1e05aed5e9e284b8aab45667d6e044306";
let abi = `
0.0
VotingWithAion.Voting
Clinit: ()
public static String getQuestion(int)
public static boolean getQuestionStatus(int)
public static int getRequiredVotes(int)
public static String[] getAnswers(int)
public static String[] getVotes(int)
public static void newQuestion(String, String[], int)
public static void newVote(int, String)
`;

abi = `
0.0
VotingWithAion.Voting
Clinit: ()
public static String getQuestion(int)
public static boolean getQuestionStatus(int)
public static int getRequiredVotes(int)
public static String[] getAnswers(int)
public static String[] getVotes(int)
public static void newVote(int, String)
`;

let abiObj = web3.avm.contract.Interface(abi);
web3.avm.contract.initBinding(contractAddress, abiObj, pk);

class Question {
    constructor(question, status, requiredVotes, answers, votes){
        this.question = question;
        this.status = status;
        this.requiredVotes = requiredVotes;
        this.answers = answers;
        this.votes = votes;
    }
}

async function getQuestionObject(questionID){
    return new Question(
        await getQuestion(questionID),
        await getQuestionStatus(questionID),
        await getRequiredVotes(questionID),
        await getAnswers(questionID),
        await getVotes(questionID),
    );
}

async function getQuestion(questionID) {
    let response = await web3.avm.contract.readOnly.getQuestion(questionID);
    // console.log("getQuestion:", response);
    document.querySelector('#current_question').innerHTML = response;
    return response;
}

async function getQuestionStatus(questionID) {
    let response = await web3.avm.contract.readOnly.getQuestionStatus(questionID);
    // console.log("getQuestionStatus:", response);
    return response;
}

async function getRequiredVotes(questionID) {
    let response = await web3.avm.contract.readOnly.getRequiredVotes(questionID);
    // console.log("getRequiredVotes:", response);
    return response;
}

async function getAnswers(questionID) {
    let response = await web3.avm.contract.readOnly.getAnswers(questionID);
    // console.log("getAnswers:", response);
    return response;
}

async function getVotes(questionID) {
    let response = await web3.avm.contract.readOnly.getVotes(questionID);
    // console.log("getVotes:", response);
    return response;
}

async function newVote(questionID, answer) {
    document.querySelector('#submit_button').innerHTML = 'Loading...';
    document.querySelector('#submit_button').disabled = true;

    // let privateKeyInput = document.querySelector('#private_key_input').value;
    let privateKeyInput = pk;
    const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);

    let data = web3.avm.contract
        .method("newVote")
        .inputs(["int","string"], [questionID,answer])
        .encode();

    const transaction = {
        from: account.address,
        to: contractAddress,
        data: data,
        gasPrice: 100000000000,
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

    document.querySelector('#submit_button').innerHTML = 'Submit';
    document.querySelector('#submit_button').disabled = false;
}

window.onload = function() {
    getQuestion(0);
};
