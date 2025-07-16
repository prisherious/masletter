import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function DynamicPage() {
  const { tagId } = useParams()
  const [messages, setMessages] = useState<string[]>([])

  useEffect(() => {
    async function loadMessages() {
      const { data, error } = await supabase
        .from('messages')
        .select('text')
        .eq('nfc_id', tagId)

      if (!error && data) {
        setMessages(data.map((m) => m.text))
      }
    }
    if (tagId) loadMessages()
  }, [tagId])

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Nachrichten für Tag: {tagId}</h1>
      {messages.length > 0 ? (
        <ul className="space-y-2">
          {messages.map((msg, i) => (
            <li key={i} className="bg-gray-100 p-2 rounded">{msg}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Keine Nachrichten gefunden.</p>
      )}
    </div>
  )
}
