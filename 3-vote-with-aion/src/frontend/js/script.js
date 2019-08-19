const nodeUrl = "https://aion.api.nodesmith.io/v1/mastery/jsonrpc?apiKey=da85417fac594f0099708ad6e7ea2e97";
const web3 = new Web3(new Web3.providers.HttpProvider(nodeUrl));
const contractAddress = "0xa06bba6bcf961ade9258b0db1b98ace6bd93a9041aefe35c709d0f8c1d0380b8";
let pk;
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
    public static void newVote(int, String)
    public static void closeQuestion(int)
`;

let abiObj = web3.avm.contract.Interface(abi);

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

async function enterPrivateKey(){
    pk = document.querySelector('#private_key_input').value;
    web3.avm.contract.initBinding(contractAddress, abiObj, pk);

    document.getElementById("private_key_div").innerHTML = '<p>Private Key Received!</p>'

    await drawPollPicker(await getNumberQuestions());
}

async function drawPollPicker(numberQuestions){

    let html = `
        <hr>
        <text style="padding-right:10px;">Enter the questionID you would like to vote on:</text>
        <select id="poll_picker" style="width:70px;display:inline-block;margin-right: 10px" name="questionIDs">
    `;

    for(let i = 0 ; i<numberQuestions ; i++){
        if(await getQuestionStatus(i) === false)
            html += `<option value=${i}>${i}</option>`;
        else
            html += `<option style="color: #f44336" value=${i}>${i}</option>`;
    }

    html += `</select><button type="button" id="getPoll_button" onclick="drawPoll()">Get Poll</button>`;

    document.getElementById("poll_picker_div").innerHTML += html;
}

function makePollButton(questionID, choice, numberVotes){
    return `<button style="margin:5px;" type='button' id='vote_button' onclick='newVote(${questionID}, "${choice}")'>${choice} (${numberVotes})</button>`;
}

async function drawPoll(){
    let questionID = document.querySelector('#poll_picker').value;

    let poll = await getPollObject(questionID);

    let html = `
        <hr>
        <h4 style="margin-bottom:5px;">${poll.question}</h4>
        <p style="margin-bottom:5px;">Each account may vote once. A double vote will cause a failed transaction.</p>
        <p style="margin-bottom:5px;">${poll.votes.length}/${poll.requiredVotes} votes casted! ${poll.status ? "The poll has been closed." : "The poll is open!"}</p>
        <div id="poll_buttons">
    `;

    let voteCount = 0;
    for (let i in poll.choices){
        for(let j in poll.votes)
            if(poll.votes[j] === poll.choices[i])
                voteCount++;
        html += makePollButton(questionID, poll.choices[i], voteCount);
        voteCount=0;
    }
    html += `</div>`;

    document.getElementById("poll_div").innerHTML = html;

    if(poll.status){
        let c = document.getElementById("poll_buttons").childNodes;
        for (i = 0; i < c.length; i++) {
            c[i].disabled = true;
        }
    }

    // document.querySelector('#transaction_receipt_output').innerHTML = ``;

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
    let c = document.getElementById("poll_buttons").childNodes;
    for (let i = 0; i < c.length; i++)
        c[i].disabled = true;

    document.querySelector('#transaction_receipt_output').innerHTML = `Awaiting Transaction...🐢`;

    let privateKeyInput = document.querySelector('#private_key_input').value;

    // web3.avm.contract.initBinding(contractAddress, abiObj, privateKeyInput, web3);

    let transactionReceipt = await web3.avm.contract.transaction.newVote(questionID, choice);

    // const account = web3.eth.accounts.privateKeyToAccount(privateKeyInput);
    // let data = web3.avm.contract
    //     .method("newVote")
    //     .inputs(["int","string"], [questionID,choice])
    //     .encode();
    //
    // const transaction = {
    //     from: account.address,
    //     to: contractAddress,
    //     data: data,
    //     gasPrice: 100000000000,
    //     gas: 2000000,
    //     type: "0x1"
    // };
    //
    // const signedTransaction = await web3.eth.accounts
    //     .signTransaction(transaction, account.privateKey)
    //     .then(transactionResponse => (signedCall = transactionResponse));
    // console.log("Signed Transaction: ", signedTransaction);
    //
    // const transactionReceipt = await web3.eth
    //     .sendSignedTransaction(signedTransaction.rawTransaction)
    //     .on("receipt", receipt => {
    //         console.log(
    //             "Receipt received!\ntransactionHash =",
    //             receipt.transactionHash
    //         );
    //     });

    console.log("Transaction Receipt: ", transactionReceipt);
    document.querySelector('#transaction_receipt_output').innerHTML = `Latest Transaction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${transactionReceipt.transactionHash}">${transactionReceipt.transactionHash}</a>`;

    drawPoll();
}

window.onload = async function() {

};
