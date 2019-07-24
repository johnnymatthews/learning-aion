# Getter Setter Project

In this project, we've created a simple _GetSet_ Java class. All this class does is create a string called `myString`. We can then get the value of that string by calling the `getString` method. Finally, we can set the string using the `setString` method.

This project was created using the Maven CLI and Aion4j plugin, so if you don't have them installed you should do that now.

## File Layout

There are three root folder within this project:

- `lib`: contains the `avm.jar` and other packages required to create blockchain applications.
- `src`: were our source code lives.
- `target`: a collection of classes and extra tools used to create out application.

We only really need to care about `src`. We won't be dealing directly with the other two folders. Within the `src` folder is:

- `frontend`: where we can store our front-end code like HTML, CSS, and JavaScript.
- `main`: where our main Java class lives.
- `test`: contains our test classes, used to make sure out application will work once it is compiled.

## Class Breakdown

We only have one Java class for this project, the `GetSet` class. It is stored are stored within `src/main/java/GetterSetter`, with `GetterSetter` being the _package_ name for this project. The `GetSet` class itself is incredibly simple.

First we tell Java which package this class belongs to, and import some of the extra packages we'll be using in this application:

```java
package GetterSetter;
import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;
```

Next we define our main class section:

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

The first, `myString` is fairly simple as it contains the value of the string that we want to store on the blockchain. However `owner` is more interesting. It contains the address of the owner of this application. Notice that it has a type of `Address`. This is an _Aion specific_ type, you won't find it in regular Java applications.

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

They both have a `@Callable` annotation above them. This just makes it easier for other programmers to understand what functions are available and which aren't. The `getString()` method doesn't take any arguments and just returns that global `myString` variable we set before. The `setString()` method takes a `newStr` argument, with a type of `String`, obviously. It then takes that `newStr` variable and sets it to the global `myString`.

One thing that's important to notice is that before any variables get changed the `setString()` method calls another function called `onlyOwner()`. That method is defined next in our class.

```java
private static void onlyOwner() {
    Blockchain.require(Blockchain.getCaller().equals(owner));
}
```

First up, notice that there's no `@Callable` annotation above the function. That's because only other methods _within this contract_ can call this method. The same property is achieved with the `private` _access modifer_ at the start of the method. The only way this function can be called is by having another function to have `onlyOwner();` within their function declaration , like `setString` for example.

What this `onlyOwner` method does is return true if the account calling this function matches the global `owner` variable we set before. Within the `clinit` we set the `owner` variable to whoever deployed the contract. The `Blockchain.getCaller()` method returns an `Address` for us.

The `setString` method will only continue pass the first line _if_ the `onlyOwner` method returns `true`. If `onlyOwner` returns `false` then the `setString` method will fail and the `myString` variable will remain unchanged. It's also important to note here that `setString` has absolultely no idea who the caller is, or what the `owner` address is. The `setString` method only knows if the current caller is the owner of this application or not.

## Tests

Because we made this project using Maven and the Aion4j archetype, we get some tests for free! You can find the `GetSetRuleTest.java` class in the `src/test/java/GetterSetter` folder.

First up, we start out by defining which pacakges we need to import for this class. You'll notice that there's substantially more in this class than in our main `GetSet.java` class. This is because the Maven archetype brings everything along that you might potentially need to write a test. Since this test never gets committed to the blockchain, it doesn't matter if it's a bit bloated. After that, we define our main class.

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

The first global variable `AvmRule` is both `public` and has the `@ClassRule` annotation applied to it.

The `from` and `dappAddress` variables are both addresses. The `dappAddress` is given the result from the `getPreminedAccount()` function found within the `AvmRule` object we imported in the line above.

## Frontend

