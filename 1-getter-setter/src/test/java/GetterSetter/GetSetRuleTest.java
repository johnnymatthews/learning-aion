package GetterSetter;

import org.aion.avm.core.util.ABIUtil;
import avm.Address;
import org.aion.avm.tooling.AvmRule;
import org.aion.vm.api.interfaces.ResultCode;
import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.ClassRule;
import org.junit.Test;

import java.math.BigInteger;

public class GetSetRuleTest 
{
    @ClassRule
    public static AvmRule avmRule = new AvmRule(true);
    private static Address from = avmRule.getPreminedAccount();
    private static Address dappAddress;

    @BeforeClass
    public static void deployDapp() {
        byte[] dapp = avmRule.getDappBytes(GetterSetter.GetSet.class, null);
        dappAddress = avmRule.deploy(from, BigInteger.ZERO, dapp).getDappAddress();
    }

    @Test
    public void testSetString() {
        byte[] txData = ABIUtil.encodeMethodArguments("setString","Hello Alice");
        AvmRule.ResultWrapper result = avmRule.call(from, dappAddress, BigInteger.ZERO, txData);
        ResultCode status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());
    }

    @Test
    public void testGetString() {
        byte[] txData = ABIUtil.encodeMethodArguments("getString");
        AvmRule.ResultWrapper result = avmRule.call(from, dappAddress, BigInteger.ZERO, txData);
        ResultCode status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());
    }
}

