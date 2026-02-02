/* ═══════════════════════════════════════════════════════════════════════
   OKEEP AI STUDIO - Sector Spotlight Logic
   Handles the interactive display of sector-specific AI benefits.
   Now supports Hover-to-Preview.
═══════════════════════════════════════════════════════════════════════ */

export const sectorsData = [
    // ─── Yeme & İçme ───
    {
        icon: '🍕', label: 'Restoran',
        title: 'Restoranınız İçin Yapay Zeka',
        desc: 'Müşteri yorumlarını analiz edin, yoğun saatlere göre personel planlayın ve stok maliyetlerini %20 düşürün.',
        features: ['Otomatik Stok', 'Yorum Analizi', 'Akıllı Vardiya']
    },
    {
        icon: '☕', label: 'Kafe',
        title: 'Kahve Dükkanınızın Yeni Beyni',
        desc: 'Sadakat programlarını kişiselleştirin, kahve tüketimine göre sipariş tahminleri yapın. Baristanız sadece kahve yapsın.',
        features: ['QR Menü', 'Sadakat Analizi', 'Tedarik Planı']
    },
    {
        icon: '🍸', label: 'Bar',
        title: 'Gece Hayatında Veri Odaklı Akış',
        desc: 'En popüler kokteylleri belirleyin, stok kayıplarını en aza indirin ve müşteri yoğunluğunu ısı haritasıyla izleyin.',
        features: ['Stok Takibi', 'Popüler Ürünler', 'Maliyet Analizi']
    },
    {
        icon: '🍔', label: 'Fast Food',
        title: 'Hız Tutkunlarına Hızlı Servis',
        desc: 'Sipariş sürelerini milisaniyelerle ölçün, yoğunluk anında mutfak operasyonunu otomatik optimize edin.',
        features: ['Hız Analizi', 'Kiosk Entegre', 'Tahminleme']
    },
    {
        icon: '🥐', label: 'Fırın',
        title: 'Taze Ürün, Sıfır Atık',
        desc: 'Günlük üretim miktarını hava durumu ve geçmiş satışlara göre belirleyin. Akşam raflarınız boş, kasanız dolu kalsın.',
        features: ['Üretim Planı', 'Atık Yönetimi', 'Talep Tahmini']
    },
    {
        icon: '🥡', label: 'Paket Servis',
        title: 'Kurye Operasyonunda Tam Kontrol',
        desc: 'Teslimat rotalarını optimize edin, kurye performansını izleyin ve müşteri memnuniyetini zirveye taşıyın.',
        features: ['Rota Optimizasyonu', 'Sıcak Teslimat', 'Kurye Takip']
    },
    {
        icon: '🍽️', label: 'Fine Dining',
        title: 'Kusursuz Misafir Deneyimi',
        desc: 'VIP müşterilerinizi tanıyın, rezervasyon geçmişine göre özel öneriler sunun ve servis kalitesini standartlaştırın.',
        features: ['VIP CRM', 'Rezervasyon AI', 'Özel Menü']
    },

    // ─── Perakende & Mağazacılık ───
    {
        icon: '🛒', label: 'E-Ticaret',
        title: 'E-Ticarette Dönüşüm Rekorları',
        desc: 'Sepet terk edenleri geri kazanın ve müşterilerinize tam olarak aradıkları ürünleri önerin.',
        features: ['Sepet Analizi', 'Kişisel Öneri', 'Dinamik Fiyat']
    },
    {
        icon: '🛍️', label: 'Mağaza',
        title: 'Mağaza İçi Akıllı Analitik',
        desc: 'Vitrin önünden geçenlerin kaçı içeri girdi? Hangi reyon daha sıcak? Fiziksel mağazanızı web siteniz gibi ölçün.',
        features: ['Kişi Sayma', 'Sıcaklık Haritası', 'Vitrin Analizi']
    },
    {
        icon: '👗', label: 'Moda',
        title: 'Trendleri Yapay Zeka ile Yakala',
        desc: 'Gelecek sezonun renklerini ve modellerini bugünden tahmin edin. Stoklarınızı moda akımlarına göre yönetin.',
        features: ['Trend Analizi', 'Stok Devir', 'Kombin Önerisi']
    },
    {
        icon: '👟', label: 'Spor Giyim',
        title: 'Performans Odaklı Perakende',
        desc: 'Sporcu müşterilerinizin aktivitelerine göre ürün önerin. Mevsimsel değişimlere hazırlıklı olun.',
        features: ['Sezon Planı', 'Aktivite Hedefli', 'Stok Yönetimi']
    },
    {
        icon: '💍', label: 'Takı',
        title: 'Değerli Anlar İçin Özel Seçimler',
        desc: 'Müşterilerinizin özel günlerini hatırlayın ve onlara en uygun hediye seçeneklerini otomatik sunun.',
        features: ['Özel Gün Hatırlatıcı', 'Hediye Asistanı', 'CRM']
    },
    {
        icon: '🎁', label: 'Hediyelik',
        title: 'Hediye Seçimini Kolaylaştırın',
        desc: 'Kararsız müşterilere saniyeler içinde en doğru hediye profilini çıkaran akıllı asistan.',
        features: ['Hediye Botu', 'Trend Ürünler', 'Paketleme']
    },
    {
        icon: '👓', label: 'Optik',
        title: 'Görsel Seçimde Dijital Asistan',
        desc: 'Yüz şekline en uygun çerçeveyi öneren algoritmalar ile müşteri karar sürecini kısaltın.',
        features: ['Çerçeve Önerisi', 'Yüz Analizi', 'Stok Takibi']
    },

    // ─── Hizmet & Bakım ───
    {
        icon: '🏨', label: 'Otel',
        title: 'Misafir Memnuniyetinde Mükemmellik',
        desc: 'Check-in yoğunluğunu tahmin edin, oda servisi tercihlerini öğrenin ve 7/24 dijital konsiyerj hizmeti sunun.',
        features: ['Akıllı Check-in', 'Talep Tahmini', 'Dijital Asistan']
    },
    {
        icon: '💈', label: 'Güzellik',
        title: 'Randevu Doluluğunu Artırın',
        desc: 'Son dakika iptallerini otomatik doldurun ve müşterilerinize bakım zamanı geldiğinde hatırlatma yapın.',
        features: ['Akıllı Randevu', 'Bakım Hatırlatıcı', 'No-Show Önleme']
    },
    {
        icon: '💇‍♀️', label: 'Kuaför', // Icon override if needed
        title: 'Stil Danışmanınız Yapay Zeka',
        desc: 'Müşterinizin saç yapısına ve geçmiş tercihlerine göre en uygun bakım ürünlerini ve modelleri önerin.',
        features: ['Stil Önerisi', 'Ürün Satışı', 'Müşteri Takip']
    },
    {
        icon: '💆‍♀️', label: 'Spa',
        title: 'Rahatlatıcı ve Kişisel Deneyim',
        desc: 'Misafirlerinizin stres seviyesine ve tercihlerine göre en uygun terapi paketlerini otomatik oluşturun.',
        features: ['Paket Önerisi', 'Terapi Takibi', 'Doluluk Analizi']
    },
    {
        icon: '🏋️‍♂️', label: 'Spor Salonu',
        title: 'Üye Bağlılığını Zirveye Taşıyın',
        desc: 'Antrenmanlarını aksatan üyeleri tespit edin ve onları motive edecek kişisel mesajlar gönderin.',
        features: ['Üye Takibi', 'Risk Analizi', 'Motivasyon AI']
    },
    {
        icon: '🏥', label: 'Klinik',
        title: 'Hasta Süreçlerinde Kusursuz Akış',
        desc: 'Randevu çakışmalarını önleyin, hasta takibini dijitalleştirin ve bekleme sürelerini minimize edin.',
        features: ['Randevu Optim.', 'Hasta Takibi', 'Süreç Analizi']
    },
    {
        icon: '🦷', label: 'Diş',
        title: 'Gülüş Tasarımında Teknoloji',
        desc: 'Tedavi süreçlerini görselleştirin ve hastalarınıza tedavi sonrası simülasyonları sunun.',
        features: ['Tedavi Simülasyonu', 'Randevu Takip', 'Hasta CRM']
    }
];

