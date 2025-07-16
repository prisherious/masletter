import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

interface Message {
  id: string
  message: string
  created_at: string
}

export default function DynamicPage() {
  const { tagId } = useParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tagId) fetchMessages(tagId)
  }, [tagId])

  async function fetchMessages(nfcId: string) {
    const { data, error } = await supabase
      .from('messages')
      .select('id, message, created_at')
      .eq('nfc_id', nfcId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden:', error.message)
    } else {
      setMessages(data || [])
    }
  }

  async function sendMessage() {
    if (!newMessage.trim() || !tagId) return

    setLoading(true)

    const { error } = await supabase.from('messages').insert([
      {
        message: newMessage,
        nfc_id: tagId,
        created_at: new Date().toISOString(),
      },
    ])

    setLoading(false)
    setNewMessage('')

    if (error) {
      alert('Fehler beim Senden der Nachricht.')
      console.error(error)
    } else {
      fetchMessages(tagId)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Nachrichten für Tag <span className="text-pink-500">{tagId}</span>
      </h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Schreibe eine Liebesnachricht..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="w-full p-2 border rounded mb-2"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="w-full bg-pink-500 text-white p-2 rounded hover:bg-pink-600 transition"
        >
          {loading ? 'Senden...' : 'Senden'}
        </button>
      </div>

      <div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className="bg-gray-100 p-3 rounded mb-2">
              <p>{msg.message}</p>
              <span className="text-xs text-gray-500">
                {new Date(msg.created_at).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">Keine Nachrichten vorhanden.</p>
        )}
      </div>
    </div>
  )
}
