const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=da85417fac594f0099708ad6e7ea2e97";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
const pk = "d2abbfb69e2927abea2388ce74aa3199d86293a4704de0c6ff3572ec6719fefa83f31c24396498eccd1f4eaf690f9e24110c5a1c55ef436c1fe1aea5b452af40";

let contractAddress = "0xa0c468ba67c12a47637fb21c786b870085b81d6182be2fb2812ac7616dfc8672";
let abi = `
0.0
VotingWithAion.Voting
Clinit: ()
public static String getQuestion(int)
public static boolean getQuestionStatus(int)
public static int getRequiredVotes(int)
public static String[] getChoices(int)
public static String[] getVotes(int)
public static int getNumberQuestions()
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
public static String[] getChoices(int)
public static String[] getVotes(int)
public static int getNumberQuestions()
public static void newVote(int, String)
`;

let abiObj = web3.avm.contract.Interface(abi);
web3.avm.contract.initBinding(contractAddress, abiObj, pk);

class Poll {
    constructor(question, status, requiredVotes, choices, votes){
        this.question = question;
        this.status = status;
        this.requiredVotes = requiredVotes;
        this.choices = choices;
        this.votes = votes;
    }
}

async function getPollObject(questionID){
    return new Poll(
        await getQuestion(questionID),
        await getQuestionStatus(questionID),
        await getRequiredVotes(questionID),
        await getChoices(questionID),
        await getVotes(questionID),
    );
}

function makeButton(questionID, choice){
    return `<button style="margin:5px;" type='button' id='vote_button' onclick='newVote(${questionID}, "${choice}")'>${choice}</button>`;
}

async function getPoll(){
    let questionID = document.querySelector('#poll_picker').value;
    let poll = await getPollObject(questionID);

    document.getElementById("poll_buttons").innerHTML = '';

    let votes = document.createElement("div");

    for (let i in poll.choices) {
        votes.innerHTML += makeButton(questionID, poll.choices[i])
    }
    document.getElementById("poll_buttons").appendChild(votes);

    document.querySelector('#question_name').innerHTML = `Question: ${poll.question}`
}

async function getQuestion(questionID) {
    return await web3.avm.contract.readOnly.getQuestion(questionID);
}

async function getQuestionStatus(questionID) {
    return await web3.avm.contract.readOnly.getQuestionStatus(questionID);
}

async function getRequiredVotes(questionID) {
    return await web3.avm.contract.readOnly.getRequiredVotes(questionID);
}

async function getChoices(questionID) {
    return await web3.avm.contract.readOnly.getChoices(questionID);
}

async function getVotes(questionID) {
    return await web3.avm.contract.readOnly.getVotes(questionID);
}

async function getNumberQuestions() {
    return await web3.avm.contract.readOnly.getNumberQuestions();
}

async function newVote(questionID, choice) {
    // document.querySelector('#submit_button').innerHTML = 'Loading...';
    // document.querySelector('#submit_button').disabled = true;

    // let privateKeyInput = document.querySelector('#private_key_input').value;
    let privateKeyInput = pk;
    const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);

    let data = web3.avm.contract
        .method("newVote")
        .inputs(["int","string"], [questionID,choice])
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

    // document.querySelector('#submit_button').innerHTML = 'Submit';
    // document.querySelector('#submit_button').disabled = false;
}

window.onload = function() {
    // getQuestion(0);
};
