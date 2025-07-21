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
                tabsIndicator.style.transition = 'all 0.3s ease';
                tabsIndicator.style.left = `${activeTab.offsetLeft}px`;
                tabsIndicator.style.width = `${activeTab.offsetWidth}px`;
            }
        };

        const courseTabsSwiper = new Swiper('.course-tab-content-wrapper', {
            autoHeight: true,
            spaceBetween: 30,
            watchSlidesProgress: true,
            on: {
                progress: function(swiper, progress) {
                    updateIndicator(swiper);
                },
                transitionEnd: function(swiper) {
                    // Это событие срабатывает после любой анимации,
                    // включая возврат слайда на место при отмененном свайпе.
                    setIndicatorToEndPosition(swiper);
                },
                init: function(swiper) {
                    setIndicatorToEndPosition(swiper);
                    if (swiper.slides[swiper.activeIndex].id === 'reviews') {
                        setTimeout(initReviews, 50);
                    }
                },
                resize: function(swiper) {
                    setTimeout(() => setIndicatorToEndPosition(swiper), 100);
                },
                slideChange: function () {
                    const activeIndex = this.activeIndex;
                    tabButtons.forEach((button, index) => {
                        button.classList.remove('active');
                        if (index === activeIndex) {
                            button.classList.add('active');
                        }
                    });

                    // Инициализируем отзывы, если переключились на них
                    if (this.slides[activeIndex] && this.slides[activeIndex].id === 'reviews') {
                        setTimeout(initReviews, 50);
                    }

                    scrollToStickyTabs();
                    setTimeout(() => this.updateAutoHeight(300), 50);
                }
            }
        });

        const scrollToStickyTabs = () => {
            const courseTabs = document.querySelector('.course-tabs');
            if (!courseTabWrapper || !courseTabs || courseTabs.classList.contains('sticky') || courseTabs.classList.contains('sticky-mobile')) {
                return;
            }
            const header = document.querySelector('.header');
            const headerHeight = header ? header.offsetHeight : 0;
            const offsetPosition = courseTabWrapper.offsetTop - headerHeight + 1;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        };

        const activateTabAndScroll = (tabId) => {
            const tabIndex = Array.from(tabButtons).findIndex(btn => btn.getAttribute('data-tab') === tabId);
            if (tabIndex !== -1) {
                courseTabsSwiper.slideTo(tabIndex);
                setTimeout(() => scrollToStickyTabs(), 50);
            }
        };

        tabButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                courseTabsSwiper.slideTo(index);
                setTimeout(() => scrollToStickyTabs(), 50);
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
        // Если одного из элементов нет, ничего не делаем
        if (!courseTabs || !header || !tabsPlaceholder) return;

        const scrollY = window.scrollY;
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const headerHeight = header.offsetHeight+1;

        // --- Логика для хедера на мобильных ---
        if (!isDesktop) {
            // Прячем хедер при скролле вниз, показываем при скролле вверх (если мы не вверху страницы)
            if (scrollY > headerHeight) {
                if (scrollDirection === 'down') {
                    header.classList.add('hidden');
                    header.classList.remove('visible');
                } else { // 'up'
                    header.classList.remove('hidden');
                    header.classList.add('visible');
                }
            } else {
                header.classList.remove('hidden');
                header.classList.add('visible');
            }
        }

        // --- Общая логика для фиксации табов ---
        const tabsParentRect = courseTabs.parentElement.getBoundingClientRect();
        
        // Точка, в которой табы должны "прилипнуть"
        const stickPoint = isDesktop
            ? headerHeight
            : (header.classList.contains('visible') ? headerHeight : 0);

        if (tabsParentRect.top <= stickPoint && !isTabsSticky) {
            // СДЕЛАТЬ ЛИПКИМ
            isTabsSticky = true;
            tabsPlaceholder.style.height = `${courseTabs.offsetHeight}px`;
            tabsPlaceholder.classList.add('visible');
            courseTabs.classList.add(isDesktop ? 'sticky' : 'sticky-mobile');
            // На мобильных, если хедер видим, добавляем класс для отступа
            if (!isDesktop && header.classList.contains('visible')) {
                courseTabs.classList.add('header-visible');
            }
            if (isDesktop) {
                setTimeout(updateStickyIndicator, 100);
            }
        } else if (tabsParentRect.top > stickPoint && isTabsSticky) {
            // ОТЛЕПИТЬ
            isTabsSticky = false;
            tabsPlaceholder.classList.remove('visible');
            tabsPlaceholder.style.height = '0px';
            courseTabs.classList.remove('sticky', 'sticky-mobile', 'header-visible');
            if (isDesktop) {
                setTimeout(updateStickyIndicator, 100);
            }
        }

        // Если табы уже липкие на мобильном, обновляем их позицию в зависимости от хедера
        if (isTabsSticky && !isDesktop) {
            if (header.classList.contains('visible')) {
                courseTabs.classList.add('header-visible');
            } else {
                courseTabs.classList.remove('header-visible');
            }
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

        // Также нужно проверять при изменении размера окна
        window.addEventListener('resize', () => {
            if (window.innerWidth <= DESKTOP_BREAKPOINT) {
                panelCta.classList.remove('visible');
            }
        });
    }
});