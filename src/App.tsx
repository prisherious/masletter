import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"

// Holt die NFC-ID aus der URL: z. B. /04D15A1D3B4189 → "04D15A1D3B4189"
const NFC_ID = decodeURIComponent(
  window.location.pathname.replace(/^\/+/, "") || "default"
)

function App() {
  const [messages, setMessages] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("message")
        .eq("nfc_id", NFC_ID)
        .order("created_at", { ascending: true })

      if (error) {
        console.error("Fehler beim Laden:", error.message)
        return
      }

      setMessages(data?.map((m) => m.message) || [])
    }

    loadMessages()
  }, [])

  const sendMessage = async () => {
    if (input.trim() === "") return

    setLoading(true)

    const { error } = await supabase.from("messages").insert({
      nfc_id: NFC_ID,
      message: input,
      created_at: new Date().toISOString(),
    })

    setLoading(false)
    setInput("")

    if (error) {
      console.error("Fehler beim Speichern:", error.message)
      return
    }

    setMessages([...messages, input])
  }

  return (
    <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-pink-600">
          💌 Nachricht für <span className="text-pink-400">{NFC_ID}</span>
        </h1>

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
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-md px-4 py-2 text-sm"
          >
            {loading ? "..." : "Senden"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
