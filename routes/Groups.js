// study-group-backend/routes/Groups.js
const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const { protect } = require('../middlewares/auth');

// Create group and invite via email
router.post('/', protect, async (req, res) => {
  const { name, description, memberEmails } = req.body;

  try {
    // Input validation
    if (!name || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and description are required' 
      });
    }

    let memberIds = [];
    
    // If there are member emails, find users by email
    if (memberEmails && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      memberIds = members.map(u => u._id);
    }

    // Add creator if not already included
    if (!memberIds.some(id => id.toString() === req.user._id.toString())) {
      memberIds.push(req.user._id);
    }

    const group = await Group.create({ 
      name, 
      description, 
      members: memberIds 
    });

    // Populate members for response
    const populatedGroup = await Group.findById(group._id).populate('members', 'name email');
    
    res.status(201).json(populatedGroup);
  } catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create group', 
      error: err.message 
    });
  }
});

// Get all groups that user is a member of
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch groups', 
      error: err.message 
    });
  }
});

// Get group by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email');
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is a member of this group
    const isMember = group.members.some(member => 
      member._id.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not a member of this group.' 
      });
    }

    res.json(group);
  } catch (err) {
    console.error('Error fetching group:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch group', 
      error: err.message 
    });
  }
});

// Update group
router.put('/:id', protect, async (req, res) => {
  try {
    const { name, description, memberEmails } = req.body;
    
    // Input validation
    if (!name || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and description are required' 
      });
    }

    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is a member of this group
    const isMember = group.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not a member of this group.' 
      });
    }

    // Update basic info
    group.name = name;
    group.description = description;

    // Update members if new emails provided
    if (memberEmails && memberEmails.length > 0) {
      const members = await User.find({ email: { $in: memberEmails } });
      let memberIds = members.map(u => u._id);
      
      // Ensure the updating user remains in the group
      if (!memberIds.some(id => id.toString() === req.user._id.toString())) {
        memberIds.push(req.user._id);
      }
      
      group.members = memberIds;
    }

    await group.save();

    // Populate members for response
    const updatedGroup = await Group.findById(group._id).populate('members', 'name email');
    
    res.json(updatedGroup);
  } catch (err) {
    console.error('Error updating group:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update group', 
      error: err.message 
    });
  }
});

// Delete group
router.delete('/:id', protect, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    
    if (!group) {
      return res.status(404).json({ 
        success: false, 
        message: 'Group not found' 
      });
    }

    // Check if user is a member of this group
    const isMember = group.members.some(member => 
      member.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You are not a member of this group.' 
      });
    }

    await Group.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true, 
      message: 'Group deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting group:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete group', 
      error: err.message 
    });
  }
});

module.exports = router;