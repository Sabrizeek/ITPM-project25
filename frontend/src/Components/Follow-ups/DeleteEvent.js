import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deleteEvent } from "./api";

const DeleteEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(id);
        navigate("/"); // Redirect to home or events list after deletion
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    }
  };

  return <button onClick={handleDelete}>Delete Event</button>;
};

export default DeleteEvent;