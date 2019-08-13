# Getter Setter Project

In this project, we've created a simple _GetSet_ Java class. All this class does is create a string called `myString`. We can then get the value of that string by calling the `getString` method. Finally, we can set the string using the `setString` method.

This project was created using the Maven CLI and Aion4j plugin, so if you don't have them installed [you should do that now](https://beta-docs.aion.network/developers/tools/maven-cli/install).

## Running the Project

To run this project, you can either [import it into IntelliJ](https://beta-docs.aion.network/developers/tools/intellij-plugin/import-a-project), or re-initialize and compile everything using the Maven CLI.

1. Within this directory, re-initialize the project in Maven:

    ```bash
    mvn initialize
    ```

2. Compile the application:

    ```bash
    mvn clean install
    ```

3. Deploy the application:

    ```bash
    mvn aion4j:deploy
    ```

You can now interact with the application in the usual Maven ways. To get the string variable run `mvn aion4j:call -Dmethod='getString'`. To change the string run `mvn aion4j:call -Dmethod='setString' -Dargs='-T "New String!"'`. To view with the frontend, just open the `frontend/index.html` file in a browser.

## File Layout

There are three root folders within this project:

- `lib`: contains the `avm.jar` and other packages required to create blockchain applications.
- `src`: where our source code lives.
- `target`: a collection of classes and extra tools used to create our application.

We only really need to care about `src`. We won't be dealing directly with the other two folders. Within the `src` folder is:

- `frontend`: where we can store our front-end code like HTML, CSS, and JavaScript.
- `main`: where our main Java class lives.
- `test`: contains our test classes, used to make sure our application will work once it is compiled.

## Class Breakdown

We only have one Java class for this project, the `GetSet` class. It is stored are stored within `src/main/java/GetterSetter`, with `GetterSetter` being the _package_ name for this project. The `GetSet` class itself is incredibly simple.

First, we tell Java which package this class belongs to, and import some of the extra packages we'll be using in this application:

```java
package GetterSetter;
import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;
```

Next, we define our main class section:

```java
public class GetSet
{
    ...
}
```

All of our logic is contained within this public class. Next up we define two variables, `myString` and `owner`.

```java
private static String myString = "This is the default string.";
private static Address owner;
```

The first, `myString` is fairly simple as it contains the value of the string that we want to store on the blockchain. However, the `owner` variable is more interesting. It contains the address of the owner of this application. Notice that it has a type of `Address`. This is an _Aion specific_ type, you won't find it in regular Java applications.

Next up, we create our `clinit`. This is a function that is called when we first _deploy_ our contract. It is only ever called once.

```java
static {
    owner = Blockchain.getCaller();
}
```

Next up is the meat of the application, the `getString()` and `setString()` methods.

```java
@Callable
public static String getString() {
    return myString;
}

@Callable
public static void setString(String newStr) {
    onlyOwner();
    myString = newStr;
}
```

They both have a `@Callable` annotation above them. This just makes it easier for other programmers to understand what functions are available and which aren't. The `getString()` method doesn't take any arguments and just returns that global `myString` variable we set before. The `setString()` method takes a `newStr` argument, with a type of `String`. It then takes that `newStr` variable and sets it to the global `myString`.

One thing that's important to notice is that before any variables get changed the `setString()` method calls another function called `onlyOwner()`. That method is defined next in our class.

```java
private static void onlyOwner() {
    Blockchain.require(Blockchain.getCaller().equals(owner));
}
```

First up, notice that there's no `@Callable` annotation above the function. That's because only other methods _within this contract_ can call this method. The same property is achieved with the `private` _access modifer_ at the start of the method. The only way this function can be called is by having another function to have `onlyOwner();` within their function declaration, like `setString` for example.

What this `onlyOwner` method does is return true if the account calling this function matches the global `owner` variable we set before. Within the `clinit` we set the `owner` variable to whoever deployed the contract. The `Blockchain.getCaller()` method returns an `Address` for us.

The `setString` method will only continue past the first line _if_ the `onlyOwner` method returns `true`. If `onlyOwner` returns `false` then the `setString` method will fail and the `myString` variable will remain unchanged. It's also important to note here that `setString` has absolutely no idea who the caller is, or what the `owner` address is. The `setString` method only knows if the current caller is the owner of this application or not.

## Tests

Because we made this project using Maven and the Aion4j archetype, we get some tests for free! You can find the `GetSetRuleTest.java` class in the `src/test/java/GetterSetter` folder.

First up, we start by defining which packages we need to import for this class. You'll notice that there's substantially more in this class than in our main `GetSet.java` class. This is because the Maven archetype brings everything along that you might potentially need to write a test. Since this test never gets committed to the blockchain, it doesn't matter if it's a bit bloated. After that, we define our main class.

```java
public class GetSetRuleTest
{
    ...
}
```

Next up, we create three global variables that we're going to be using within our tests.

```java
@ClassRule
public static AvmRule avmRule = new AvmRule(true);
private static Address from = avmRule.getPreminedAccount();
private static Address dappAddress;
```

The first global variable `AvmRule` is both `public` and has the `@ClassRule` annotation applied to it. This means that `AvmRule` acts more like a new class instead of just a regular object.

The `from` and `dappAddress` variables are both addresses. The `dappAddress` is given the result from the `getPreminedAccount()` function found within the `AvmRule` object we imported in the line above. The `avmRule` object has a bunch of functions that you can use within your tests.

Next up, we create a `deployDapp` method.

```java
@BeforeClass
public static void deployDapp() {
    byte[] dapp = avmRule.getDappBytes(GetterSetter.GetSet.class, null);
    dappAddress = avmRule.deploy(from, BigInteger.ZERO, dapp).getDappAddress();
}
```

All this does is take our `GetSet.java` class and deploy it to the embedded avm, sometimes called the _local kernel_. It also sets the global `dappAddress` variable to the address of the `GetSet.java` application that was just deployed. The `@BeforeClass` annotation means that this method will run before every other script is run, which is handy because then the tests are always dealing with a _fresh_ version of the application.

Next up we have the first of our tests.

```java
@Test
public void testSetString() {
    byte[] txData = ABIUtil.encodeMethodArguments("setString","Hello Alice");
    AvmRule.ResultWrapper result = avmRule.call(from, dappAddress, BigInteger.ZERO, txData);
    ResultCode status = result.getReceiptStatus();
    Assert.assertTrue(status.isSuccess());
}
```

The handy `@Test` annotation helps us quickly find which methods we need, and also tells some text editors that this function can be run as a test. In this test, we're going to make sure that the `setString` method is working. First up we set the method we want to call and any arguments it needs. In our case, we're calling the `setString` method and supplying `Hello Alice` as a string. All this is then _encoded_ using `ABIUtil.encodeMethodArguments` and saved in the `txData` variable.

Then we take all the information we have and call the recently deployed application using `avmRule.call`. The test grabs the `from` and `dappAddress` we set before, and also included the `txData` variable we just created. The `BigInteger.ZERO` object is where we supply any value that we wanted to send to the contract. For example, if we wanted to send some `AION` to the contract, then we would enter that information here. But since we're not moving any tokens or anything, we just need to put in a `ZERO` value there. The results of this call are saved within the `result` variable.

Next up, we call the `getReceiptStatus()` function within the result object to find out if the call was successful or not.

Finally, we tell the test if the `status` or the call `isSuccess`ful, then the test has passed! However, if the status was not successful, then the test has failed. The `Assert` class is a [JUnit](http://junit.sourceforge.net/javadoc/org/junit/Assert.html) class.

The next test is pretty much the same, except we're attempting to call the `getString` method and we're not supplying any arguments.

```java
byte[] txData = ABIUtil.encodeMethodArguments("getString");
```

## Frontend

Now that we've covered everything that's happening on the Java side, we can get into the frontend and see what's happening with the JavaScript. The code for the frontend is within the `src/frontend` folder, and is split into three sections:

- `index.html`: The markup for the webpage, this is just plain HTML.
- `css`: contains the `marx.min.css` file, which is just a classless CSS framework.
- `js`:
  - `web3.js`: creates a `Web3` object that allows us to integrate into the blockchain network.
  - `script.js`: contains our custom logic that lets the user interact with our application.

### Index

The purpose of this front end is to allow users to:

1. See what the current string is.
2. Set the string to something else, if they have the correct private key.

This file is incredibly simple, and just contains two input fields to take our private key, and the new string we want to input. It should be noted that having a user enter their private key into a webpage is incredibly dangerous and should never be done in applications that real users are going to use. We've just done it here to simplify things.

The new string input field has an `id` of `new_string_input`, the private key input field has an `id` of `private_key_input`, and the current string output has an `id` of `current_string_output`. This is so we can reference them easily within our custom `script.js` file.

### CSS

We're using [Mblode's](https://github.com/mblode) incredible [Marx CSS framework](https://github.com/mblode/marx). Not only is it incredibly simple to use with no classes or JavaScript to deal with, but it's very lightweight. Everything is contained within a single 11kb `marx.min.css` file.

### JavaScript

As mentioned before, we have two JavaScript files: `web3.js` and `script.js`. The `web3.js` file is taken from the [Aion Web3.js repository](https://github.com/aionnetwork/aion_web3), and we won't be changing anything within this file. All of our coding takes place within the `script.js` file.

Right at the top of `script.js` we define three global variables:

- `nodeUrl`: the URL of the Aion node we want to connect to.
- `contractAddress`: the address of our application that is deployed on the Aion Testnet.
- `web3`: a copy of the `Web3` objected defined by `web3.js`. This object takes our `nodeUrl` as an argument so it knows where to route the calls through.

There are two _major_ methods within this script: `getString()` and `setString()`. Both of them have the `async` attribute, meaning that they will be executed asynchronously as soon as they are available. You can find out more about `async` functions from the [Mozilla Developers Network](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function).

Let's delve into the `getString` method. When making a call to a blockchain application there are four steps to take:

1. Create a data object.
2. Create a transaction object that _includes_ the data object.
3. Make the call to the blockchain by sending the transaction object.
4. Get the response from the blockchain.

Creating the data object is as simple as defining which method you want to call, and any arguments that go along with it. Since the `getString` method within our `GetSet.java` class doesn't take any arguments, we don't need to set them here.

```java
let data = web3.avm.contract.method("getString").encode();
```

The transaction contains vital information that the blockchain network needs to understand our request. The transaction object will look different for different types of requests, but for our simple call here we just need to supply which contract we want to talk to, the `data` object we just created`, and the _type_ of request this is.

```java
const transactionObject = {
    to: contractAddress,
    data: data,
    type: "0x1"
};
```

The `type` field can cause some confusion sometimes, so I'll clear it up here. If we're just making a call to an application and we're **not** _changing_ the blockchain in any way, then our type should be set to `0x1`. In our call, we are getting the value of a variable. We aren't changing the value of that variable, so we're not changing the _state_ of the blockchain. This is important because requesting the value of a variable is free, but changing a variable means changing the _state_ of the blockchain, and this requires funds. We'll get onto this later.

Once our transaction object has been created, we make the call to the blockchain and wait for the response. The `initialResponse` variable will hold the response information _once_ the blockchain has returned some data. The `await` modifier here is very important. If that modifier wasn't there then the JavaScript would expect a response immediately. But because we're dealing with a blockchain network here, we have to wait for the process to finish.

Once we've got the response from the network, we can decode it so it's in a language we can understand. This decoded response is fed into the `avmResponse` variable, which is then given to the `current_string_output` field in our `index.html` file. One thing to note here is that the `decode` function we used to translate the response take two arguments: the _type_ of variable we're expecting back, and the encoded response from the network. In our case, the variable _type_ we're expecting back in a string.

So that's the `getString` method in a nutshell. It's quite simple really. We define what we want to get back from our `GetSet.java` class, create a transaction object to ship it out in, send the request to the network, and show the response in our `index.html` file.

The `setString` method is slightly more complicated but still fairly easy to understand.

First up, we disable the submit button and change the text to _Loading..._. This is just a precaution so that the user doesn't accidentally send the same request to the network several times. This is generally good practice and you should follow this in your regular projects.

Next, we grab the private key and new string values from the inputs on the `index.html` page. These are saved into the `privateKeyInput` and `newStringInput` variables. We also create an account object here. This is done by supplying the `privateKeyToAccount()` function with the `privateKeyInput` variable we just made. The account object later gets embedded into the transaction object.

Just like in the `getString` method, we create a `data` object with the necessary information in it. The `method` and `encode()` sections of this object should seem familiar, however, the `inputs` section is new. When we requested the `getString` method, we didn't have to include any arguments, but now we do.

The `inputs` section of the `data` object takes an array as an argument type. Within this array, you must specify the _type_ of argument you are supplying, and the actual _value_ that you want to send. In our case, these two parameters are `string` and the `newStringInput` variable we created earlier. If the method we were calling took more than one argument, then we would have to define it here. For example, if the method required a string and an integer, we would define the inputs like this:

```java
.inputs(["string", "int"], ["This is a string", 123])
```

When defining the inputs to a method, the variable must be in the order that the method is expecting them. Supplying them in the wrong order will cause the request to fail. In this example case the method would need to look something like this:

```java
public static void exampleMethod(String inputString, int inputInteger) {
    ...
}
```

So back to our `setString` method. We've created our `data` object and now we need to add it into the `transaction` object. This object is similar to the one we made in the `getString` method, but there are some new additions:

- `from`: defines which account is making the request. This is the account which will pay for the transaction.
- `gasPrice`: the amount you're willing to pay for every _unit_ of gas.
- `gas`: the amount of _units_ of gas you're willing to pay.

When you're making any changes to the blockchain then you need to pay a fee. _Gas_ is the blockchain community's round-about way of saying _fee_.

The next few steps are similar to how things worked for the `getString` method, however this time we have to sign the transaction before we send it off to the network. This happens with `signTransaction(transaction, account.privateKey)`. Again, because we're working with a blockchain network, things happen asynchronously, so we put the `await` modifier at the start of the function call. It's a similar situation for getting the transaction receipt.

Once we've got confirmation that the transaction went through ok we call the `getString` method again so that we can see the new things. We also enable the submit button and change it's text to _Submit_.

Finally, we have a small function that called the `getString` method once the page has finished loading. This `onload` function is the first thing that is called when a user lands on the webpage.

## Suggested Improvements

There's a lot of room for improvement in this application. Having a user enter their private key into a window is not best practice. A better solution would be to couple this application with a browser wallet like [Syna+](https://chrome.google.com/webstore/detail/syna%20/bnhpllgghialpkpbeenoalpeoneieaje) or [Aiwa](https://getaiwa.com/). There is also no validation on any of the input fields, which would be a big issue if this application were in a production environment.
