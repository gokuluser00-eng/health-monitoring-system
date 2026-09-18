import express from "express";
import { db } from "../services/db.js";
import { canAccessPatient, findPatient } from "../middleware/auth.js";

const router = express.Router();

// GET /api/messages
router.get("/", (req, res) => {
  const { patientId } = req.query;

  let messages = [...db.data.messages]
    .filter((message) =>
      canAccessPatient(req.user, findPatient(message.patientId))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (patientId) {
    messages = messages.filter((m) => m.patientId === patientId);
  }

  res.json({ messages });
});

// POST /api/messages - Send message
router.post("/", (req, res) => {
  const {
    patientId,
    senderRole,
    senderName,
    recipientRole,
    subject,
    category,
    content,
  } = req.body;

  if (!patientId || !content) {
    return res
      .status(400)
      .json({ error: "patientId and content are required." });
  }
  if (!canAccessPatient(req.user, findPatient(patientId))) {
    return res
      .status(403)
      .json({ error: "You are not authorized to message this patient." });
  }

  const newMsg = {
    id: `MSG-${Date.now()}`,
    patientId,
    senderRole: senderRole || "doctor",
    senderName: senderName || "Care Team Provider",
    recipientRole: recipientRole || "patient",
    subject: subject || "Update from Healthcare Team",
    category: category || "general",
    content,
    timestamp: new Date().toISOString(),
    read: false,
  };

  db.data.messages.unshift(newMsg);
  db.save();

  res
    .status(201)
    .json({ message: "Message sent successfully.", messageRecord: newMsg });
});

// PUT /api/messages/:id/read
router.put("/:id/read", (req, res) => {
  const msg = db.data.messages.find((m) => m.id === req.params.id);
  if (!msg) {
    return res.status(404).json({ error: "Message not found." });
  }
  if (!canAccessPatient(req.user, findPatient(msg.patientId))) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update this message." });
  }

  msg.read = true;
  db.save();

  res.json({ message: "Message marked as read.", messageRecord: msg });
});

export default router;
