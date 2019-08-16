package VotingWithAion;

import avm.Address;
import org.aion.avm.embed.AvmRule;
import org.aion.avm.userlib.abi.ABIStreamingEncoder;
import org.aion.types.TransactionStatus;
import org.junit.*;

import java.math.BigInteger;


public class VotingRuleTest {

    @ClassRule
    public static AvmRule avmRule = new AvmRule(true);

    //default address with balance
    private static Address deployer = avmRule.getPreminedAccount();

    private static Address contractAddress;

    private AvmRule.ResultWrapper publishNewQuestion(Address from, String question, String[] choices, int requiredVotes){

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();

        byte[] txData = encoder.encodeOneString("newQuestion")
                .encodeOneString(question)
                .encodeOneStringArray(choices)
                .encodeOneInteger(requiredVotes)
                .toBytes();

        return avmRule.call(from, contractAddress, BigInteger.ZERO, txData);
    }

    private AvmRule.ResultWrapper closeQuestion(Address from, int index){

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();

        byte[] txData = encoder.encodeOneString("closeQuestion")
                .encodeOneInteger(index)
                .toBytes();

        return avmRule.call(from, contractAddress, BigInteger.ZERO, txData);
    }

    private AvmRule.ResultWrapper newVote(Address from, int questionID, String choice){

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();

        byte[] txData = encoder.encodeOneString("newVote")
                .encodeOneInteger(questionID)
                .encodeOneString(choice)
                .toBytes();

        return avmRule.call(from, contractAddress, BigInteger.ZERO, txData);
    }

    @Before
    public  void deployContract() {

        byte[] contract = avmRule.getDappBytes(VotingWithAion.Voting.class, null);

        // Deploy the contract and get the contract address
        contractAddress = avmRule.deploy(deployer, BigInteger.ZERO, contract).getDappAddress();

    }

    @Test
    public void testCloseQuestion() {
        publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, 71);

        AvmRule.ResultWrapper result = closeQuestion(deployer, 0);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());
    }

    @Test
    public void testNewQuestion() {
        AvmRule.ResultWrapper result = publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, 71);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        //weird exception? but still passes test...
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        result = publishNewQuestion(caller, "Best Pet?", new String[]{"dog", "cat"}, 71);

        status = result.getReceiptStatus();
        Assert.assertTrue(status.isFailed());
    }

    @Test
    public void testNewVote() {
        publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, 71);

        AvmRule.ResultWrapper result = newVote(deployer, 0, "dog");

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());
    }

    @Test
    public void testGetNumberQuestions() {

        publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, 71);

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getNumberQuestions").toBytes();
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        AvmRule.ResultWrapper result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        Integer res = (Integer) result.getDecodedReturnData();
        Assert.assertEquals(1, (int) res);
    }

    @Test
    public void testGetQuestion() {

        String question = "Best Pet?";

        publishNewQuestion(deployer, question, new String[]{"dog", "cat"}, 71);

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getQuestion").encodeOneInteger(0).toBytes();
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        AvmRule.ResultWrapper result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        String res = (String) result.getDecodedReturnData();
        Assert.assertEquals(res, question);
    }

    @Test
    public void testGetQuestionStatus() {

        String question = "Best Pet?";

        publishNewQuestion(deployer, question, new String[]{"dog", "cat"}, 71);

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getQuestionStatus").encodeOneInteger(0).toBytes();
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        AvmRule.ResultWrapper result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        boolean res = (boolean) result.getDecodedReturnData();
        Assert.assertFalse(res);

        closeQuestion(deployer, 0);

        txData = encoder.encodeOneString("getQuestionStatus").encodeOneInteger(0).toBytes();
        caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        res = (boolean) result.getDecodedReturnData();
        Assert.assertTrue(res);


    }

    @Test
    public void testGetRequiredVotes() {
        int requiredVotes = 71;

        publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, requiredVotes);

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getRequiredVotes").encodeOneInteger(0).toBytes();
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        AvmRule.ResultWrapper result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        Integer res = (Integer) result.getDecodedReturnData();
        Assert.assertEquals((int) res, requiredVotes);
    }

    @Test
    public void testGetChoices() {
        String[] choices = {"dog", "cat"};

        publishNewQuestion(deployer, "Best Pet?", choices, 71);

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getChoices").encodeOneInteger(0).toBytes();
        Address caller = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        AvmRule.ResultWrapper result = avmRule.call(caller, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        String[] res = (String[]) result.getDecodedReturnData();
        Assert.assertArrayEquals(res, choices);
    }

    @Test
    public void testGetVotes() {
        String[] votes = {"dog", "dog", "cat"};

        publishNewQuestion(deployer, "Best Pet?", new String[]{"dog", "cat"}, 71);

        newVote(deployer, 0, "dog");
        Address caller0 = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        newVote(caller0, 0, "dog");
        Address caller1 = avmRule.getRandomAddress(BigInteger.TEN.pow(10));
        newVote(caller1, 0, "cat");

        ABIStreamingEncoder encoder = new ABIStreamingEncoder();
        byte[]txData = encoder.encodeOneString("getVotes").encodeOneInteger(0).toBytes();
        AvmRule.ResultWrapper result = avmRule.call(caller1, contractAddress, BigInteger.ZERO, txData);

        TransactionStatus status = result.getReceiptStatus();
        Assert.assertTrue(status.isSuccess());

        // Cast the return type
        String[] res = (String[]) result.getDecodedReturnData();
        Assert.assertArrayEquals(res, votes);
    }

}

