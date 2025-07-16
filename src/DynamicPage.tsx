import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

interface Message {
  id: number;
  message: string;
  nfc_id: string;
  created_at: string;
}

function DynamicPage() {
  const { tagId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const loadMessages = async () => {
      if (!tagId) return;
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("nfc_id", tagId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Fehler beim Laden:", error.message);
        return;
      }

      if (data) {
        setMessages(data);
      }
    };

    loadMessages();
  }, [tagId]);

  const sendMessage = async () => {
    if (!input.trim() || !tagId) return;

    const { error } = await supabase.from("messages").insert({
      nfc_id: tagId,
      message: input,
    });

    if (error) {
      console.error("Fehler beim Senden:", error.message);
      return;
    }

    setMessages([...messages, { id: Date.now(), message: input, nfc_id: tagId, created_at: new Date().toISOString() }]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h1>💌 Love Letter</h1>

      {messages.length === 0 && (
        <p className="text-gray-400 text-sm text-center">Noch keine Nachrichten.</p>
      )}

      {messages.map((msg) => (
        <div key={msg.id} className="message received love-letter">
          {msg.message}
          <div className="message-time">
            {new Date(msg.created_at).toLocaleDateString()}
          </div>
        </div>
      ))}

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Schreib etwas Schönes..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button className="chat-send-button" onClick={sendMessage}>➤</button>
      </div>
    </div>
  );
}

export default DynamicPage;
