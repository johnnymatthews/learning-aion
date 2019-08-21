package VotingWithAion;

import avm.Address;
import avm.Blockchain;
import org.aion.avm.tooling.abi.Callable;
import org.aion.avm.userlib.AionList;
import org.aion.avm.userlib.AionMap;
import org.aion.avm.userlib.AionSet;

/**
 * A simple voting contract for a voting dapp.
 *
 * Only the contract owner can submit a new question.
 * Each account can only vote for a question once.
 * The poll will be closed once a certain number of vote has been reached.
 *
 *See https://github.com/mohnjatthews/learning-aion for more dapp examples.
 *
 */

public class Voting {

    private static Address owner;
    private static AionMap<Integer, QuestionInfo> questions = new AionMap<>();
    private static int questionID;

    private static class QuestionInfo {
        String question;
        String[]  choices;
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

    static {
        owner = Blockchain.getCaller();
        questionID = 0;
    }

    @Callable
    public static String getQuestion(int questionID) {
        return questions.get(questionID).question;
    }

    @Callable
    public static boolean getQuestionStatus(int questionID) {
        return questions.get(questionID).closed;
    }

    @Callable
    public static int getRequiredVotes(int questionID) {
        return questions.get(questionID).requiredVotes;
    }

    @Callable
    public static String[] getChoices(int questionID) {
        return questions.get(questionID).choices;
    }

    @Callable
    public static String[] getVotes(int questionID) {
        String[] votes = new String[questions.get(questionID).votes.size()];
        int i = 0;
        for (String vote : questions.get(questionID).votes) {
            votes[i] = vote;
            i++;
        }
        return votes;
    }

    @Callable
    public static int getNumberQuestions(){
        return questions.size();
    }

    @Callable
    public static void newQuestion(String question, String[] choices, int requiredVotes) {
        Blockchain.require(Blockchain.getCaller().equals(owner));
        questions.put(questionID, new QuestionInfo(question, choices, requiredVotes));
        Blockchain.log("NewQuestionAdded".getBytes(), question.getBytes());
        questionID ++;
    }

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

    @Callable
    public static void closeQuestion(int questionID){
        Blockchain.require(Blockchain.getCaller().equals(owner));
        questions.get(questionID).closed = true;
    }

}
