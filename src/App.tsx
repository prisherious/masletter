import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "./supabaseClient";

function App() {
  const { tagId } = useParams(); // Liest die NFC-ID aus der URL
  const NFC_ID = tagId || "default";

  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  // Nachrichten laden
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("nfc_id", NFC_ID)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Fehler beim Laden:", error.message);
        return;
      }

      if (data) {
        setMessages(data.map((m) => m.message));
      }
    };

    loadMessages();
  }, [NFC_ID]);

  // Nachricht senden
  const sendMessage = async () => {
    if (input.trim() === "") return;

    const { error } = await supabase.from("messages").insert({
      nfc_id: NFC_ID,
      message: input,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Fehler beim Speichern:", error.message);
      return;
    }

    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-pink-600">
          💌 Dein LoveLetter
        </h1>
        <p className="text-center text-xs text-gray-400 mb-2">
          ID: <code>{NFC_ID}</code>
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto border p-3 rounded-md bg-gray-50">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm text-center">
              Noch keine Nachricht.
            </p>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className="bg-pink-100 text-pink-900 p-2 rounded-md text-sm shadow"
            >
              {msg}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded-md p-2 text-sm"
            placeholder="Schreib eine Nachricht..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-md px-4 py-2 text-sm"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
