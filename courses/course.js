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
    let searchInput = null;
    let allLessonsList = null;

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
        const target = e.target;

        // Ignore swipes originating from sliders
        if (target.closest('.swiper')) {
            return;
        }
        
        const isSidebarOpen = body.classList.contains('sidebar-open');
        const isPanelOpen = body.classList.contains('panel-open');


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
    const coursePlanLinks = document.querySelectorAll('.course-plan .plan-link');
    window.addEventListener('scroll', () => {
        const moduleTitles = document.querySelectorAll('.lesson-list .lessons-group-title[id]');
        if (moduleTitles.length === 0) return;

        const header = document.querySelector('.header');
        const courseTabs = document.querySelector('.course-tabs');
        let headerOffset = (header ? header.offsetHeight : 60) + (courseTabs ? courseTabs.offsetHeight : 50);

        let currentModuleId = '';

        for (let i = moduleTitles.length - 1; i >= 0; i--) {
            const module = moduleTitles[i];
            const rect = module.getBoundingClientRect();
            if (rect.top <= headerOffset) {
                currentModuleId = module.id;
                break;
            }
        }
        
        // If no module is above the offset (i.e., we are at the top), select the first one.
        if (!currentModuleId) {
            currentModuleId = moduleTitles[0].id;
        }

        coursePlanLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentModuleId}`) {
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

    let courseTabsSwiper;

    // --- TABS, SLIDER, FAQ ---
    const courseTabWrapper = document.querySelector('.course-tab-wrapper');
    if (courseTabWrapper) {
        const courseTabs = document.querySelector('.course-tabs');
        const tabButtons = document.querySelectorAll('.course-tab-btn');
        const tabsIndicator = courseTabWrapper.querySelector('.tabs-indicator');
        const reviewSliderItems = document.querySelectorAll('.review-slider-wrapper .review-item');
        const seeAllReviewBtn = document.querySelector('.see-all-review');
        const faqCtaBtn = document.querySelector('.faq-cta-btn');
        const mobileReviewsTabBtn = document.querySelector('.mobile-reviews-tab-btn');
        const mobileFaqTabBtn = document.querySelector('.mobile-faq-tab-btn');
        const desktopReviewsBtn = document.querySelector('.action-buttons .review-btn');

        const updateIndicator = (swiper) => {
            if (!tabsIndicator) return;

            const progress = swiper.progress; // Прогресс от 0 до 1
            const slideCount = swiper.slides.length;
            if (progress < 0 || progress > 1) return;

            const totalProgress = progress * (slideCount - 1);
            const fromIndex = Math.floor(totalProgress);
            const toIndex = fromIndex + 1;
            const localProgress = totalProgress - fromIndex;

            if (tabButtons[fromIndex] && tabButtons[toIndex]) {
                const fromTab = tabButtons[fromIndex];
                const toTab = tabButtons[toIndex];

                const fromLeft = fromTab.offsetLeft;
                const fromWidth = fromTab.offsetWidth;

                const toLeft = toTab.offsetLeft;
                const toWidth = toTab.offsetWidth;

                const newLeft = fromLeft + (toLeft - fromLeft) * localProgress;
                const newWidth = fromWidth + (toWidth - fromWidth) * localProgress;

                tabsIndicator.style.left = `${newLeft}px`;
                tabsIndicator.style.width = `${newWidth}px`;
                tabsIndicator.style.transition = 'none';
            }
        };

        const setIndicatorToEndPosition = (swiper) => {
            if (!tabsIndicator) return;
            const activeTab = tabButtons[swiper.activeIndex];
            if (activeTab) {
                tabsIndicator.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                tabsIndicator.style.left = `${activeTab.offsetLeft}px`;
                tabsIndicator.style.width = `${activeTab.offsetWidth}px`;
            }
        };
        
        const courseTabsSection = document.getElementById('course-tabs-section');

        const scrollPositions = {};

        courseTabsSwiper = new Swiper('.course-tab-content-wrapper', {
            autoHeight: true,
            spaceBetween: 30,
            watchSlidesProgress: true,
            observer: true, 
            observeParents: true,
            on: {
                progress: function(swiper, progress) {
                    updateIndicator(swiper);
                },
                init: function(swiper) {
                    setIndicatorToEndPosition(swiper);
                    if (swiper.slides[swiper.activeIndex].id === 'reviews') {
                        setTimeout(initReviews, 50);
                    }
                },
                slideChange: function (swiper) {
                    if (isTabsSticky) {
                        // Save old position
                        const oldTabId = swiper.slides[swiper.previousIndex].id;
                        scrollPositions[oldTabId] = window.scrollY;

                        // Restore new position IMMEDIATELY
                        const newTabId = swiper.slides[swiper.activeIndex].id;
                        const targetScrollY = scrollPositions[newTabId];
                        if (targetScrollY !== undefined) {
                            window.scrollTo({ top: targetScrollY, behavior: 'auto' });
                        }
                    }

                    const activeIndex = swiper.activeIndex;
                    tabButtons.forEach((button, index) => {
                        button.classList.toggle('active', index === activeIndex);
                    });

                    if (swiper.slides[activeIndex] && swiper.slides[activeIndex].id === 'reviews') {
                        setTimeout(initReviews, 50);
                    }
                    
                    if (swiper.slides[activeIndex].id !== 'lessons') {
                        const stickyControls = document.querySelector('.lessons-sticky-controls');
                        if(stickyControls) stickyControls.classList.remove('visible');
                    }

                    setTimeout(() => swiper.updateAutoHeight(300), 50);
                },
                transitionEnd: function(swiper) {
                    setIndicatorToEndPosition(swiper);
                    // Scrolling logic moved to slideChange to prevent visual jump
                }
            }
        });

        // Use ResizeObserver to keep the indicator perfectly aligned even when
        // CSS changes the tab container's dimensions (e.g., on sticky).
        const tabResizeObserver = new ResizeObserver(() => {
            setIndicatorToEndPosition(courseTabsSwiper);
        });
        tabResizeObserver.observe(courseTabs);

        const scrollToStickyTabs = () => {
            const header = document.querySelector('.header');
            const courseTabsSection = document.getElementById('course-tabs-section');
            if (!header || !courseTabsSection) return;

            const headerHeight = header.offsetHeight;
            const tabsTop = courseTabsSection.offsetTop;
            const stickyPoint = tabsTop - headerHeight;

            // Only scroll if the page is currently above the point where tabs become sticky.
            if (window.scrollY < stickyPoint) {
                window.scrollTo({
                    top: stickyPoint,
                    behavior: 'smooth'
                });
            }
        };

        const activateTabAndScroll = (tabId) => {
            const tabIndex = Array.from(tabButtons).findIndex(btn => btn.getAttribute('data-tab') === tabId);
            if (tabIndex !== -1) {
                courseTabsSwiper.slideTo(tabIndex);
                scrollToStickyTabs();
            }
        };

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                courseTabsSwiper.slideTo(index);
            });
        });

        const setupTabLink = (element, tabId) => {
            if (element) {
                element.addEventListener('click', () => {
                    activateTabAndScroll(tabId);
                });
            }
        };

        setupTabLink(seeAllReviewBtn, 'reviews');
        setupTabLink(faqCtaBtn, 'faq');
        setupTabLink(mobileReviewsTabBtn, 'reviews');
        setupTabLink(mobileFaqTabBtn, 'faq');
        setupTabLink(desktopReviewsBtn, 'reviews');

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
                reviewSwiper.slideNext();
                isSliderAnimated = true;
                window.removeEventListener('scroll', animateSliderOnScroll);
            }
        };

        window.addEventListener('scroll', animateSliderOnScroll);

        // --- Swiper for Reviews ---
        const reviewSwiper = new Swiper('.review-slider', {
            loop: true,
            slidesPerView: 1,
            spaceBetween: 20,
            pagination: {
                el: '.review-slider-container .swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.review-slider-container .swiper-button-next',
                prevEl: '.review-slider-container .swiper-button-prev',
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
                // Обновляем высоту слайдера при открытии/закрытии FAQ
                if (courseTabsSwiper) {
                    setTimeout(() => courseTabsSwiper.updateAutoHeight(300), 50);
                }
            });
        });

        // --- Логика для отзывов ---
        const reviewsListContainer = document.querySelector('.reviews-list');
        if (reviewsListContainer) {
            const starFilters = document.querySelectorAll('.star-filter');

            // 1. Логика фильтрации
            starFilters.forEach(filter => {
                filter.addEventListener('click', () => {
                    starFilters.forEach(f => f.classList.remove('active'));
                    filter.classList.add('active');
                    
                    const ratingFilter = filter.dataset.stars;
                    
                    reviewsListContainer.className = 'reviews-list';
                    
                    if (ratingFilter !== 'all') {
                        reviewsListContainer.classList.add(`filter-active-${ratingFilter}`);
                    }
                   // Обновляем высоту слайдера при фильтрации
                   if (courseTabsSwiper) {
                       setTimeout(() => courseTabsSwiper.updateAutoHeight(300), 50);
                   }
                });
           });

           // 2. Логика сворачивания/разворачивания
           reviewsListContainer.addEventListener('click', (e) => {
               const reviewItem = e.target.closest('.review-item.collapsible');
               if (reviewItem) {
                   reviewItem.classList.toggle('collapsed');
                   setTimeout(() => {
                       lucide.createIcons();
                       // Обновляем высоту слайдера при сворачивании/разворачивании отзыва
                       if (courseTabsSwiper) {
                           courseTabsSwiper.updateAutoHeight(300);
                       }
                   }, 300);
               }
           });
       }
    }

    // --- Video Stories Slider ---
    const videoStoriesSection = document.querySelector('.video-stories');
    if (videoStoriesSection) {
        let videoSwiper;
        let activeVideo = null;
        let autoSlidFromVideoEnd = false;
        let slideTriggeredByClick = false;

        const videos = Array.from(videoStoriesSection.querySelectorAll('video'));
        const REAL_SLIDES_COUNT = 5; // The number of unique videos

        const pauseAndMarkVideo = (video) => {
            if (!video) return;
            const slide = video.closest('.video-slide');
            video.pause();
            slide.classList.remove('playing');
            slide.classList.add('paused');
            slide.querySelector('.play-icon').style.display = 'none';
            slide.querySelector('.pause-icon').style.display = 'block';
            if (video === activeVideo) {
                activeVideo = null;
            }
        };

        const playVideoWithSound = (video) => {
            if (!video) return;
            if (activeVideo && activeVideo !== video) {
                pauseAndMarkVideo(activeVideo);
            }
            const slide = video.closest('.video-slide');
            if (!slide.classList.contains('paused')) {
                video.currentTime = 0;
            }
            video.muted = false;
            video.play().catch(() => {});
            activeVideo = video;
            slide.classList.add('playing');
            slide.classList.remove('paused');
            slide.querySelector('.play-icon').style.display = 'none';
            slide.querySelector('.pause-icon').style.display = 'none';
        };

        const updateCustomPagination = (swiper) => {
            const paginationContainer = document.querySelector('.video-slider-container .swiper-pagination');
            if (!paginationContainer) return;
            const bullets = paginationContainer.querySelectorAll('.swiper-pagination-bullet');
            const activeIndex = swiper.realIndex % REAL_SLIDES_COUNT;

            bullets.forEach((bullet, index) => {
                bullet.classList.toggle('swiper-pagination-bullet-active', index === activeIndex);
            });
        };

        const initializeSlider = () => {
            videoSwiper = new Swiper('.video-slider', {
                loop: true,
                slidesPerView: 'auto',
                spaceBetween: 15,
                centeredSlides: true,
                navigation: {
                    nextEl: '.video-slider-container .swiper-button-next',
                    prevEl: '.video-slider-container .swiper-button-prev',
                },
                pagination: false, // Disable default pagination
                on: {
                    init: function(swiper) {
                        const paginationContainer = document.querySelector('.video-slider-container .swiper-pagination');
                        paginationContainer.innerHTML = '';

                        for (let i = 0; i < REAL_SLIDES_COUNT; i++) {
                            const bullet = document.createElement('span');
                            bullet.className = 'swiper-pagination-bullet';
                            bullet.addEventListener('click', () => swiper.slideToLoop(i));
                            paginationContainer.appendChild(bullet);
                        }

                        updateCustomPagination(swiper);

                        const observer = new IntersectionObserver((entries) => {
                            if (entries[0].isIntersecting) {
                                setTimeout(() => swiper.slideNext(400), 500);
                                observer.disconnect();
                            }
                        }, { threshold: 0.5 });
                        observer.observe(swiper.el);
                    },
                    slideChange: () => {
                        if (activeVideo) {
                            pauseAndMarkVideo(activeVideo);
                        }
                    },
                    slideChangeTransitionEnd: (swiper) => {
                        updateCustomPagination(swiper); // Update pagination after transition ends

                        document.querySelectorAll('.video-slider .swiper-slide video').forEach(v => {
                            const slide = v.closest('.video-slide');
                            if (v !== activeVideo && !slide.classList.contains('paused')) {
                                v.muted = true;
                                v.play().catch(() => {});
                            }
                        });
                        if (autoSlidFromVideoEnd || slideTriggeredByClick) {
                            const newActiveSlide = document.querySelector('.video-slider .swiper-slide-active');
                            if (newActiveSlide) {
                                const newVideo = newActiveSlide.querySelector('video');
                                if (newVideo) playVideoWithSound(newVideo);
                            }
                            autoSlidFromVideoEnd = false;
                            slideTriggeredByClick = false;
                        }
                    }
                }
            });

            const videoSlides = document.querySelectorAll('.video-slide');
            videoSlides.forEach(slide => {
                const video = slide.querySelector('video');
                if (video) {
                    slide.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const slideIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
                        const isCentered = videoSwiper.realIndex === slideIndex;
                        if (video === activeVideo) {
                            pauseAndMarkVideo(video);
                        } else {
                            if (isCentered) {
                                playVideoWithSound(video);
                            } else {
                                slideTriggeredByClick = true;
                                videoSwiper.slideToLoop(slideIndex);
                            }
                        }
                    });
                    video.addEventListener('ended', () => {
                        if (video === activeVideo) {
                            slide.classList.remove('playing');
                            video.currentTime = 0;
                            autoSlidFromVideoEnd = true;
                            videoSwiper.slideNext();
                        } else {
                            video.currentTime = 0;
                            video.play().catch(() => {});
                        }
                    });
                }
            });
        };

        // Wait for all videos to load metadata before initializing Swiper
        const videoPromises = videos.map(video =>
            new Promise(resolve => {
                if (video.readyState >= 1) {
                    resolve();
                } else {
                    video.addEventListener('loadedmetadata', resolve, { once: true });
                }
            })
        );

        Promise.all(videoPromises).then(() => {
            initializeSlider();
            // Start muted playback for all videos
            videos.forEach(video => {
                video.muted = true;
                video.play().catch(() => {});
            });
        });
    }

    function initReviews() {
        const reviewsListContainer = document.querySelector('.reviews-list');
        if (!reviewsListContainer) return;
    
        const allReviews = reviewsListContainer.querySelectorAll('.review-item');
        const COLLAPSED_HEIGHT = 120; // Синхронизировано с course.css
    
        allReviews.forEach(review => {
            const reviewBody = review.querySelector('.review-body');
            // Сначала убираем классы, чтобы пересчитать высоту корректно
            review.classList.remove('collapsible', 'collapsed');
            
            // Проверяем, есть ли у отзыва тело и превышает ли его реальная высота заданную
            if (reviewBody && reviewBody.scrollHeight > COLLAPSED_HEIGHT) {
                review.classList.add('collapsible', 'collapsed');
            }
        });
    }

    // Инициализируем отзывы сразу при загрузке страницы
    initReviews();

// --- Логика для "липких" табов ---
    const header = document.querySelector('.header');
    const courseTabs = document.querySelector('.course-tabs');
    const tabsPlaceholder = document.querySelector('.tabs-placeholder');
    let lastScrollY = window.scrollY;
    let isTabsSticky = false;

    function updateStickyIndicator() {
        const tabsIndicator = document.querySelector('.tabs-indicator');
        const activeTab = document.querySelector('.course-tab-btn.active');
        if (tabsIndicator && activeTab) {
            tabsIndicator.style.left = `${activeTab.offsetLeft}px`;
            tabsIndicator.style.width = `${activeTab.offsetWidth}px`;
        }
    }

    function handleStickyTabs() {
        if (!courseTabs || !header || !tabsPlaceholder) return;

        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const headerHeight = header.offsetHeight + 1;

        if (!isDesktop) {
            if (scrollY > headerHeight) {
                if (scrollDirection === 'down') {
                    header.classList.remove('visible');
                    header.classList.add('hidden');
                } else {
                    header.classList.add('visible');
                    header.classList.remove('hidden');
                }
            } else {
                header.classList.add('visible');
                header.classList.remove('hidden');
            }
        }

        const tabsParentRect = courseTabs.parentElement.getBoundingClientRect();
        const stickPoint = isDesktop ? headerHeight : (header.classList.contains('visible') ? headerHeight : 0);

        if (tabsParentRect.top <= stickPoint && !isTabsSticky) {
            isTabsSticky = true;
            tabsPlaceholder.style.height = `${courseTabs.offsetHeight}px`;
            tabsPlaceholder.classList.add('visible');
            courseTabs.classList.add(isDesktop ? 'sticky' : 'sticky-mobile');
        } else if (tabsParentRect.top > stickPoint && isTabsSticky) {
            isTabsSticky = false;
            tabsPlaceholder.classList.remove('visible');
            tabsPlaceholder.style.height = '0px';
            courseTabs.classList.remove('sticky', 'sticky-mobile', 'header-visible');
        }

        if (isTabsSticky && !isDesktop) {
            courseTabs.classList.toggle('header-visible', header.classList.contains('visible'));
        }
    
        lastScrollY = scrollY <= 0 ? 0 : scrollY;
    }

    window.addEventListener('scroll', handleStickyTabs, { passive: true });
    
    // Пересчитываем при ресайзе
    window.addEventListener('resize', () => {
        // Сбрасываем состояние, чтобы избежать некорректного отображения
        isTabsSticky = false;
        if (courseTabs) {
            courseTabs.classList.remove('sticky', 'sticky-mobile', 'header-visible');
        }
        if (tabsPlaceholder) {
            tabsPlaceholder.classList.remove('visible');
            tabsPlaceholder.style.height = '0px';
        }
        if (header) {
            header.classList.remove('hidden');
            header.classList.add('visible');
        }
        handleStickyTabs(); // Вызываем для применения правильной логики
    });

    // --- Логика для появления CTA в боковой панели ---
    const descriptionCta = document.querySelector('.description-cta');
    const panelCta = document.querySelector('.course-cta');

    if (descriptionCta && panelCta) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    // Проверяем, что это десктопная версия
                    if (window.innerWidth > DESKTOP_BREAKPOINT) {
                        // Если элемент ушел за верхний край экрана
                        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
                            panelCta.classList.add('visible');
                        } else {
                            panelCta.classList.remove('visible');
                        }
                    } else {
                        // На мобильных устройствах этот блок всегда скрыт
                        panelCta.classList.remove('visible');
                    }
                });
            },
            {
                root: null, // viewport
                threshold: 0, // Срабатывает как только элемент полностью исчезает или появляется
                rootMargin: '0px 0px -100% 0px' // Срабатывает, когда элемент полностью уходит за верхний край
            }
        );

        observer.observe(descriptionCta);

        // Initial check in case the element is already out of view on load
        if (window.innerWidth > DESKTOP_BREAKPOINT) {
            const rect = descriptionCta.getBoundingClientRect();
            if (rect.bottom < 0) {
                panelCta.classList.add('visible');
            }
        }

        // Также нужно проверять при изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth <= DESKTOP_BREAKPOINT) {
                panelCta.classList.remove('visible');
            }
        });
    }

    const lessonsTabContent = document.getElementById('lessons');
    if (lessonsTabContent) {
        searchInput = lessonsTabContent.querySelector('.search-bar input');
        allLessonsList = lessonsTabContent.querySelector('#all-lessons');

        let allLessonsData = [];
        let selectedLessons = new Set();

        const mainLessonsControls = lessonsTabContent.querySelector('.lessons-controls');
        const stickyLessonsControls = document.querySelector('.lessons-sticky-controls');
        const mainSearchInput = mainLessonsControls.querySelector('.search-bar input');
        const stickySearchInput = stickyLessonsControls.querySelector('.sticky-search-input');

        const moduleNames = [
            "1. Основы родительства",
            "2. Эмоциональное развитие ребенка",
            "3. Физическое здоровье и безопасность",
            "4. Социализация и отношения",
            "5. Интеллектуальное развитие и обучение",
            "6. Формирование характера и ценностей",
            "7. Трудности и вызовы в воспитании",
            "8. Подростковый возраст",
            "9. Особые потребности и ситуации",
            "10. Родительское благополучие"
        ];

        const sectionNames = [
            // Модуль 1
            [
                "1.1. Ваши ценности и цели",
                "1.2. Психологическая готовность",
                "1.3. Партнерство в родительстве",
                "1.4. Стили воспитания",
                "1.5. Создание поддерживающей среды",
                "1.6. Роль игры в развитии",
                "1.7. Режим дня и ритуалы",
                "1.8. Баланс работы и семьи",
                "1.9. Финансовая подготовка",
                "1.10. Поиск поддержки и ресурсов"
            ],
            // Модуль 2
            [
                "2.1. Что такое эмоциональный интеллект?",
                "2.2. Распознавание своих эмоций",
                "2.3. Управление своими эмоциями",
                "2.4. Помощь ребенку в распознавании эмоций",
                "2.5. Учим ребенка управлять эмоциями",
                "2.6. Эмпатия и сопереживание",
                "2.7. Развитие устойчивости к стрессу",
                "2.8. Преодоление детских страхов",
                "2.9. Работа с гневом и агрессией",
                "2.10. Позитивное мышление и оптимизм"
            ],
        ];
        // Добавляем остальные 8 модулей для полноты
        for (let i = 2; i < 10; i++) {
            const sections = [];
            for (let j = 1; j <= 10; j++) {
                sections.push(`${i + 1}.${j}. Название раздела ${i * 10 + j}`);
            }
            sectionNames.push(sections);
        }

        const mainLessonTabs = mainLessonsControls.querySelectorAll('.lesson-tab-btn');
        const stickyLessonTabs = stickyLessonsControls.querySelectorAll('.lesson-tab-btn');
        const lessonLists = lessonsTabContent.querySelectorAll('.lesson-list');
        const openLessonsList = lessonsTabContent.querySelector('#open-lessons');
        const favoritesLessonsList = lessonsTabContent.querySelector('#favorites-lessons');
        const closedLessonsList = lessonsTabContent.querySelector('#closed-lessons');
        const lessonsCountSpans = document.querySelectorAll('.lessons-count');
        const selectAllWrappers = document.querySelectorAll('.select-all-wrapper');

        function createLessonElement(lesson) {
            const div = document.createElement('div');
            div.className = 'lesson-item';
            div.dataset.id = lesson.id;
            div.dataset.status = lesson.status;

            const link = document.createElement('a');
            link.href = `lesson.html?id=${lesson.id}`;
            link.className = 'lesson-main-link';
            link.innerHTML = `
                <span class="lesson-number">${lesson.id}.</span>
                <span class="lesson-title">${lesson.title}</span>
            `;

            const tagsWrapper = document.createElement('div');
            tagsWrapper.className = 'lesson-tags-wrapper';

            const favoriteTag = document.createElement('div');
            favoriteTag.className = 'lesson-tag-item favorite-tag';
            favoriteTag.innerHTML = `<i data-lucide="heart" class="favorite-icon ${lesson.isFavorite ? 'active' : ''}"></i>`;

            const statusTag = document.createElement('div');
            statusTag.className = 'lesson-tag-item status-tag';
            let statusContent = '';
            if (lesson.status === 'new') {
                statusContent = '<span class="lesson-tag new">new</span>';
            } else if (lesson.status === 'free') {
                statusContent = '<span class="lesson-tag free">free</span>';
            } else if (lesson.status === 'started') {
                statusContent = '<i data-lucide="check-circle-2" class="lesson-tag-icon"></i>';
            } else if (lesson.status === 'purchased') {
                statusContent = '<i data-lucide="gem" class="lesson-tag-icon"></i>';
            } else if (lesson.status === 'locked' || lesson.status === 'expired') {
                statusContent = '<i data-lucide="lock" class="lesson-tag-icon"></i>';
            }
            statusTag.innerHTML = statusContent;

            tagsWrapper.appendChild(favoriteTag);
            tagsWrapper.appendChild(statusTag);

            if (lesson.status === 'locked' || lesson.status === 'expired') {
                const selectorTag = document.createElement('div');
                selectorTag.className = 'lesson-tag-item selector-tag';
                selectorTag.innerHTML = '<div class="lesson-selector"></div>';
                tagsWrapper.appendChild(selectorTag);
            }

            div.appendChild(link);
            div.appendChild(tagsWrapper);

            return div;
        }

        function generateMockLessons() {
            allLessonsData = []; // Clear existing data

            for (let i = 1; i <= 1000; i++) {
                let status = 'locked';
                if (i <= 3 || (i - 1) % 100 === 0) {
                    status = 'free';
                } else if (i <= 5) { // Lessons 4 and 5 are new
                    status = 'new';
                } else if (i === 6) {
                    status = 'started';
                } else if (i === 7) {
                    status = 'purchased';
                } else if (i === 8) {
                    status = 'expired';
                }

                const moduleId = Math.floor((i - 1) / 100);
                const sectionId = Math.floor(((i - 1) % 100) / 10);

                allLessonsData.push({
                    id: i,
                    title: `${['Введение в курс', 'Основные принципы', 'Продвинутые техники', 'Практическое применение', 'Заключение'][i % 5]}`,
                    status: status,
                    isFavorite: i % 7 === 0 || i % 13 === 0,
                    moduleId: moduleId + 1,
                    moduleName: moduleNames[moduleId],
                    sectionName: sectionNames[moduleId][sectionId]
                });
            }

            const lessonsByModule = allLessonsData.reduce((acc, lesson) => {
                if (!acc[lesson.moduleName]) {
                    acc[lesson.moduleName] = {};
                }
                if (!acc[lesson.moduleName][lesson.sectionName]) {
                    acc[lesson.moduleName][lesson.sectionName] = [];
                }
                acc[lesson.moduleName][lesson.sectionName].push(lesson);
                return acc;
            }, {});

            allLessonsList.innerHTML = '';
            let moduleIndex = 1;
            for (const moduleName in lessonsByModule) {
                const h3 = document.createElement('h3');
                h3.className = 'lessons-group-title';
                h3.id = `module-group-${moduleIndex}`;
                h3.textContent = moduleName;
                allLessonsList.appendChild(h3);

                for (const sectionName in lessonsByModule[moduleName]) {
                    const h4 = document.createElement('h4');
                    h4.className = 'lessons-section-title';
                    h4.textContent = sectionName;
                    allLessonsList.appendChild(h4);

                    lessonsByModule[moduleName][sectionName].forEach(lesson => {
                        allLessonsList.appendChild(createLessonElement(lesson));
                    });
                }
                moduleIndex++;
            }
            lucide.createIcons();
        }

        function handleSearch() {
            const searchTerm = mainSearchInput.value.toLowerCase();
            const activeList = lessonsTabContent.querySelector('.lesson-list.active');
            if (!activeList) return;

            const allElements = activeList.querySelectorAll('.lesson-item, .lessons-group-title, .lessons-section-title');

            // If search is empty, ensure everything is visible and exit.
            if (searchTerm === '') {
                allElements.forEach(el => { el.style.display = '' });
                if (courseTabsSwiper) {
                    setTimeout(() => courseTabsSwiper.updateAutoHeight(200), 50);
                }
                return;
            }

            // If there is a search term, proceed with filtering.
            const lessonItems = activeList.querySelectorAll('.lesson-item');
            lessonItems.forEach(item => {
                const title = item.querySelector('.lesson-title').textContent.toLowerCase();
                item.style.display = title.includes(searchTerm) ? '' : 'none';
            });

            // Update header visibility only for the hierarchical 'all-lessons' list
            if (activeList.id === 'all-lessons') {
                const groupTitles = activeList.querySelectorAll('.lessons-group-title');
                groupTitles.forEach(groupTitle => {
                    let moduleHasVisibleContent = false;
                    let nextElement = groupTitle.nextElementSibling;

                    while (nextElement && !nextElement.classList.contains('lessons-group-title')) {
                        if (nextElement.classList.contains('lessons-section-title')) {
                            let sectionHasVisibleContent = false;
                            let lessonElement = nextElement.nextElementSibling;

                            while (lessonElement && !lessonElement.classList.contains('lessons-section-title') && !lessonElement.classList.contains('lessons-group-title')) {
                                if (lessonElement.style.display !== 'none') {
                                    sectionHasVisibleContent = true;
                                    break;
                                }
                                lessonElement = lessonElement.nextElementSibling;
                            }
                            nextElement.style.display = sectionHasVisibleContent ? '' : 'none';
                            if (sectionHasVisibleContent) {
                                moduleHasVisibleContent = true;
                            }
                        }
                        nextElement = nextElement.nextElementSibling;
                    }
                    groupTitle.style.display = moduleHasVisibleContent ? '' : 'none';
                });
            }

            if (courseTabsSwiper) {
                setTimeout(() => courseTabsSwiper.updateAutoHeight(200), 50);
            }
        }

        function applyFilter(filter) {
            mainLessonTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));
            stickyLessonTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.filter === filter));

            lessonLists.forEach(list => list.classList.remove('active'));
            
            let currentList;
            let lessonsToShow = [];
            
            switch (filter) {
                case 'all':
                    currentList = allLessonsList;
                    lessonsToShow = allLessonsData;
                    break;
                case 'open':
                    currentList = openLessonsList;
                    lessonsToShow = allLessonsData.filter(l => ['new', 'started', 'purchased', 'free'].includes(l.status));
                    break;
                case 'favorites':
                    currentList = favoritesLessonsList;
                    lessonsToShow = allLessonsData.filter(l => l.isFavorite);
                    break;
                case 'closed':
                    currentList = closedLessonsList;
                    lessonsToShow = allLessonsData.filter(l => l.status === 'expired' || l.status === 'locked');
                    break;
            }

            const placeholderText = `Поиск по ${lessonsToShow.length} урокам`;
            if (mainSearchInput) mainSearchInput.placeholder = placeholderText;
            if (stickySearchInput) stickySearchInput.placeholder = placeholderText;
            const hasClosedLessons = lessonsToShow.some(l => l.status === 'expired' || l.status === 'locked');
            selectAllWrappers.forEach(wrapper => wrapper.style.display = hasClosedLessons ? 'block' : 'none');

            if (filter !== 'all') {
                currentList.innerHTML = '';
                lessonsToShow.forEach(lesson => currentList.appendChild(createLessonElement(lesson)));
            }
            
            currentList.classList.add('active');
            handleSearch(); // Apply current search to the new active list
            lucide.createIcons();
            if (courseTabsSwiper) {
                setTimeout(() => courseTabsSwiper.updateAutoHeight(200), 50);
            }
            // updateSelection();
        }

        mainLessonTabs.forEach(btn => {
            btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
        });
        stickyLessonTabs.forEach(btn => {
            btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
        });

        mainSearchInput.addEventListener('input', handleSearch);
        stickySearchInput.addEventListener('input', () => {
            mainSearchInput.value = stickySearchInput.value;
            handleSearch();
        });
        mainSearchInput.addEventListener('input', () => {
            stickySearchInput.value = mainSearchInput.value;
            handleSearch();
        });

        // --- Favorite Toggle Logic ---
        const lessonsContent = lessonsTabContent.querySelector('.lessons-content');
        lessonsContent.addEventListener('click', (e) => {
            const favoriteTag = e.target.closest('.favorite-tag');
            if (!favoriteTag) return;

            e.preventDefault();
            e.stopPropagation();

            const lessonItem = favoriteTag.closest('.lesson-item');
            if (!lessonItem) return;

            const lessonId = parseInt(lessonItem.dataset.id, 10);
            if (isNaN(lessonId)) return;

            const lessonData = allLessonsData.find(l => l.id === lessonId);
            if (lessonData) {
                lessonData.isFavorite = !lessonData.isFavorite;
            }

            const allLessonInstances = document.querySelectorAll(`.lesson-item[data-id='${lessonId}']`);
            allLessonInstances.forEach(instance => {
                const icon = instance.querySelector('.favorite-icon');
                if (icon) {
                    icon.classList.toggle('active', lessonData.isFavorite);
                }
            });
            
            lucide.createIcons({
                attrs: {
                    'stroke-width': 1.5,
                }
            });
        });

        generateMockLessons();
        applyFilter('all');
    }

    // --- Smooth scroll for new sidebar links ---
    const newPlanLinks = document.querySelectorAll('.sidebar .plan-link');
    newPlanLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const allTab = document.querySelector('.lesson-tab-btn[data-filter="all"]');
                if (allTab && !allTab.classList.contains('active')) {
                    allTab.click();
                }

                setTimeout(() => {
                    const courseTabs = document.querySelector('.course-tabs');
                    let headerOffset = 60; // default desktop
                    if (!isDesktop) headerOffset = 50;

                    if (courseTabs && (courseTabs.classList.contains('sticky') || courseTabs.classList.contains('sticky-mobile'))) {
                        headerOffset += courseTabs.offsetHeight;
                    }

                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset - 50;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                    if (!isDesktop) {
                        closeSidebar();
                    }
                }, 50);
            }
        });
    });

    // --- Sticky Module Headers ---
    function handleStickyModuleHeaders() {
        if (!allLessonsList || !searchInput) return; // Guard clause

        const courseTabs = document.querySelector('.course-tabs');
        const header = document.querySelector('.header');

        if (!courseTabs || !header) {
            return;
        }
        
        if (searchInput && searchInput.value.trim() !== '') {
            // Если поиск активен, убираем все sticky-классы
            document.querySelectorAll('.module-group-title.sticky-header').forEach(h => h.classList.remove('sticky-header'));
            return;
        }

        const isDesktopView = window.innerWidth > DESKTOP_BREAKPOINT;
        let topOffset = isDesktopView ? header.offsetHeight : (header.classList.contains('visible') ? header.offsetHeight : 0);
        if (courseTabs.classList.contains('sticky') || courseTabs.classList.contains('sticky-mobile')) {
            topOffset += courseTabs.offsetHeight;
        }

        if (allLessonsList) {
            const moduleHeaders = allLessonsList.querySelectorAll('.module-group-title');
            let currentStickyHeader = null;

            moduleHeaders.forEach(header => {
                header.classList.remove('sticky-header');
                header.style.top = `${topOffset}px`;
                const rect = header.getBoundingClientRect();
                if (rect.top <= topOffset) {
                    currentStickyHeader = header;
                }
            });

            if (currentStickyHeader) {
                currentStickyHeader.classList.add('sticky-header');
            }
        }
    }
    
    // Добавляем вызов в обработчик скролла
    const originalScrollHandler = window.onscroll;
    window.addEventListener('scroll', () => {
        if (typeof originalScrollHandler === 'function') {
            originalScrollHandler();
        }
        handleStickyModuleHeaders();
    });

    // Обновляем при ресайзе
    const originalResizeHandler = window.onresize;
    window.addEventListener('resize', () => {
        if (typeof originalResizeHandler === 'function') {
            originalResizeHandler();
        }
        handleStickyModuleHeaders();
    });

    // Отключаем при поиске
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim() !== '') {
                document.querySelectorAll('.module-group-title.sticky-header').forEach(h => h.classList.remove('sticky-header'));
            } else {
                handleStickyModuleHeaders();
            }
        });
    }

    // --- Sticky Lessons Tabs Logic ---
        const stickyLessonsControls = document.querySelector('.lessons-sticky-controls');
        const mainLessonsControls = document.querySelector('.lessons-controls');
        const lessonsContainer = document.querySelector('.lessons-container');

        if (stickyLessonsControls && mainLessonsControls && lessonsContainer) {
            const header = document.querySelector('.header');
            const mainTabs = document.querySelector('.course-tabs');
            let lastScrollY = window.scrollY;

            // --- Control Synchronization ---
            const mainSearchInput = mainLessonsControls.querySelector('.search-bar input');
            const stickySearchInput = stickyLessonsControls.querySelector('.sticky-search-input');

            mainSearchInput.addEventListener('input', () => {
                stickySearchInput.value = mainSearchInput.value;
                handleSearch();
            });
            stickySearchInput.addEventListener('input', () => {
                mainSearchInput.value = stickySearchInput.value;
                handleSearch();
            });


            function handleLessonsScroll() {
                const lessonsContainer = document.querySelector('.lessons-container');
                const lessonsTab = document.querySelector('.course-tab-btn[data-tab="lessons"]');

                // Exit if not on lessons tab or the container element isn't available
                if (!lessonsTab || !lessonsTab.classList.contains('active') || !lessonsContainer) {
                    stickyLessonsControls.classList.remove('visible');
                    return;
                }

                const scrollY = window.scrollY;
                const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
                lastScrollY = scrollY < 0 ? 0 : scrollY;

                const mainControlsRect = mainLessonsControls.getBoundingClientRect();
                const headerHeight = header.offsetHeight;
                const mainTabsHeight = mainTabs.offsetHeight;
                const topOffset = headerHeight + mainTabsHeight;

                const isMainControlsOutOfView = mainControlsRect.bottom < topOffset;
                const isBottomBoundaryVisible = lessonsContainer.getBoundingClientRect().bottom > 0;

                if (isMainControlsOutOfView && isBottomBoundaryVisible) {
                    stickyLessonsControls.style.top = `${topOffset}px`;
                    if (scrollDirection === 'up') {
                        stickyLessonsControls.classList.add('visible');
                    } else { // scrollDirection === 'down'
                        stickyLessonsControls.classList.remove('visible');
                    }
                } else {
                    // Also hide if the main controls are back in view or we scrolled past the container
                    stickyLessonsControls.classList.remove('visible');
                }
            }

            window.addEventListener('scroll', handleLessonsScroll);
            handleLessonsScroll(); // Initial check
        }
    });