export function initSectorSpotlight() {
    const container = document.getElementById('sector-spotlight');
    if (!container) return;

    let currentIndex = 0;
    let autoRotateInterval = null;
    let isPaused = false;

    // Elements
    const titleEl = container.querySelector('.spotlight-title');
    const descEl = container.querySelector('.spotlight-desc');
    const featuresEl = container.querySelector('.spotlight-features');
    const contentEl = container.querySelector('.spotlight-content');

    // ─── Highlight Logic ───
    function highlightActiveButton(label) {
        // Clear all active states
        document.querySelectorAll('.sector-btn').forEach(btn => {
            btn.classList.remove('active-sector');
        });

        // Activate matching buttons
        document.querySelectorAll('.sector-btn').forEach(btn => {
            const btnLabel = btn.querySelector('.sector-label');
            if (btnLabel && btnLabel.textContent.trim() === label) {
                btn.classList.add('active-sector');
            }
        });
    }

    // ─── Update Content Logic ───
    function renderSpotlight(sector, animate = true) {
        if (!sector) return;

        // Visual Update Function
        const performUpdate = () => {
            highlightActiveButton(sector.label);

            if (titleEl) titleEl.textContent = sector.title;
            if (descEl) descEl.textContent = sector.desc;

            if (featuresEl) {
                featuresEl.innerHTML = sector.features.map(f => `
                    <span class="feature-tag">✨ ${f}</span>
                `).join('') + `
                <span class="feature-tag" style="background: #f8fafc; color: #64748b; border-color: #cbd5e1; border-style: dashed;">
                    🚀 ...ve Sınırsız Senaryo
                </span>
                `;
            }
        };

        if (animate && contentEl) {
            // Fade out -> Update -> Fade in
            contentEl.style.opacity = '0';
            contentEl.style.transform = 'translateY(5px)';

            setTimeout(() => {
                performUpdate();
                contentEl.style.opacity = '1';
                contentEl.style.transform = 'translateY(0)';
            }, 200); // Fast transition
        } else {
            // Immediate update (for hover)
            performUpdate();
            if (contentEl) {
                contentEl.style.opacity = '1';
                contentEl.style.transform = 'translateY(0)';
            }
        }
    }

    // ─── Auto Rotate Logic ───
    function startAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
        isPaused = false;
        autoRotateInterval = setInterval(() => {
            if (!isPaused) {
                currentIndex = (currentIndex + 1) % sectorsData.length;
                renderSpotlight(sectorsData[currentIndex], true);
            }
        }, 5000);
    }

    function stopAutoRotate() {
        if (autoRotateInterval) clearInterval(autoRotateInterval);
        isPaused = true;
    }

    // ─── Event Listeners (HOVER) ───
    document.querySelectorAll('.sector-btn').forEach(btn => {
        // ENTER: Stop rotation and show content
        btn.addEventListener('mouseenter', () => {
            stopAutoRotate();
            const labelEl = btn.querySelector('.sector-label');
            if (labelEl) {
                // Normalize: "Fast\n Food" -> "Fast Food"
                const labelText = labelEl.textContent.replace(/\s+/g, ' ').trim();
                const sectorData = sectorsData.find(s => s.label === labelText);
                if (sectorData) {
                    renderSpotlight(sectorData, false);
                }
            }
        });

        // LEAVE: Resume rotation
        btn.addEventListener('mouseleave', () => {
            // Resume automatically after mouse leaves
            startAutoRotate();
        });
    });

    // ─── Init ───
    renderSpotlight(sectorsData[0], true);
    startAutoRotate();
}
