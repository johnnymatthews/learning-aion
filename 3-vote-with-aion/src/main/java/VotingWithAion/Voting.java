package VotingWithAion;

import avm.*;
import org.aion.avm.tooling.abi.Callable;
import org.aion.avm.userlib.AionList;
import org.aion.avm.userlib.AionMap;
import org.aion.avm.userlib.AionSet;

import java.awt.desktop.QuitEvent;
import java.util.Collection;
import java.util.Collections;
import java.util.stream.Stream;

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
    private static AionMap<Integer, QuestionInfo> Questions = new AionMap<>();
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

//    @Callable
//    public static void setOwner(/*Address newOwner*/){
////        Blockchain.require(Blockchain.getCaller().equals(owner));
////        owner = newOwner;
//        owner = Blockchain.getCaller();
//    }

    @Callable
    public static String getQuestion(int questionID) {
        return Questions.get(questionID).question;
    }

    @Callable
    public static boolean getQuestionStatus(int questionID) {
        return Questions.get(questionID).closed;
    }

    @Callable
    public static int getRequiredVotes(int questionID) {
        return Questions.get(questionID).requiredVotes;
    }

    @Callable
    public static String[] getChoices(int questionID) {
        return Questions.get(questionID).choices;
    }

    @Callable
    public static String[] getVotes(int questionID) {
        String[] votes = new String[Questions.get(questionID).votes.size()];
        int i = 0;
        for (String vote : Questions.get(questionID).votes) {
            votes[i] = vote;
            i++;
        }
        return votes;
    }

    @Callable
    public static int getNumberQuestions(){
        return Questions.size();
    }

    @Callable
    public static void newQuestion(String question, String[] choices, int requiredVotes) {
        Blockchain.require(Blockchain.getCaller().equals(owner));
        Questions.put(questionID, new QuestionInfo(question, choices, requiredVotes));
        Blockchain.log("NewQuestionAdded".getBytes(), question.getBytes());
        questionID ++;
    }

    @Callable
    public static void newVote(int questionID, String choice) {
        Blockchain.require(!Questions.get(questionID).closed && !Questions.get(questionID).voters.contains(Blockchain.getCaller()));
        Questions.get(questionID).voters.add(Blockchain.getCaller());
        Questions.get(questionID).votes.add(choice);
        if(Questions.get(questionID).votes.size() == Questions.get(questionID).requiredVotes) {
            Questions.get(questionID).closed = true;
            Blockchain.log(("Question"+questionID+"Closed").getBytes());
        }
    }

    @Callable
    public static void closeQuestion(int questionID){
        Blockchain.require(Blockchain.getCaller().equals(owner));
        Questions.get(questionID).closed = true;
    }

    @Callable
    public static void removeQuestion(int questionID){
        Blockchain.require(Blockchain.getCaller().equals(owner));
        Questions.get(questionID).closed = true;
    }

}
