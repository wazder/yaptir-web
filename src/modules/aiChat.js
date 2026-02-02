/* ═══════════════════════════════════════════════════════════════════════
   OKEEP GALAXY CHAT LOGIC
   Handles the chat interface embedded in the main page.
═══════════════════════════════════════════════════════════════════════ */

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
        "Restoran maliyetlerini nasıl düşürebilirim?",
        "E-ticaret dönüşüm oranları?",
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
    const handleSubmit = () => {
        const text = input.value.trim();
        if (!text) return;

        // Transitions
        if (welcomeScreen && welcomeScreen.style.display !== 'none') {
            welcomeScreen.style.display = 'none';
            historyContainer.style.display = 'flex';
        }

        appendMessage('user', text);
        input.value = '';

        // Simulate Response
        setTimeout(() => {
            const response = simulateAI(text);
            appendMessage('ai', response);
        }, 1000);
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
    }

    // Helper: Simulate AI
    function simulateAI(query) {
        const q = query.toLowerCase();
        if (q.includes('maliyet') || q.includes('fiyat')) return "Stok optimizasyonu ve atık yönetimi ile maliyetlerinizi %30'a kadar düşürebiliriz.";
        if (q.includes('ticaret')) return "AI algoritmamız, sepet terk oranlarını analiz edip kişiselleştirilmiş teklifler sunar.";
        if (q.includes('emlak')) return "Otomatik randevu ve portföy eşleştirme ile danışmanlarınızın verimini artırıyoruz.";
        if (q.includes('demo')) return "Hemen aşağıdan iletişim bilgilerinizi bırakın, size özel bir demo planlayalım! 👇";
        return "Sektörünüze özel verimlilik raporu hazırlayabilirim. İletişim formunu doldurmanız yeterli.";
    }
}
