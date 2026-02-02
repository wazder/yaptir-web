/* ═══════════════════════════════════════════════════════════════════════
   OKEEP GALAXY CHAT LOGIC
   Handles the chat interface embedded in the main page.
   Powered by Groq API (Llama 3.1)
═══════════════════════════════════════════════════════════════════════ */

// ⚠️ API KEY'İNİ BURAYA EKLE
const GROQ_API_KEY = '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';

const SYSTEM_PROMPT = `Sen Okeep'in yapay zeka asistanısın. Okeep, işletmelere yapay zeka destekli otomasyon ve verimlilik çözümleri sunan bir teknoloji şirketidir.

Görevin:
- Ziyaretçilere Okeep'in hizmetleri hakkında bilgi vermek
- Sektöre özel çözümler önermek
- Demo talep etmeleri için yönlendirmek

Hizmetlerimiz:
🍽️ Restoran/Yeme-İçme: Stok optimizasyonu, atık azaltma, maliyet analizi, sipariş tahmini
🛒 E-ticaret: Dönüşüm oranı artırma, sepet analizi, kişiselleştirilmiş öneriler, müşteri segmentasyonu
🏠 Emlak: Otomatik randevu yönetimi, portföy eşleştirme, fiyat tahmini
🏥 Sağlık: Hasta takibi, randevu sistemi, hatırlatmalar

Önemli kurallar:
- Kısa ve öz yanıtlar ver (2-3 cümle)
- Samimi ve yardımsever ol
- Türkçe konuş
- Fiyat sorulursa "işletmenize özel fiyatlandırma için demo talep edin" de
- Demo için aşağıdaki iletişim formunu yönlendir
- Okeep dışı konularda "Bu konuda yardımcı olamıyorum, ama Okeep çözümleri hakkında sorularınızı yanıtlayabilirim" de`;

const conversationHistory = [];

export function initGalaxyChat() {
    const welcomeScreen = document.getElementById('galaxy-welcome');
    const input = document.getElementById('galaxy-input');
    const submitBtn = document.getElementById('galaxy-submit');
    const historyContainer = document.getElementById('galaxy-history');
    const chipContainer = document.getElementById('galaxy-suggestions');

    // If elements don't exist (e.g., restricted page), exit
    if (!input || !historyContainer) return;

    // Suggestion Chips Data
    const suggestions = [
        "Restoran maliyetlerimi nasıl düşürebilirim?",
        "E-ticaret dönüşüm oranlarını artırın",
        "Okeep demo alabilir miyim?"
    ];

    // Render Chips
    if (chipContainer) {
        chipContainer.innerHTML = '';
        suggestions.forEach(text => {
            const chip = document.createElement('div');
            chip.className = 'galaxy-chip';
            chip.textContent = text;
            chip.addEventListener('click', () => {
                input.value = text;
                handleSubmit();
            });
            chipContainer.appendChild(chip);
        });
    }

    // Submit Logic
    const handleSubmit = async () => {
        const text = input.value.trim();
        if (!text) return;

        // Transitions
        if (welcomeScreen && welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
            historyContainer.style.display = 'flex';
        }

        appendMessage('user', text);
        input.value = '';
        input.disabled = true;
        if (submitBtn) submitBtn.disabled = true;

        // Show typing indicator
        const typingDiv = appendMessage('ai', '...');
        typingDiv.classList.add('typing');

        try {
            const response = await callGroqAPI(text);
            typingDiv.textContent = response;
            typingDiv.classList.remove('typing');
        } catch (error) {
            console.error('Groq API Error:', error);
            typingDiv.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            typingDiv.classList.remove('typing');
        }

        input.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        input.focus();
    };

    // Events
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleSubmit();
    });

    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }

    // Helper: Append Message
    function appendMessage(role, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg msg-${role}`;
        msgDiv.textContent = text;
        historyContainer.appendChild(msgDiv);
        historyContainer.scrollTop = historyContainer.scrollHeight;
        return msgDiv;
    }
}

// Groq API Call
async function callGroqAPI(userMessage) {
    // Add user message to history
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory
            ],
            max_tokens: 300,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Groq API Error:', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0].message.content;

    // Add AI response to history
    conversationHistory.push({
        role: 'assistant',
        content: aiMessage
    });

    return aiMessage;
}
