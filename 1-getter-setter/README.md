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

## Classes

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

The first, `myString` is fairly simple as it contains the value of the string that we want to store on the blockchain. However `owner` is more interesting. It contains the address of the owner of this application. You'll see that it has a type of `Address`.

Next up, we create our `clinit`. This is a function that is called when we first _deploy_ our contract. It is only ever called once.

```java
static {
    owner = Blockchain.getCaller();
}
```

Within the `clinit` we set the `owner` variable to whoever deployed the contract. The `Blockchain.getCaller()` method returns an `Address` for us.

## Tests

## Frontend