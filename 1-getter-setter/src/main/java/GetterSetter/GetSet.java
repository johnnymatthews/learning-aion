package GetterSetter;

import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;

public class GetSet
{
    private static String myString = "This is the default string.";
    private static Address owner;

    static {
        owner = Blockchain.getCaller();
    }

    @Callable
    public static String getString() {
        return myString;
    }

    @Callable
    public static void setString(String newStr) {
        onlyOwner();
        myString = newStr;
    }

    private static void onlyOwner() {
        Blockchain.require(Blockchain.getCaller().equals(owner));
    }

}
