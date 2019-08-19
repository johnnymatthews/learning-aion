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
        public static void newQuestion(String, String[], int)
        public static void newVote(int, String)
        public static void closeQuestion(int)
    `;

//TODO: remove this when abi bug is fixed... keep the one above
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

async function getNumberQuestions() {
    return await web3.avm.contract.readOnly.getNumberQuestions();
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

async function enterPrivateKey(){
    pk = document.querySelector('#private_key_input').value;

    web3.avm.contract.initBinding(contractAddress, abiObj, pk);

    document.getElementById("private_key_div").innerHTML = '<p>Private Key Received!</p>';

    await drawPollPicker(await getNumberQuestions());
    await drawQuestionPublisher();
}

async function drawPollPicker(numberQuestions){

    let html = `
        <hr>
        <h4>Manage Question</h4>
        <text style="padding-right:10px;">Enter the questionID you would like to manage:</text>
        <select id="poll_picker" style="width:70px;display:inline-block;margin-right: 10px" name="questionIDs">
    `;

    for(let i = 0 ; i<numberQuestions ; i++)
        if(await getQuestionStatus(i) === false)
            html += `<option value=${i}>${i}</option>`;
        else
            html += `<option style="color: #f44336" value=${i}>${i}</option>`;

    html += `</select><button type="button" id="getPoll_button" onclick="drawPoll()">Get Poll</button>`;

    document.getElementById("poll_picker_div").innerHTML += html;
}

async function drawPoll(){
    let questionID = document.querySelector('#poll_picker').value;
    let poll = await getPollObject(questionID);

    let html = `
        <h4 style="margin-bottom:5px;">${poll.question}</h4>
        <p style="margin-bottom:5px;">${poll.votes.length}/${poll.requiredVotes} votes casted! ${poll.status ? "The poll has been closed." : "The poll is open!"}</p>
        <div id="poll_votes">
        <p>
    `;

    let voteCount = 0;
    for (let i in poll.choices){
        for(let j in poll.votes)
            if(poll.choices[i] === poll.votes[j])
                voteCount++;
        html += `${poll.choices[i]}: ${voteCount}<br>`;
        voteCount=0;
    }

    if(poll.status)
        html += `
            </p></div>
            <button style="margin:5px; background-color: #ea1c0d" type='button' id='close_poll_button' onclick='' disabled>Closed</button>
        `;
    else
        html += `
            </p></div>
            <button style="margin:5px; background-color: #ea1c0d" type='button' id='close_poll_button' onclick='closeQuestion(${questionID})'>Close Poll</button>
        `;

    document.getElementById("poll_div").innerHTML = html;
}

async function drawQuestionPublisher(){
    document.getElementById("question_publisher").innerHTML = `
        <hr>
        <h4>Publish Poll</h4>
        <text style="color: #ea1c0d">WILL NOT WORK UNTIL BUG IS FIXED WITH ABI STING[] ARGUMENTS!!!</text><br>
        Question:
        <input style="margin-bottom: 20px" type="text" id="question_input" placeholder="What is your favorite color?" required>
        Choices:
        <input style="margin-bottom: 20px" type="text" id="choices_input" placeholder='Blue, Red, Yellow' required>
        Required Votes until Closed:
        <input style="margin-bottom: 20px" type="text" id="required_votes_input" placeholder="71" required>
        <button style="margin:5px;" type='button' id='publish_question_button' onclick='setupNewQuestion()'>Publish Question</button>
    `;
}

async function setupNewQuestion(){
    let question = document.querySelector('#question_input').value;
    let choices = document.querySelector('#choices_input').value;
    let requiredVotes = document.querySelector('#required_votes_input').value;

    choices = choices.split(",");

    for(let n = 0 ; n < choices.length ; n++)
        choices[n] = choices[n].trim();

    console.log(question);
    console.log(choices);
    console.log(requiredVotes);

    await newQuestion(question, choices, requiredVotes);
}

//TODO: WILL NOT WORK UNTIL BUG IS FIXED WITH ABI STRING[] ARGUMENTS!!!
// when bug is fixed, remove the second abi from the global variables above.
// Keep the abi declaration with the line
// `public static void newQuestion(String, String[], int)` in it
async function newQuestion(question, choices, requiredVotes){
    document.querySelector('#transaction_receipt_output').innerHTML = `<hr>Awaiting Transaction...`;
    document.getElementById("publish_question_button").disabled = true;

    let res = await web3.avm.contract.transaction.newQuestion(question, choices, requiredVotes);

    document.getElementById("publish_question_button").disabled = false;
    document.querySelector('#transaction_receipt_output').innerHTML = `<hr>Tranasction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${res.transactionHash}">${res.transactionHash}</a>`;
}

async function closeQuestion(questionID){
    console.log("Closing poll #" + questionID + "...");
    document.querySelector('#transaction_receipt_output').innerHTML = `<hr>Awaiting Transaction...`;
    document.getElementById("close_poll_button").disabled = true;
    document.getElementById("close_poll_button").innerText = "Closing";

    let res = await web3.avm.contract.transaction.closeQuestion(questionID);

    document.getElementById("close_poll_button").innerText = "Closed";
    document.querySelector('#transaction_receipt_output').innerHTML = `<hr>Transaction Receipt: <a target="_blank" href="https://mastery.aion.network/#/transaction/${res.transactionHash}">${res.transactionHash}</a>`;
}

window.onload = async function() {

};
