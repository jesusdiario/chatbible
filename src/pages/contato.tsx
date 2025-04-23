import { useState } from "react"

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simula envio (poderia chamar um service ou API real)
    await new Promise((res) => setTimeout(res, 1000))

    setLoading(false)
    setSubmitted(true)
    setForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">📩 Entre em contato</h1>

      {submitted && (
        <div className="bg-green-100 text-green-800 p-4 rounded mb-4">
          Mensagem enviada com sucesso! ✅
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Mensagem</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded h-32"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/80"
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
      </form>
    </div>
  )
}
