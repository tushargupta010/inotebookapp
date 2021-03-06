const express = require("express");
const fetchUser = require("../middleware/FetchUser");
const router = express.Router();
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

// Route 1 : Get all the Notes details using GET "/api/notes/fetchallnotes". Login required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error.");
  }
});

// Route 2 : Add new Notes details using POST "/api/notes/addnote". Login required
router.post(
  "/addnote",
  fetchUser,
  // validations applied
  [
    body("title", "Enter valid title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 characters").isLength({
      min: 5,
    }),
    body("tag").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      // if errors in validation, return Bad request errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      const { title, description, tag } = req.body;

      // Creating and saving a notes
      const note = new Notes({ title, description, tag, user: req.user.id });
      const savedNote = await note.save();

      res.json(note);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error.");
    }
  }
);

// Route 3 : Updating an existing Notes details using PUT "/api/notes/updatenote". Login required
router.put("/updatenote/:id", fetchUser, async (req, res) => {
  try {
    const { title, description, tag } = req.body;

    // create a newNote object
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    // find a note to be updated
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    const updatedNote = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json(updatedNote);
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error.");
  }
});

// Route 4 : Deleting an existing Notes details using DELETE "/api/notes/deletenote". Login required
router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    // find a note to be deleted
    const note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }
    // Allowed deletion if user owns this notes
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    const deletedNote = await Notes.findByIdAndDelete(req.params.id);
    res.json({ Success: "Note has been deleted", note: deletedNote });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;
