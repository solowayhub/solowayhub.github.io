document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const mobileOpenSidebarBtn = document.getElementById('mobile-open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const panel = document.getElementById('panel');
    const mobileOpenPanelBtn = document.getElementById('mobile-open-panel');
    const ctaButtons = document.querySelectorAll('.panel-cta-btn');
    const closePanelBtn = document.getElementById('close-panel');
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const DESKTOP_BREAKPOINT = 992;

    let isDesktop;

    function openSidebar() {
        body.classList.add('sidebar-open');
        sidebar.classList.add('visible');
        if (!isDesktop) {
            overlay.classList.add('visible');
        }
    }

    function openPanel() {
        body.classList.add('panel-open');
        panel.classList.add('visible');
        if (!isDesktop) {
            overlay.classList.add('visible');
        }

        // Scroll to bottom and focus textarea
        const chatList = document.querySelector('.chat-list');
        const chatTextarea = document.querySelector('#assistant textarea');
        if (chatList) {
            setTimeout(() => {
                chatList.scrollTop = chatList.scrollHeight;
                if (chatTextarea) chatTextarea.focus();
            }, 50); // Небольшая задержка для фокуса
        }
    }

    function closeSidebar() {
        body.classList.remove('sidebar-open');
        sidebar.classList.remove('visible');
        if (!isDesktop) {
            overlay.classList.remove('visible');
        }
    }

    function closePanel() {
        body.classList.remove('panel-open');
        panel.classList.remove('visible');
        if (!isDesktop) {
            overlay.classList.remove('visible');
        }
    }

    function handleResize() {
        const newIsDesktop = window.innerWidth > DESKTOP_BREAKPOINT;
        if (newIsDesktop !== isDesktop) {
            isDesktop = newIsDesktop;
            if (isDesktop) {
                body.classList.add('desktop');
                openSidebar(); // Открываем по умолчанию на десктопе
            } else {
                body.classList.remove('desktop');
                closeSidebar(); // Закрываем на мобильных по умолчанию
                closePanel();
            }
        }
    }

    openSidebarBtn.addEventListener('click', openSidebar);
    if (mobileOpenSidebarBtn) mobileOpenSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    closePanelBtn.addEventListener('click', closePanel);

    if (mobileOpenPanelBtn) {
        mobileOpenPanelBtn.addEventListener('click', () => {
            const tabId = mobileOpenPanelBtn.getAttribute('data-tab');
            openPanel();
        });
    }

    // Открытие панели по клику на CTA кнопки
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            openPanel();
        });
    });

    window.addEventListener('resize', handleResize);

    // --- Логика для свайпов на мобильных устройствах ---
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    let isSwiping = false;
    let swipeHandled = false;

    document.addEventListener('touchstart', e => {
        const isSidebarOpen = body.classList.contains('sidebar-open');
        const isPanelOpen = body.classList.contains('panel-open');
        const target = e.target;

        // Если ни одна панель не открыта, блокируем свайп на интерактивных элементах
        if (!isSidebarOpen && !isPanelOpen) {
            if (target.closest('button, a, .answer-btn, .note-actions, .modal-overlay')) {
                return;
            }
        }

        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
        isSwiping = false;
        swipeHandled = false;

    }, { passive: true });

    document.addEventListener('touchmove', e => {
        if (touchStartX === 0) return;

        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        const dx = Math.abs(touchEndX - touchStartX);
        const dy = Math.abs(touchEndY - touchStartY);

        // Определяем, является ли движение свайпом
        if (dx > 10 && dx > dy) {
            isSwiping = true;
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (touchStartX === 0 || swipeHandled) return;

        handleSwipe();

        // Сбрасываем значения после обработки
        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;
    });

    // Предотвращаем "случайный" клик после свайпа
    document.addEventListener('click', e => {
        if (isSwiping) {
            e.preventDefault();
            e.stopPropagation();
            isSwiping = false;
        }
    }, true);

    function handleSwipe() {
        if (isDesktop || !isSwiping) return;

        const swipeThreshold = 50;
        const swipeEdgeThreshold = 50;

        const dx = touchEndX - touchStartX;

        const isSidebarOpen = body.classList.contains('sidebar-open');
        const isPanelOpen = body.classList.contains('panel-open');

        if (dx > swipeThreshold) { // Свайп вправо
            if (isPanelOpen) closePanel();
            else if (!isSidebarOpen && touchStartX < swipeEdgeThreshold) openSidebar();
        } else if (dx < -swipeThreshold) { // Свайп влево
            if (isSidebarOpen) closeSidebar();
            else if (!isPanelOpen && touchStartX > window.innerWidth - swipeEdgeThreshold) openPanel('assistant');
        }
        swipeHandled = true;
    }

    // --- Плавная прокрутка для навигации по плану ---
    const planLinks = document.querySelectorAll('.plan-link');
    planLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerOffset = 40;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                if (!isDesktop) {
                    closeSidebar(); // Закрываем сайдбар после клика на мобильных
                }
            }
        });
    });

    // --- Автоматическое выделение активного пункта плана при прокрутке ---
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('.slide');
        const headerOffset = 40;
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - headerOffset;
            if (window.scrollY >= sectionTop) {
                current = section.id;
            }
        });

        planLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            }
        });
    });

    // --- Логика переключения языка ---
    const langBtn = document.querySelector('.lang-btn');
    const openSettingsBtn = document.querySelector('.open-settings');
    const settingsMenu = document.querySelector('.header .settings');

    if (langBtn) {
        const currentLangDesktop = langBtn.querySelector('.current-lang.desktop');
        const currentLangMobileIcon = langBtn.querySelector('.current-lang.mobile .lang-icon');
        const langLinks = langBtn.querySelectorAll('.lang-dropdown a');

        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langBtn.classList.toggle('open');
        });

        langLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation(); // Важно, чтобы клик не закрыл меню сразу же
                const selectedLang = link.getAttribute('data-lang');

                if (currentLangDesktop) currentLangDesktop.textContent = selectedLang;
                if (currentLangMobileIcon) currentLangMobileIcon.textContent = selectedLang;

                langLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                langBtn.classList.remove('open'); // Закрываем меню после выбора
            });
        });
    }

    if (openSettingsBtn && settingsMenu) {
        openSettingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = settingsMenu.classList.toggle('active');
            if (!isDesktop) {
                overlay.classList.toggle('visible', isActive);
            }
        });
    }

    document.addEventListener('click', (e) => {
        if (langBtn && langBtn.classList.contains('open')) {
            langBtn.classList.remove('open');
        }
        if (settingsMenu && settingsMenu.classList.contains('active') && !settingsMenu.contains(e.target) && !openSettingsBtn.contains(e.target)) {
            settingsMenu.classList.remove('active');
            if (!isDesktop) {
                overlay.classList.remove('visible');
            }
        }
    });

    // --- Логика переключения темы ---
    const themeSwitch = document.querySelector('.theme-switch');
    if (themeSwitch) {
        const themes = ['light', 'dark', 'coffee'];
        const themeItems = themeSwitch.querySelectorAll('.theme-item');

        const applyTheme = (theme) => {
            // 1. Удаляем все классы тем с body
            body.classList.remove('dark-theme', 'coffee-theme');

            // 2. Добавляем нужный класс, если это не светлая тема
            if (theme !== 'light') {
                body.classList.add(`${theme}-theme`);
            }

            // 3. Сохраняем выбор в localStorage
            localStorage.setItem('theme', theme);

            // 4. Обновляем активную иконку
            const themeIndex = themes.indexOf(theme);
            themeItems.forEach((item, index) => {
                item.classList.toggle('active', index === themeIndex);
            });
        };

        themeSwitch.addEventListener('click', () => {
            const currentTheme = localStorage.getItem('theme') || 'light';
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const nextTheme = themes[nextIndex];
            applyTheme(nextTheme);
        });

        // Проверяем сохраненную тему при загрузке страницы
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && themes.includes(savedTheme)) {
            applyTheme(savedTheme);
        } else {
            // Если в localStorage ничего нет, устанавливаем тему по умолчанию (светлую)
            applyTheme('light');
        }
    }

    // --- Логика добавления нового сообщения в чат ---
    const chatForm = document.querySelector('.chat-form form');
    if (chatForm) {
        const chatTextarea = chatForm.querySelector('textarea');
        const sendButton = chatForm.querySelector('.mini-btn');
        const chatList = document.querySelector('.chat-list');

        const addMessage = () => {
            const text = chatTextarea.value.trim();
            if (text) {
                const newMessage = document.createElement('div');
                newMessage.className = 'message user-message';
                newMessage.textContent = text;

                chatList.appendChild(newMessage);
                chatTextarea.value = '';
                chatList.scrollTop = chatList.scrollHeight;
            }
        };

        sendButton.addEventListener('click', addMessage);
        chatTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addMessage();
            }
        });
    }

    // Инициализация при загрузке
    lucide.createIcons();
    handleResize();

    // Повторная инициализация иконок после возможной смены темы при загрузке
    if (localStorage.getItem('theme') === 'dark') {
        // Небольшая задержка, чтобы убедиться, что все DOM-изменения применились
        setTimeout(() => lucide.createIcons(), 50);
    }

    // --- Логика для аккордеона модулей ---
    const modulesList = document.querySelector('.modules-list');
    if (modulesList) {
        const moduleTitles = modulesList.querySelectorAll('.module-title');

        moduleTitles.forEach(title => {
            title.addEventListener('click', () => {
                const moduleItem = title.closest('.module-item');
                moduleItem.classList.toggle('active');
            });
        });

        // --- Логика для автоматического открытия первого модуля при прокрутке ---
        let isFirstModuleOpened = false;
        const openFirstModuleOnScroll = () => {
            if (isFirstModuleOpened) {
                window.removeEventListener('scroll', openFirstModuleOnScroll);
                return;
            }

            const rect = modulesList.getBoundingClientRect();
            if (rect.top < 300) {
                const firstModule = modulesList.querySelector('.module-item');
                if (firstModule) {
                    firstModule.classList.add('active');
                }
                isFirstModuleOpened = true;
                window.removeEventListener('scroll', openFirstModuleOnScroll);
            }
        };

        window.addEventListener('scroll', openFirstModuleOnScroll);
    }

    // --- TABS, SLIDER, FAQ ---
    const courseTabWrapper = document.querySelector('.course-tab-wrapper');
    if (courseTabWrapper) {
        const tabButtons = document.querySelectorAll('.course-tab-btn');
        const tabContents = document.querySelectorAll('.course-tab-content');
        const reviewSliderItems = document.querySelectorAll('.review-item');
        const seeAllReviewBtn = document.querySelector('.see-all-review');
        const faqCtaBtn = document.querySelector('.faq-cta-btn');
        const mobileReviewsTabBtn = document.querySelector('.mobile-reviews-tab-btn');
        const mobileFaqTabBtn = document.querySelector('.mobile-faq-tab-btn');
        const desktopReviewsBtn = document.querySelector('.action-buttons .review-btn');

        const activateTabAndScroll = (tabId) => {
            // Switch tab
            tabButtons.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
            });
            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === tabId);
            });

            // Scroll to tabs
            const headerOffset = 80;
            const elementPosition = courseTabWrapper.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        };

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');
                activateTabAndScroll(tabId);
            });
        });

        if (seeAllReviewBtn) {
            seeAllReviewBtn.addEventListener('click', () => activateTabAndScroll('reviews'));
        }
        if (faqCtaBtn) {
            faqCtaBtn.addEventListener('click', () => activateTabAndScroll('faq'));
        }
        if (mobileReviewsTabBtn) {
            mobileReviewsTabBtn.addEventListener('click', () => activateTabAndScroll('reviews'));
        }
        if (mobileFaqTabBtn) {
            mobileFaqTabBtn.addEventListener('click', () => activateTabAndScroll('faq'));
        }
        if (desktopReviewsBtn) {
            desktopReviewsBtn.addEventListener('click', () => activateTabAndScroll('reviews'));
        }
        reviewSliderItems.forEach(item => {
            item.addEventListener('click', () => activateTabAndScroll('reviews'));
        });

        // --- Animate slider on scroll ---
        let isSliderAnimated = false;
        const reviewSliderWrapper = document.querySelector('.review-slider-wrapper');

        const animateSliderOnScroll = () => {
            if (isSliderAnimated || !reviewSliderWrapper) {
                window.removeEventListener('scroll', animateSliderOnScroll);
                return;
            }

            const rect = reviewSliderWrapper.getBoundingClientRect();
            if (rect.top < 300) {
                swiper.slideNext();
                isSliderAnimated = true;
                window.removeEventListener('scroll', animateSliderOnScroll);
            }
        };

        window.addEventListener('scroll', animateSliderOnScroll);

        // --- Swiper ---
        const swiper = new Swiper('.review-slider', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            breakpoints: {
                768: {
                    slidesPerView: 2,
                    spaceBetween: 30
                }
            }
        });

        // --- FAQ Accordion ---
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                item.classList.toggle('active');
            });
        });
    }

    // --- Логика для отзывов ---
    const reviewsListContainer = document.querySelector('.reviews-list');
    const starFilters = document.querySelectorAll('.star-filter');

    const reviews = [
        { author: 'Алиса', avatar: 'https://i.pravatar.cc/40?u=1', rating: 5, text: 'Это лучший курс, который я когда-либо проходила! Все очень структурировано и понятно.' },
        { author: 'Борис', avatar: 'https://i.pravatar.cc/40?u=2', rating: 5, text: 'Материал подан великолепно. Ментальные модели изменили мой подход к работе.' },
        { author: 'Вероника', avatar: 'https://i.pravatar.cc/40?u=3', rating: 4, text: 'Хороший курс, много полезной информации. Хотелось бы больше практических заданий.' },
        { author: 'Григорий', avatar: 'https://i.pravatar.cc/40?u=4', rating: 5, text: 'Просто пушка! Рекомендую всем, кто хочет прокачать свое мышление.' },
        { author: 'Диана', avatar: 'https://i.pravatar.cc/40?u=5', rating: 3, text: 'Неплохо, но некоторые темы показались слишком сложными для новичка.' },
        { author: 'Евгений', avatar: 'https://i.pravatar.cc/40?u=6', rating: 5, text: 'Отличная структура, прекрасная подача. Спасибо авторам!' },
    ];

    function renderReviews(filter = 'all') {
        reviewsListContainer.innerHTML = '';

        const filteredReviews = reviews.filter(review => {
            return filter === 'all' || review.rating.toString() === filter;
        });

        if (filteredReviews.length === 0) {
            reviewsListContainer.innerHTML = '<p>Отзывов с такой оценкой пока нет.</p>';
            return;
        }

        filteredReviews.forEach(review => {
            const reviewElement = document.createElement('div');
            reviewElement.className = 'review-item';

            const starsHtml = Array(5).fill(0).map((_, i) =>
                `<i data-lucide="star"${i < review.rating ? ' class="filled"' : ''}></i>`
            ).join('');

            reviewElement.innerHTML = `
            <div class="review-body">
                <p class="review-text">${review.text}</p>
            </div>
            <div class="reviews-header">
                <div class="author">
                    <img src="${review.avatar}" class="author-img">
                    <span class="author-name">${review.author}</span>
                </div>
                <div class="review-rate">${starsHtml}</div>
            </div>
        `;
            reviewsListContainer.appendChild(reviewElement);
        });
        lucide.createIcons();
    }

    starFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            starFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            const ratingFilter = filter.dataset.stars;
            renderReviews(ratingFilter);
        });
    });

    // Первоначальный рендер отзывов
    renderReviews();

});