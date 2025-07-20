const form = document.getElementById('chat-form');
const input = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');

/**
 * Menambahkan pesan ke kontainer obrolan.
 * @param {string} sender - Pengirim pesan ('user' atau 'bot').
 * @param {string} message - Konten pesan.
 * @returns {HTMLElement} Elemen pesan yang baru dibuat.
 */
function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.innerText = message; // Menggunakan innerText untuk mencegah XSS
    chatContainer.appendChild(messageElement);
    // Otomatis gulir ke pesan terbaru
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return messageElement;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage);
  input.value = '';

  // Tampilkan indikator loading yang interaktif
  const loadingElement = document.createElement('div');
  loadingElement.classList.add('message', 'bot', 'loading');
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    loadingElement.appendChild(dot);
  }
  chatContainer.appendChild(loadingElement);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown server error occurred.' }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    loadingElement.remove(); // Hapus indikator loading
    appendMessage('bot', data.reply); // Tampilkan balasan sebenarnya
  } catch (error) {
    console.error('Error fetching from API:', error);
    loadingElement.remove(); // Hapus indikator loading
    appendMessage('bot', `Sorry, something went wrong. Please try again. \nError: ${error.message}`); // Tampilkan pesan error
  }
});