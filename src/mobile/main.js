/* ═══════════════════════════════════════════════════════════════════════
   OKEEP MOBILE - Main JS
   Minimal JavaScript for essential interactions
═══════════════════════════════════════════════════════════════════════ */

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
// DOM Ready
// ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
   console.log('📱 Okeep Mobile initialized');

   // Get elements
   const menuBtn = document.getElementById('menuBtn');
   const mobileMenu = document.getElementById('mobileMenu');
   const menuLinks = document.querySelectorAll('.mobile-menu__link');
   const contactForm = document.getElementById('contactForm');

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
});
