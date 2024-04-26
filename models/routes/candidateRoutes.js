const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware } = require("../jwt");
const Candidate = require('../models/candidate');
const User = require('../models/user');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user && user.role === 'admin') {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

router.post('/', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "User does not have admin role" });
        }
        const data = req.body;
        const newCandidate = new Candidate(data);
        const response = await newCandidate.save()
        console.log('Data Saved');
        res.status(200).json({ response: response });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal save error' });
    }
})

router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "User does not have admin role" });
        }
        const candidateID = req.params.candidateID;
        const updatedCandidateData = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, updatedCandidateData, {
            new: true,
            runValidators: true,
        })
        console.log(response);
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("Candidate data updated");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal save error' });
    }
})

router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            return res.status(403).json({ message: "User has not admin role" });
        }
        const candidateID = req.params.candidateID;
        const response = await Candidate.findByIdAndDelete(candidateID);
        console.log(response);
        if (!response) {
            return res.status(404).json({ error: "Candidate not found" });
        }
        console.log("Candidate Deleted");
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal save error' });
    }
})

router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
    const candidateID = req.params.candidateID;
    const userId = req.user.id;
    try {
        const candidate = await Candidate.findById(candidateID)
        if (!candidate) {
            return res.status(404).json({ message: "Candidate not found" })
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        if (user.isVoted) {
            return res.status(400).json({ message: "You have already voted" })
        }
        if (user.role === 'admin') {
            return res.status(403).json({ message: "Admin is not allowed" })
        }
        candidate.voters.push({ user: userId })
        console.log("here");
        candidate.voteCount++;
        await candidate.save();

        user.isVoted = true;
        await user.save();
        res.status(200).json({ message: "Vote Recorded Successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal save error' });
    }
})

router.get('/vote/count', async (req, res) => {
    try {
        const candidates = await Candidate.find().sort({ voteCount: 'desc' });
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                count: data.voteCount
            }
        })
        return res.status(200).json(voteRecord)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal save error' });
    }
})

router.get('/', async (req, res) => {
    try {
        const candidates = await Candidate.find({}, 'name party -_id');
        res.status(200).json(candidates);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
