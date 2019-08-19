# Vote with Aion

In this project, we've created a voting DApp in which you can vote in polls, create polls, or close polls from a javascript frontend. The backend was created using a Java smart-contract and the javascript frontend is split into a voters page and an admins page.

The Java smart-contract was tested and deployed with the [Aion4j IntelliJ plugin](https://beta-docs.aion.network/developers/tools/intellij-plugin/overview/), however, the [Maven CLI](https://beta-docs.aion.network/developers/tools/maven-cli/overview/) tool will work just as well.

The Java class allows the owner, the account which deployed it, to publish or close questions and any account on the network can vote on each of those polls once.

## Running the Project

To run this project, make sure that your [contract is deployed](https://beta-docs.aion.network/developers/tools/maven-cli/deploy/) and your frontend knows which contract to interact with. To view the frontend, just open the `frontend/index.html` or `frontend-admin/index.html` file in a browser.

## File Layout

Similar to the first project, there are three root folders within this project:

- `lib`: contains the `avm.jar` and other packages required to create blockchain applications.
- `src`: where our source code lives.
- `target`: a collection of classes and extra tools used to create our application. These are generated automatically when compiling your contract.

We only really need to care about `src`. We won't be dealing directly with the other two folders. Within the `src` folder is:

- `frontend`: where we can store our front-end code for voting.
- `frontend-admin`: where we can store our front-end code for managing polls.
- `main`: where our main Java class lives.
- `test`: contains our test classes, used to make sure our application will work once it is compiled.

## Class Breakdown

We only have one Java class for this project, the `Voting` class. It is stored are stored within `src/main/java/VotingWithAion/`, with `VotingWithAion` being the _package_ name for this project.

First, we tell Java which package this class belongs to, import some of the extra packages we'll be using in this application, and begin defining our main class:

```java
package VotingWithAion;
import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;
import org.aion.avm.userlib.AionList;
import org.aion.avm.userlib.AionMap;
import org.aion.avm.userlib.AionSet;

public class Voting {
 ...
}
```

We will define a few static variables. An `owner` **Address** to determine who can call admin-only methods, a `questions` **AionMap** to store the question data, and a `questionID` **int** to keep track of how many questions there are in total.

```java
private static Address owner;
private static AionMap<Integer, QuestionInfo> questions = new AionMap<>();
private static int questionID;
```

Next, we have to define the class `QuestionsInfo` that the `questions` **AionMap** is referencing in the static variable declaration above. This class will hold all of the data from each question. It is made up of instance-variable declarations and a constructor to initialize.

```java
 private static class QuestionInfo {
 String question;
 String[] choices;
 int requiredVotes;
 boolean closed;
 AionList<String> votes;
 AionSet<Address> voters;

 QuestionInfo(String question, String[] choices, int requiredVotes) {
 this.question = question;
 this.choices = choices;
 this.requiredVotes = requiredVotes;
 this.votes = new AionList<>();
 this.closed = false;
 this.voters = new AionSet<>();
 }
 }
```

Next up, we create our `clinit`. This is a function that is called when we first _deploy_ our contract. It is only ever called once. Here, we will initialize the static variables that we declared above.

```java
static {
 owner = Blockchain.getCaller();
 questionID = 0;
}
```

Next, is the methods of our application. We will first create a getter for each of the instance variables in the `QuestionInfo` object as well as for the number of questions on the contract (the size of `questions`).

Then, we will also write three methods to interact with the class from the frontend:

1. `newQuestion` will create a new question using `QuestionInfo` inside the `questions` **AionMap**. This method can only be called by the contract owner, assigned to the deployer address.

    The method takes in three parameters: The `question` name **String**, a `choices` **String array**, and a `requiredVotes` **int**.

    It first checks whether the caller is the owner of the contract. If not the transaction will fail. Otherwise, the question will be constructed from `QuestionInfo` and added to `questions`.

     ```java
    @Callable
    public static void newQuestion(String question, String[] choices, int requiredVotes) {
        Blockchain.require(Blockchain.getCaller().equals(owner));
        questions.put(questionID, new QuestionInfo(question, choices, requiredVotes));
        Blockchain.log("NewQuestionAdded".getBytes(), question.getBytes());
        questionID ++;
    }
    ```

2. `newVote` will add votes too existing questions when provided with a `questionID` and vote `choice`. This method can be called by any address that has not voted on the desired question before.

    The method takes in two parameters: a `questionID` **int** to select a question and a `choice` **String** to record as a vote.

    It will first make sure the question isn't closed yet and if the calling account has already voted. If not, then the vote and the caller address will be added to the `QuestionInfo` object for that question.

    Finally, the method will determine whether the question has reached its `requiredVotes`. If so, then the question will be closed.

    ```java
    @Callable
    public static void newVote(int questionID, String choice) {
        Blockchain.require(!questions.get(questionID).closed && !questions.get(questionID).voters.contains(Blockchain.getCaller()));
        questions.get(questionID).voters.add(Blockchain.getCaller());
        questions.get(questionID).votes.add(choice);
        if(questions.get(questionID).votes.size() == questions.get(questionID).requiredVotes) {
            questions.get(questionID).closed = true;
            Blockchain.log(("Question"+questionID+"Closed").getBytes());
        }
    }
    ```

3. `closeQuestion` will close an existing question regardless of if it has reached its `requiredVotes` condition. This method can only be called by the contract owner, assigned to the deployer address.

    This method takes in a `quesitonID` parameter and will prematurely close a question after checking if the caller is the owner.

    ```java
    @Callable
    public static void closeQuestion(int questionID){
    Blockchain.require(Blockchain.getCaller().equals(owner));
        questions.get(questionID).closed = true;
    }
    ```

<!-- noneed? -->
## Tests

First up, we start by defining which packages we need to import for this class. After that, we define our main class.

```java
package VotingWithAion;
import avm.Address;
import org.aion.avm.embed.AvmRule;
import org.aion.avm.userlib.abi.ABIStreamingEncoder;
import org.aion.types.TransactionStatus;
import org.junit.*;
import java.math.BigInteger;

public class VotingRuleTest {
 ...
}
```

Next up, we create three global variables that we're going to be using within our tests.

```java
 @ClassRule
 public static AvmRule avmRule = new AvmRule(true);
 private static Address deployer = avmRule.getPreminedAccount();
 private static Address contractAddress;
```

## Frontend

The frontend is split between two pages, the voting page and the admin page. The code for these pages is found within `src/frontend/` and `src/frontend-admin/` respectively. Each of those folders contains the following:

- `index.html`: The markup for the webpage, this is just plain HTML.
- `css`: contains the `marx.min.css` file, which is just a classless CSS framework.
- `js`:
  - `web3.min.js`: creates a `Web3` object that allows us to integrate into the blockchain network.
  - `script.js`: contains our custom logic that lets the user interact with our application.

It should be noted that having a user enter their private key into a webpage is incredibly dangerous and should never be done in applications that real users are going to use. We've just done it here to simplify things.

Since you need to be able to publish a question before voting on it, we will start by going through `frontend-admin/`.

### Frontend Admin Page

The purpose of this page is to allow users to:

1. Input their private key
2. View poll details
3. Close polls
4. Publish Polls

#### Index - Admin

This file is relatively straightforward. You will notice that there are some empty `<div>`s with id attributes such as `poll_picker_div` or `question_publisher`. These are empty because the contents will be added to the page through the JavaScript script once the private key is received.

#### JavaScript - Admin

As mentioned before, we have two JavaScript files: `web3.min.js` and `script.js`. The `web3.min.js` file is taken from the [Aion Web3.js repository](https://github.com/aionnetwork/aion_web3), and we won't be changing anything within this file. All of our code takes place within the `script.js` file.

Right at the top of `script.js`, we define three global variables:

- `nodeUrl`: the URL of the Aion node we want to connect to.
- `web3`: a copy of the `Web3` objected defined by `web3.min.js`. This object takes our `nodeUrl` as an argument so it knows where to route the calls through.
- `contractAddress`: the address of our application that is deployed on the Aion Testnet.
- `pk`: a global declaration for the private key that will be provided by the user.
- `abi`: the interface used by web3 to make it easier to make calls and transactions.

So what is this abi thing and where did it come from? The abi is a simple representation of the Java class that is your contract. It outlines the method names as well as its arguments and their return types. This is a new, and easier, way of using web3 than the two prior projects in this repo and will be implemented in a bit. You can get the contract abi within the `target/` folder in your project. This file, named something like `LearningAion-1.0-SNAPSHOT.abi`, was generated upon the compilation of your Java class and can be copied into the `script.js` file in your frontend as a String variable.

next, we will pass the `abi` into another object that manages the interface for us to make our transactions.

```java
let abiObj = web3.avm.contract.Interface(abi);
```

Next, a `Poll` class is defined as well as a `getPollObject` function to make managing the `QuestionInfo` data a little easier on the frontend.

Now, we will start to set up the functions we will use to call values from the contract using the easier abi method. To make a contract call with the abi, use:

```java
await web3.avm.contract.readOnly.getNumberQuestions();
```

If the contract method takes any parameters then just include them like you would any other function call:

```java
await web3.avm.contract.readOnly.getQuestionStatus(questionID);
```

We do this for each value that we need to pull from the contract.

The `enterPrivateKey` function serves to receive the private key from the user and assign it to the global `pk` variable. To make contract calls with this way of using web3, you must include `pk` in the binding method that links the `contractAddress` to the `abiObj` initialized above. After completing these tasks, the function will call the `drawPollPicker` and `drawQuestionPublisher` method.

The `drawPollPicker`, `drawPoll` and `drawQuestionPublisher` functions will draw the UI to manage polls and publish them by pulling data from the `Poll` object we instantiated.

Now, lets make our transaction functions to be able to change values on our contracts. Both `newQuestion` and `closeQuestion` are written very similarly to a contract call. However instead of using `web3.avm.contract.readOnly`, we use `web3.avm.contract.transaction`. For example:

```java
await web3.avm.contract.transaction.newQuestion(question, choices, requiredVotes);
```

### Frontend Voting Page

The purpose of this page is to allow users to:

1. Input their private key
2. View poll details
3. Vote on Polls

Found in `frontend/`, the frontend voting page should adhere to a similar structure as the admin page. It includes:

- The contract call functions that use the abi to receive info on the available polls.
- The endpoint functions that are called by the buttons on the frontend
- A contract transaction function to send a vote to the contract.

### CSS

We're using [Mblode's](https://github.com/mblode) incredible [Marx CSS framework](https://github.com/mblode/marx). Not only is it incredibly simple to use with no classes or JavaScript to deal with, but it's very lightweight. Everything is contained within a single 11kb `marx.min.css` file.

## Suggested Improvements

There's a lot of room for improvement in this application. Having a user enter their private key into a window is not best practice. A better solution would be to couple this application with a browser wallet like [Syna+](https://chrome.google.com/webstore/detail/syna%20/bnhpllgghialpkpbeenoalpeoneieaje) or [Aiwa](https://getaiwa.com/). There is also no validation on any of the input fields, which would be a big issue if this application were in a production environment. This includes the fact that if a transaction fails due to lack of owner status or the fact an account has already voted, the user does have any feedback to tell them this.
