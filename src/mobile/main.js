/* ═══════════════════════════════════════════════════════════════════════
   OKEEP MOBILE - Main JS
   Minimal JavaScript for essential interactions
═══════════════════════════════════════════════════════════════════════ */

// ─────────────────────────────────────────────────────────────────────
// GROQ AI API CONFIG (Same as Desktop)
// ─────────────────────────────────────────────────────────────────────
var GROQ_API_KEY = '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';

var AI_SYSTEM_PROMPT = 'Sen Okeep\'in yapay zeka asistanısın. Okeep, HER SEKTÖRDEN işletmelere yapay zeka destekli otomasyon ve verimlilik çözümleri sunan bir teknoloji şirketidir.\n\nGörevin:\n- Ziyaretçilere Okeep\'in hizmetleri hakkında bilgi vermek\n- HER sektöre özel çözümler önermek\n- Demo talep etmeleri için yönlendirmek\n\nTemel Çözümlerimiz:\n📊 Veri Analizi & Raporlama\n📈 Otomasyon\n🎯 Müşteri Yönetimi (CRM)\n📅 Randevu & Rezervasyon\n💰 Maliyet Optimizasyonu\n🤖 AI Asistan\n\nKurallar:\n- Kısa ve öz yanıtlar ver (2-3 cümle)\n- Samimi ve yardımsever ol\n- Türkçe konuş\n- Hiçbir sektörü reddetme\n- Demo için iletişim formunu yönlendir';

var aiConversationHistory = [];

// ─────────────────────────────────────────────────────────────────────
// DEVICE DETECTION - Redirect to desktop if screen is large
// ─────────────────────────────────────────────────────────────────────
(function () {
   const MOBILE_BREAKPOINT = 768;

   function checkScreenSize() {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
         window.location.href = '/';
      }
   }

   // Check on load
   checkScreenSize();

   // Check on resize (debounced)
   let resizeTimeout;
   window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkScreenSize, 250);
   });
})();

// ─────────────────────────────────────────────────────────────────────
// THEME MANAGEMENT - Device preference + manual toggle + localStorage
// ─────────────────────────────────────────────────────────────────────
(function () {
   const THEME_KEY = 'okeep-theme';
   const html = document.documentElement;

   // Get saved preference or device preference
   function getPreferredTheme() {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
         return savedTheme;
      }
      // Use device preference
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
   }

   // Apply theme
   function applyTheme(theme) {
      if (theme === 'light') {
         html.setAttribute('data-theme', 'light');
      } else {
         html.removeAttribute('data-theme');
      }
   }

   // Toggle theme
   window.toggleTheme = function () {
      const currentTheme = html.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
   };

   // Apply on load
   applyTheme(getPreferredTheme());

   // Listen for device preference changes
   window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem(THEME_KEY)) {
         applyTheme(e.matches ? 'light' : 'dark');
      }
   });
})();

