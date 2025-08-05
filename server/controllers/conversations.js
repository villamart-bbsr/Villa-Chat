import Conversation from '../models/conversation.js';

export const getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({ 'Attendees.label': req.userName, 'Attendees.value': req.userId  }).sort({ UpdatedAt: -1 });
        res.status(200).json(conversations);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const getConversation = async (req, res) => {
    const { id } = req.params;
    try {
        const conversation = await Conversation.findById(id);
        res.status(200).json(conversation);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

export const postMessage  = async (req, res) => {
    try {
        const { sender, message, timestamp, type, fileName, body } = req.body;
        const { id: roomId } = req.params;
        
        const conversation = await Conversation.findById(roomId);
        
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        
        conversation.Messages.push({
            senderId: req.userId,
            sender: sender,
            message: message,
            timestamp: timestamp,
            type: type,
            fileName: fileName,
            body: body
        });
        conversation.UpdatedAt = timestamp;

        const updatedConversation = await Conversation.findByIdAndUpdate(roomId, conversation, { new: true });

        res.json(updatedConversation);
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: error.message });
    }
}

export const createConversation  = async (req, res) => {
    const convo = req.body;
    // Set the creator as admin
    const newConversation = new Conversation({ 
        ...convo, 
        Admin: {
            id: req.userId,
            name: req.userName
        }
    });
    try {
        await newConversation.save();
        res.status(201).json(newConversation);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updateGroupDetails = async (req, res) => {
    const { id } = req.params;
    const { Subject, Attendees } = req.body;
    
    try {
        const conversation = await Conversation.findById(id);
        
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }
        
        // Check if the current user is the admin
        if (conversation.Admin.id !== req.userId) {
            return res.status(403).json({ message: "Only group admin can edit group details" });
        }
        
        // Update group details
        const updateData = {
            UpdatedAt: new Date()
        };
        
        if (Subject) updateData.Subject = Subject;
        if (Attendees) updateData.Attendees = Attendees;
        
        const updatedConversation = await Conversation.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        );
        
        res.status(200).json(updatedConversation);
    } catch (error) {
        console.error('Error updating group details:', error);
        res.status(500).json({ message: error.message });
    }
}
