/* ═══════════════════════════════════════════════════════════════════════
   YAPTIR.IO GALAXY CHAT LOGIC
   Handles the chat interface embedded in the main page.
   Powered by Groq API (Llama 3.1)
═══════════════════════════════════════════════════════════════════════ */

// Groq API Key (Free tier)
const GROQ_API_KEY = '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';

const SYSTEM_PROMPT = `Sen Yaptir.io'nun yapay zeka asistanısın. Yaptir.io, HER SEKTÖRDEN işletmelere yapay zeka destekli otomasyon ve verimlilik çözümleri sunan bir teknoloji şirketidir. Hangi sektör olursa olsun, işletmelere özel çözümler üretiyoruz!

Görevin:
- Ziyaretçilere Yaptir.io'nun hizmetleri hakkında bilgi vermek
- HER sektöre özel çözümler önermek (hiçbir sektörü reddetme!)
- Demo talep etmeleri için yönlendirmek
- Ekip üyeleri hakkında bilgi vermek

Temel Çözümlerimiz (HER SEKTÖRE UYARLANABİLİR):
📊 Veri Analizi & Raporlama: Satış, müşteri, stok verilerini analiz edip actionable insights
📈 Otomasyon: Tekrarlayan işleri otomatikleştirme, zaman tasarrufu
🎯 Müşteri Yönetimi: CRM entegrasyonu, müşteri segmentasyonu, kişiselleştirme
📅 Randevu & Rezervasyon: Online randevu sistemi, hatırlatmalar, takvim yönetimi
💰 Maliyet Optimizasyonu: Gereksiz harcamaları tespit, verimlilik artırma
🤖 AI Asistan: 7/24 müşteri desteği, sık sorulan sorular, chatbot

Sektör Örnekleri:
🍽️ Restoran: Stok optimizasyonu, atık azaltma, sipariş tahmini
🛒 E-ticaret: Dönüşüm artırma, sepet analizi, öneri sistemi
🏠 Emlak: Portföy eşleştirme, fiyat tahmini
🏥 Sağlık: Hasta takibi, randevu sistemi
💪 Spor Salonu: Üye yönetimi, randevu sistemi, doluluk analizi, üye sadakati
💇 Kuaför/Güzellik: Online randevu, müşteri hatırlatmaları, stok takibi
🏫 Eğitim: Öğrenci takibi, ders programı, veli iletişimi
🚗 Oto Servis: Randevu yönetimi, parça stoku, müşteri geçmişi
Ve daha fazlası...

Ekibimiz:
🎨 Musa Soylu - Tasarımcı: Kullanıcı deneyimi ve görsel tasarım uzmanı. Estetik ile işlevselliği harmanlıyor.
⚖️ Nazlı Nehir Sertbaş - Hukuk Danışmanı: Şirket hukuku ve sözleşme yönetimi uzmanı. Yasal süreçlerde güvenilir rehber.
💻 Hasan Tatar - Yazılım Geliştirici: Full-stack geliştirici. Modern web teknolojileri ve kullanıcı deneyimi odaklı.
💻 Umut Gökmen - Yazılım Geliştirici: Backend ve sistem mimarisi uzmanı. Ölçeklenebilir çözümler geliştiriyor.
💻 Furkan Bora - Yazılım Geliştirici: Yazılım mühendisi. Performans optimizasyonu ve temiz kod mimarisi.

Önemli kurallar:
- Kısa ve öz yanıtlar ver (2-3 cümle)
- Samimi, pozitif ve yardımsever ol
- Türkçe konuş
- HİÇBİR SEKTÖRÜ REDDETME! Her sektöre çözüm üretebileceğimizi vurgula
- Sektör ne olursa olsun "size özel çözümler geliştirebiliriz" de
- Fiyat sorulursa "işletmenize özel fiyatlandırma için demo talep edin" de
- Demo için iletişim formunu yönlendir
- Ekip hakkında sorulduğunda ilgili kişinin rolü ve uzmanlık alanını belirt
- Yaptir.io dışı konularda (politika, spor sonuçları vs.) "Bu konuda yardımcı olamıyorum, ama işletmeniz için neler yapabileceğimizi konuşalım!" de`;

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
        "Yaptir.io demo alabilir miyim?"
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
            // Scroll to bottom after AI response
            setTimeout(() => {
                historyContainer.scrollTop = historyContainer.scrollHeight;
            }, 100);
        } catch (error) {
            console.error('Groq API Error:', error);
            typingDiv.textContent = 'Bir hata oluştu. Lütfen tekrar deneyin.';
            typingDiv.classList.remove('typing');
            historyContainer.scrollTop = historyContainer.scrollHeight;
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