// ─────────────────────────────────────────────────────────────────────
// DOM Ready
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
   console.log('📱 Okeep Mobile initialized');

   // ─────────────────────────────────────────────────────────────────
   // SHUFFLE HELPER FUNCTION
   // ─────────────────────────────────────────────────────────────────
   function shuffleElements(container) {
      if (!container) return;
      const items = Array.from(container.children);
      for (let i = items.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         container.appendChild(items[j]);
      }
   }

   // ─────────────────────────────────────────────────────────────────
   // SHUFFLE TEAM CARDS
   // ─────────────────────────────────────────────────────────────────
   const teamScroll = document.querySelector('.team__scroll');
   if (teamScroll) {
      shuffleElements(teamScroll);
   }

   // ─────────────────────────────────────────────────────────────────
   // SHUFFLE SERVICE CARDS (Both Marquee Rows)
   // ─────────────────────────────────────────────────────────────────
   function shuffleMarqueeRow(rowId) {
      const track = document.getElementById(rowId);
      if (!track) return;

      // Get only unique cards (not duplicates)
      const cards = Array.from(track.querySelectorAll('.service-card'));
      const uniqueCards = cards.slice(0, Math.ceil(cards.length / 2));

      // Shuffle unique cards
      for (let i = uniqueCards.length - 1; i > 0; i--) {
         const j = Math.floor(Math.random() * (i + 1));
         [uniqueCards[i], uniqueCards[j]] = [uniqueCards[j], uniqueCards[i]];
      }

      // Clear track and rebuild with shuffled cards + duplicates
      track.innerHTML = '';
      uniqueCards.forEach(function (card) {
         track.appendChild(card.cloneNode(true));
      });
      uniqueCards.forEach(function (card) {
         track.appendChild(card.cloneNode(true));
      });
   }

   shuffleMarqueeRow('servicesRow1');
   shuffleMarqueeRow('servicesRow2');

   // ─────────────────────────────────────────────────────────────────
   // SECTOR SPOTLIGHT
   // ─────────────────────────────────────────────────────────────────
   var sectorData = {
      'restoran': {
         title: 'Restoranınız İçin Yapay Zeka',
         desc: 'Müşteri yorumlarını analiz edin, yoğun saatlere göre personel planlayın ve stok maliyetlerini %20 düşürün.',
         features: ['Otomatik Stok', 'Yorum Analizi', 'Akıllı Vardiya']
      },
      'kafe': {
         title: 'Kahve Dükkanınızın Yeni Beyni',
         desc: 'Sadakat programlarını kişiselleştirin, kahve tüketimine göre sipariş tahminleri yapın.',
         features: ['QR Menü', 'Sadakat Analizi', 'Tedarik Planı']
      },
      'bar': {
         title: 'Gece Hayatında Veri Odaklı Akış',
         desc: 'En popüler kokteylleri belirleyin, stok kayıplarını en aza indirin ve müşteri yoğunluğunu izleyin.',
         features: ['Stok Takibi', 'Popüler Ürünler', 'Maliyet Analizi']
      },
      'fast-food': {
         title: 'Hız Tutkunlarına Hızlı Servis',
         desc: 'Sipariş sürelerini ölçün, yoğunluk anında mutfak operasyonunu otomatik optimize edin.',
         features: ['Hız Analizi', 'Kiosk Entegre', 'Tahminleme']
      },
      'firin': {
         title: 'Taze Ürün, Sıfır Atık',
         desc: 'Günlük üretim miktarını hava durumu ve geçmiş satışlara göre belirleyin. Raflarınız boş, kasanız dolu kalsın.',
         features: ['Üretim Planı', 'Atık Yönetimi', 'Talep Tahmini']
      },
      'paket-servis': {
         title: 'Kurye Operasyonunda Tam Kontrol',
         desc: 'Teslimat rotalarını optimize edin, kurye performansını izleyin ve müşteri memnuniyetini zirveye taşıyın.',
         features: ['Rota Optimizasyonu', 'Sıcak Teslimat', 'Kurye Takip']
      },
      'fine-dining': {
         title: 'Kusursuz Misafir Deneyimi',
         desc: 'VIP müşterilerinizi tanıyın, rezervasyon geçmişine göre özel öneriler sunun ve servis kalitesini standartlaştırın.',
         features: ['VIP CRM', 'Rezervasyon AI', 'Özel Menü']
      },
      'e-ticaret': {
         title: 'E-Ticarette Dönüşüm Rekorları',
         desc: 'Sepet terk edenleri geri kazanın ve müşterilerinize tam olarak aradıkları ürünleri önerin.',
         features: ['Sepet Analizi', 'Kişisel Öneri', 'Dinamik Fiyat']
      },
      'magaza': {
         title: 'Mağaza İçi Akıllı Analitik',
         desc: 'Hangi reyon daha sıcak? Fiziksel mağazanızı web siteniz gibi ölçün.',
         features: ['Kişi Sayma', 'Sıcaklık Haritası', 'Vitrin Analizi']
      },
      'moda': {
         title: 'Trendleri Yapay Zeka ile Yakala',
         desc: 'Gelecek sezonun renklerini ve modellerini bugünden tahmin edin. Stoklarınızı moda akımlarına göre yönetin.',
         features: ['Trend Analizi', 'Stok Devir', 'Kombin Önerisi']
      },
      'spor-giyim': {
         title: 'Performans Odaklı Perakende',
         desc: 'Sporcu müşterilerinizin aktivitelerine göre ürün önerin. Mevsimsel değişimlere hazırlıklı olun.',
         features: ['Sezon Planı', 'Aktivite Hedefli', 'Stok Yönetimi']
      },
      'taki': {
         title: 'Değerli Anlar İçin Özel Seçimler',
         desc: 'Müşterilerinizin özel günlerini hatırlayın ve onlara en uygun hediye seçeneklerini otomatik sunun.',
         features: ['Özel Gün Hatırlatıcı', 'Hediye Asistanı', 'CRM']
      },
      'hediyelik': {
         title: 'Hediye Seçimini Kolaylaştırın',
         desc: 'Kararsız müşterilere saniyeler içinde en doğru hediye profilini çıkaran akıllı asistan.',
         features: ['Hediye Botu', 'Trend Ürünler', 'Paketleme']
      },
      'optik': {
         title: 'Görsel Seçimde Dijital Asistan',
         desc: 'Yüz şekline en uygun çerçeveyi öneren algoritmalar ile müşteri karar sürecini kısaltın.',
         features: ['Çerçeve Önerisi', 'Yüz Analizi', 'Stok Takibi']
      },
      'otel': {
         title: 'Misafir Memnuniyetinde Mükemmellik',
         desc: 'Check-in yoğunluğunu tahmin edin, oda servisi tercihlerini öğrenin ve 7/24 dijital konsiyerj hizmeti sunun.',
         features: ['Akıllı Check-in', 'Talep Tahmini', 'Dijital Asistan']
      },
      'guzellik': {
         title: 'Randevu Doluluğunu Artırın',
         desc: 'Son dakika iptallerini otomatik doldurun ve müşterilerinize bakım zamanı geldiğinde hatırlatma yapın.',
         features: ['Akıllı Randevu', 'Bakım Hatırlatıcı', 'No-Show Önleme']
      },
      'kuafor': {
         title: 'Stil Danışmanınız Yapay Zeka',
         desc: 'Müşterinizin saç yapısına ve geçmiş tercihlerine göre en uygun bakım ürünlerini ve modelleri önerin.',
         features: ['Stil Önerisi', 'Ürün Satışı', 'Müşteri Takip']
      },
      'spa': {
         title: 'Rahatlatıcı ve Kişisel Deneyim',
         desc: 'Misafirlerinizin stres seviyesine ve tercihlerine göre en uygun terapi paketlerini otomatik oluşturun.',
         features: ['Paket Önerisi', 'Terapi Takibi', 'Doluluk Analizi']
      },
      'spor-salonu': {
         title: 'Üye Bağlılığını Zirveye Taşıyın',
         desc: 'Antrenmanlarını aksatan üyeleri tespit edin ve onları motive edecek kişisel mesajlar gönderin.',
         features: ['Üye Takibi', 'Risk Analizi', 'Motivasyon AI']
      },
      'klinik': {
         title: 'Hasta Süreçlerinde Kusursuz Akış',
         desc: 'Randevu çakışmalarını önleyin, hasta takibini dijitalleştirin ve bekleme sürelerini minimize edin.',
         features: ['Randevu Optim.', 'Hasta Takibi', 'Süreç Analizi']
      },
      'dis': {
         title: 'Gülüş Tasarımında Teknoloji',
         desc: 'Tedavi süreçlerini görselleştirin ve hastalarınıza tedavi sonrası simülasyonları sunun.',
         features: ['Tedavi Simülasyonu', 'Randevu Takip', 'Hasta CRM']
      }
   };

   var sectorsTrack = document.getElementById('sectorsTrack');
   var sectorPills = document.querySelectorAll('.sector-pill[data-sector]');
   var sectorDetailEl = document.getElementById('sectorDetail');
   var sectorTitleEl = document.getElementById('sectorDetailTitle');
   var sectorDescEl = document.getElementById('sectorDetailDesc');
   var sectorFeaturesEl = document.getElementById('sectorDetailFeatures');
   var sectorAutoInterval = null;

   function selectSector(sectorKey, pill) {
      var data = sectorData[sectorKey];
      if (!data) return;

      // Update active pill
      sectorPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');

      // Smooth scroll chip into view
      var trackRect = sectorsTrack.getBoundingClientRect();
      var pillRect = pill.getBoundingClientRect();
      var pillCenter = pillRect.left + pillRect.width / 2;
      var trackCenter = trackRect.left + trackRect.width / 2;
      var scrollOffset = pillCenter - trackCenter;
      sectorsTrack.scrollBy({ left: scrollOffset, behavior: 'smooth' });

      // Animate detail content
      sectorDetailEl.style.animation = 'none';
      // Force reflow
      void sectorDetailEl.offsetHeight;
      sectorDetailEl.style.animation = 'sectorFadeIn 0.3s ease';

      // Update content
      sectorTitleEl.textContent = data.title;
      sectorDescEl.textContent = data.desc;
      sectorFeaturesEl.innerHTML = data.features.map(function (f) {
         return '<span class="sector-detail__tag">' + f + '</span>';
      }).join('');
   }

   // Click handlers
   sectorPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
         var key = pill.getAttribute('data-sector');
         selectSector(key, pill);
         // Reset auto-rotate timer on manual click
         startSectorAutoRotate();
      });
   });

   // Auto-rotate: random sector every 5s
   function startSectorAutoRotate() {
      if (sectorAutoInterval) clearInterval(sectorAutoInterval);
      sectorAutoInterval = setInterval(function () {
         var pillsArray = Array.from(sectorPills);
         var currentActive = document.querySelector('.sector-pill.active');
         var available = pillsArray.filter(function (p) { return p !== currentActive; });
         var randomPill = available[Math.floor(Math.random() * available.length)];
         if (randomPill) {
            var key = randomPill.getAttribute('data-sector');
            selectSector(key, randomPill);
         }
      }, 5000);
   }

   if (sectorPills.length > 0) {
      startSectorAutoRotate();
   }


   // Get elements
   const menuBtn = document.getElementById('menuBtn');
   const mobileMenu = document.getElementById('mobileMenu');
   const menuLinks = document.querySelectorAll('.mobile-menu__link');
   const contactForm = document.getElementById('contactForm');
   const themeToggle = document.getElementById('themeToggle');

   // Bottom Sheet elements
   const howItWorksBtn = document.getElementById('howItWorksBtn');
   const bottomSheet = document.getElementById('bottomSheet');
   const bottomSheetOverlay = document.getElementById('bottomSheetOverlay');
   const closeBottomSheetBtn = document.getElementById('closeBottomSheet');

   // ─────────────────────────────────────────────────────────────────
   // THEME TOGGLE
   // ─────────────────────────────────────────────────────────────────
   if (themeToggle) {
      themeToggle.addEventListener('click', function () {
         window.toggleTheme();
      });
   }

   // ─────────────────────────────────────────────────────────────────
   // BOTTOM SHEET
   // ─────────────────────────────────────────────────────────────────
   function openBottomSheet() {
      bottomSheet.classList.add('active');
      bottomSheetOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
   }

   function closeBottomSheet() {
      bottomSheet.classList.remove('active');
      bottomSheetOverlay.classList.remove('active');
      document.body.style.overflow = '';
      // Reset any transform applied during drag
      bottomSheet.style.transform = '';
   }

   if (howItWorksBtn && bottomSheet) {
      howItWorksBtn.addEventListener('click', openBottomSheet);

      if (bottomSheetOverlay) {
         bottomSheetOverlay.addEventListener('click', closeBottomSheet);
      }

      if (closeBottomSheetBtn) {
         closeBottomSheetBtn.addEventListener('click', closeBottomSheet);
      }

      // Close on escape key
      document.addEventListener('keydown', function (e) {
         if (e.key === 'Escape' && bottomSheet.classList.contains('active')) {
            closeBottomSheet();
         }
      });

      // ─────────────────────────────────────────────────────────────────
      // SWIPE DOWN TO CLOSE
      // ─────────────────────────────────────────────────────────────────
      let touchStartY = 0;
      let touchCurrentY = 0;
      let isDragging = false;

      bottomSheet.addEventListener('touchstart', function (e) {
         // Only start drag if touching the handle area (top 60px)
         const touch = e.touches[0];
         const rect = bottomSheet.getBoundingClientRect();
         const touchY = touch.clientY - rect.top;

         if (touchY < 60) {
            touchStartY = touch.clientY;
            isDragging = true;
            bottomSheet.style.transition = 'none';
         }
      }, { passive: true });

      bottomSheet.addEventListener('touchmove', function (e) {
         if (!isDragging) return;

         touchCurrentY = e.touches[0].clientY;
         const deltaY = touchCurrentY - touchStartY;

         // Only allow dragging down (positive delta)
         if (deltaY > 0) {
            bottomSheet.style.transform = 'translateY(' + deltaY + 'px)';
         }
      }, { passive: true });

      bottomSheet.addEventListener('touchend', function (e) {
         if (!isDragging) return;

         isDragging = false;
         bottomSheet.style.transition = '';

         const deltaY = touchCurrentY - touchStartY;

         // If dragged down more than 100px, close the sheet
         if (deltaY > 100) {
            closeBottomSheet();
         } else {
            // Snap back
            bottomSheet.style.transform = '';
         }

         touchStartY = 0;
         touchCurrentY = 0;
      }, { passive: true });
   }

   // ─────────────────────────────────────────────────────────────────
   // HAMBURGER MENU TOGGLE
   // ─────────────────────────────────────────────────────────────────
   if (menuBtn && mobileMenu) {
      menuBtn.addEventListener('click', function () {
         menuBtn.classList.toggle('active');
         mobileMenu.classList.toggle('active');

         // Prevent body scroll when menu is open
         document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
      });

      // Close menu when a link is clicked
      menuLinks.forEach(function (link) {
         link.addEventListener('click', function () {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
         });
      });

      // Close menu on escape key
      document.addEventListener('keydown', function (e) {
         if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
         }
      });
   }

   // ─────────────────────────────────────────────────────────────────
   // CONTACT FORM HANDLER
   // ─────────────────────────────────────────────────────────────────
   if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
         e.preventDefault();

         // Get form data
         const formData = new FormData(contactForm);
         const data = {};
         formData.forEach(function (value, key) {
            data[key] = value;
         });

         // Basic validation
         if (!data.name || !data.phone) {
            showNotification('Lütfen adınızı ve telefon numaranızı girin.', 'error');
            return;
         }

         // Show loading state
         const submitBtn = contactForm.querySelector('button[type="submit"]');
         const originalText = submitBtn.innerHTML;
         submitBtn.innerHTML = 'Gönderiliyor...';
         submitBtn.disabled = true;

         // Simulate form submission (replace with actual API call)
         setTimeout(function () {
            console.log('Form data:', data);

            // Reset form
            contactForm.reset();

            // Show success message
            showNotification('Mesajınız başarıyla gönderildi! En kısa sürede size ulaşacağız.', 'success');

            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
         }, 1500);
      });
   }

   // ─────────────────────────────────────────────────────────────────
   // NOTIFICATION HELPER
   // ─────────────────────────────────────────────────────────────────
   function showNotification(message, type) {
      // Remove existing notification
      const existing = document.querySelector('.notification');
      if (existing) {
         existing.remove();
      }

      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'notification notification--' + type;
      notification.innerHTML = '<span>' + message + '</span>';

      // Add styles
      Object.assign(notification.style, {
         position: 'fixed',
         bottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
         left: '16px',
         right: '16px',
         padding: '16px 20px',
         borderRadius: '12px',
         fontSize: '14px',
         fontWeight: '500',
         textAlign: 'center',
         zIndex: '9999',
         animation: 'slideUp 0.3s ease',
         background: type === 'success' ? '#0b666a' : '#dc2626',
         color: 'white',
         boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)'
      });

      document.body.appendChild(notification);

      // Auto remove after 4 seconds
      setTimeout(function () {
         notification.style.animation = 'slideDown 0.3s ease';
         setTimeout(function () {
            notification.remove();
         }, 300);
      }, 4000);
   }

   // Add notification animation styles
   const style = document.createElement('style');
   style.textContent = '\
        @keyframes slideUp {\
            from { transform: translateY(100%); opacity: 0; }\
            to { transform: translateY(0); opacity: 1; }\
        }\
        @keyframes slideDown {\
            from { transform: translateY(0); opacity: 1; }\
            to { transform: translateY(100%); opacity: 0; }\
        }\
    ';
   document.head.appendChild(style);

   // ─────────────────────────────────────────────────────────────────
   // SMOOTH SCROLL FOR ANCHOR LINKS
   // ─────────────────────────────────────────────────────────────────
   document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
         const targetId = this.getAttribute('href');
         if (targetId === '#') return;

         const target = document.querySelector(targetId);
         if (target) {
            e.preventDefault();

            const headerHeight = document.getElementById('header').offsetHeight;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;

            window.scrollTo({
               top: targetPosition,
               behavior: 'smooth'
            });
         }
      });
   });

   // ─────────────────────────────────────────────────────────────────
   // HEADER BACKGROUND ON SCROLL
   // ─────────────────────────────────────────────────────────────────
   const header = document.getElementById('header');
   if (header) {
      let lastScroll = 0;

      window.addEventListener('scroll', function () {
         const currentScroll = window.scrollY;

         // Add/remove scrolled class for styling
         if (currentScroll > 50) {
            header.classList.add('header--scrolled');
         } else {
            header.classList.remove('header--scrolled');
         }

         lastScroll = currentScroll;
      }, { passive: true });
   }

   // ─────────────────────────────────────────────────────────────────
   // AI CHAT FAB
   // ─────────────────────────────────────────────────────────────────
   const aiFab = document.getElementById('aiFab');
   const aiFabBtn = document.getElementById('aiFabBtn');
   const aiGreeting = document.getElementById('aiGreeting');
   const aiGreetingClose = document.getElementById('aiGreetingClose');
   const aiChat = document.getElementById('aiChat');
   const aiChatClose = document.getElementById('aiChatClose');
   const aiChatInput = document.getElementById('aiChatInput');
   const aiChatSend = document.getElementById('aiChatSend');
   const aiChatMessages = document.getElementById('aiChatMessages');

   function openAiChat() {
      aiChat.classList.add('active');
      aiFab.classList.add('active');
      aiGreeting.classList.remove('active');
      document.body.style.overflow = 'hidden';
   }

   function closeAiChat() {
      aiChat.classList.remove('active');
      aiFab.classList.remove('active');
      document.body.style.overflow = '';
   }

   if (aiFabBtn && aiChat) {
      // Toggle chat on FAB click
      aiFabBtn.addEventListener('click', function () {
         if (aiChat.classList.contains('active')) {
            closeAiChat();
         } else {
            openAiChat();
         }
      });

      // Close chat button
      if (aiChatClose) {
         aiChatClose.addEventListener('click', closeAiChat);
      }

      // Close greeting bubble
      if (aiGreetingClose) {
         aiGreetingClose.addEventListener('click', function (e) {
            e.stopPropagation();
            aiGreeting.classList.remove('active');
         });
      }

      // Show greeting after 2 seconds
      setTimeout(function () {
         if (!aiChat.classList.contains('active')) {
            aiGreeting.classList.add('active');

            // Auto-hide greeting after 5 seconds
            setTimeout(function () {
               aiGreeting.classList.remove('active');
            }, 5000);
         }
      }, 2000);

      // AI Message sending with Groq API
      var isSending = false;

      function addTypingIndicator() {
         var typingDiv = document.createElement('div');
         typingDiv.className = 'ai-message ai-message--bot ai-message--typing';
         typingDiv.id = 'aiTypingIndicator';
         typingDiv.innerHTML = '<p>...</p>';
         aiChatMessages.appendChild(typingDiv);
         aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
         return typingDiv;
      }

      function removeTypingIndicator() {
         var typing = document.getElementById('aiTypingIndicator');
         if (typing) typing.remove();
      }

      async function callGroqAPI(userMessage) {
         aiConversationHistory.push({
            role: 'user',
            content: userMessage
         });

         var response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': 'Bearer ' + GROQ_API_KEY
            },
            body: JSON.stringify({
               model: 'llama-3.3-70b-versatile',
               messages: [
                  { role: 'system', content: AI_SYSTEM_PROMPT }
               ].concat(aiConversationHistory),
               max_tokens: 300,
               temperature: 0.7
            })
         });

         if (!response.ok) {
            throw new Error('API Error: ' + response.status);
         }

         var data = await response.json();
         var aiMessage = data.choices[0].message.content;

         aiConversationHistory.push({
            role: 'assistant',
            content: aiMessage
         });

         return aiMessage;
      }

      async function sendMessage() {
         var message = aiChatInput.value.trim();
         if (!message || isSending) return;

         isSending = true;
         aiChatInput.disabled = true;
         aiChatSend.disabled = true;

         // Add user message
         var userMsg = document.createElement('div');
         userMsg.className = 'ai-message ai-message--user';
         userMsg.innerHTML = '<p>' + message + '</p>';
         aiChatMessages.appendChild(userMsg);

         // Clear input
         aiChatInput.value = '';

         // Scroll to bottom
         aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

         // Show typing
         addTypingIndicator();

         try {
            var aiResponse = await callGroqAPI(message);
            removeTypingIndicator();

            // Add AI response
            var botMsg = document.createElement('div');
            botMsg.className = 'ai-message ai-message--bot';
            botMsg.innerHTML = '<p>' + aiResponse + '</p>';
            aiChatMessages.appendChild(botMsg);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
         } catch (error) {
            console.error('AI Chat Error:', error);
            removeTypingIndicator();

            var errorMsg = document.createElement('div');
            errorMsg.className = 'ai-message ai-message--bot';
            errorMsg.innerHTML = '<p>Bir hata oluştu. Lütfen tekrar deneyin. 🙏</p>';
            aiChatMessages.appendChild(errorMsg);
            aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
         }

         isSending = false;
         aiChatInput.disabled = false;
         aiChatSend.disabled = false;
         aiChatInput.focus();
      }

      if (aiChatSend) {
         aiChatSend.addEventListener('click', sendMessage);
      }

      if (aiChatInput) {
         aiChatInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
               sendMessage();
            }
         });
      }
   }
});
