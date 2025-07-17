document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const mobileOpenSidebarBtn = document.getElementById('mobile-open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const panel = document.getElementById('panel');
    const mobileOpenPanelBtn = document.getElementById('mobile-open-panel');
    const mobileFavoriteBtn = document.getElementById('mobile-favorite-btn');
    const desktopFavoriteBtn = document.querySelector('.action-buttons .favorite-btn');
    const ctaButtons = document.querySelectorAll('.panel-cta-btn');
    const tabHeaders = document.querySelectorAll('.panel-header .tab-header');
    const closePanelBtn = document.getElementById('close-panel');
    const overlay = document.getElementById('overlay');
    const body = document.body;
    const DESKTOP_BREAKPOINT = 992;

    let isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;

    function openSidebar() {
        body.classList.add('sidebar-open');
        sidebar.classList.add('visible');
        if (!isDesktop) {
            overlay.classList.add('visible');
        }
    }

    function openPanel(tabId) {
        body.classList.add('panel-open');
        panel.classList.add('visible');
        if (!isDesktop) {
            overlay.classList.add('visible');
        }
        switchTab(tabId);
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
    
    
    function switchTab(tabId) {
        // Убираем active со всех заголовков и контента
        tabHeaders.forEach(header => header.classList.remove('active'));
        document.querySelectorAll('.panel-content .tab-content').forEach(content => content.classList.remove('active'));

        // Добавляем active к нужному заголовку и контенту
        const headerToActivate = document.querySelector(`.panel-header .tab-header[data-tab="${tabId}"]`);
        const contentToActivate = document.getElementById(tabId);

        if (headerToActivate) {
            headerToActivate.classList.add('active');
        }
        if (contentToActivate) {
            contentToActivate.classList.add('active');
            if (tabId === 'assistant') {
                const chatList = document.querySelector('.chat-list');
                const chatTextarea = document.querySelector('#assistant textarea');
                if (chatList) {
                    setTimeout(() => {
                        chatList.scrollTop = chatList.scrollHeight;
                        if (chatTextarea) chatTextarea.focus();
                    }, 50); // Небольшая задержка для фокуса
                }
            }
            if (tabId === 'note') {
                const noteList = document.querySelector('.note-list');
                const noteTextarea = document.querySelector('#note textarea');
                if (noteList) {
                    setTimeout(() => {
                        noteList.scrollTop = noteList.scrollHeight;
                        if (noteTextarea) noteTextarea.focus();
                    }, 50); // Небольшая задержка для фокуса
                }
            }
        }
    }

    function handleResize() {
        isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;
        if (isDesktop) {
            body.classList.add('desktop');
            openSidebar(); // Открываем по умолчанию на десктопе
            openPanel('note'); // Открываем с активной вкладкой 'note'
        } else {
            body.classList.remove('desktop');
            closeSidebar(); // Закрываем на мобильных по умолчанию
            closePanel();
        }
    }

    openSidebarBtn.addEventListener('click', openSidebar);
    if (mobileOpenSidebarBtn) mobileOpenSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    closePanelBtn.addEventListener('click', closePanel);

    if (mobileOpenPanelBtn) {
        mobileOpenPanelBtn.addEventListener('click', () => {
            const tabId = mobileOpenPanelBtn.getAttribute('data-tab');
            openPanel(tabId);
        });
    }

    function setFavoriteState(isFavorite) {
        const mobileIcon = mobileFavoriteBtn ? mobileFavoriteBtn.querySelector('i') : null;
        const desktopIcon = desktopFavoriteBtn ? desktopFavoriteBtn.querySelector('svg') : null;

        if (isFavorite) {
            if (mobileFavoriteBtn) mobileFavoriteBtn.classList.add('active');
            if (desktopFavoriteBtn) desktopFavoriteBtn.classList.add('active');
            if (mobileIcon) {
                // mobileIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
                // mobileIcon.style.color = '#ff6c6c';
            }
            if (desktopIcon) {
                desktopIcon.style.fill = '#ff6c6c';
                // desktopIcon.style.color = '#ff6c6c';
            }
        } else {
            if (mobileFavoriteBtn) mobileFavoriteBtn.classList.remove('active');
            if (desktopFavoriteBtn) desktopFavoriteBtn.classList.remove('active');
            if (mobileIcon) {
                // mobileIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>';
                // mobileIcon.style.color = 'currentColor';
            }
            if (desktopIcon) {
                desktopIcon.style.fill = 'none';
                // desktopIcon.style.color = 'currentColor';
            }
        }
    }

    function toggleFavorite() {
        const isFavorite = !body.classList.contains('is-favorite');
        body.classList.toggle('is-favorite', isFavorite);
        localStorage.setItem('isFavorite', isFavorite);
        setFavoriteState(isFavorite);
    }

    if (mobileFavoriteBtn) {
        mobileFavoriteBtn.addEventListener('click', toggleFavorite);
    }
    if (desktopFavoriteBtn) {
        desktopFavoriteBtn.addEventListener('click', toggleFavorite);
    }

    // Проверяем состояние "избранного" при загрузке
    const savedIsFavorite = localStorage.getItem('isFavorite') === 'true';
    body.classList.toggle('is-favorite', savedIsFavorite);
    setFavoriteState(savedIsFavorite);

    // Открытие панели по клику на CTA кнопки
    ctaButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            openPanel(tabId);
        });
    });

    // Переключение вкладок внутри панели
    tabHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const tabId = header.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    overlay.addEventListener('click', () => {
        // Не закрываем панели, если открыто модальное окно
        if (activeModal) return;

        closeSidebar();
        closePanel();
        if (settingsMenu && settingsMenu.classList.contains('active')) {
            settingsMenu.classList.remove('active');
            overlay.classList.remove('visible');
        }
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

    // --- Обработка кликов по вариантам ответов ---
    const answerButtons = document.querySelectorAll('.answer-btn');
    answerButtons.forEach(button => {
        button.addEventListener('click', () => {
            const parentQuestion = button.closest('.question');
            const noteDiv = parentQuestion.querySelector('.note');
            const noteText = button.getAttribute('data-note');
            const isCorrect = button.getAttribute('data-correct') === 'true';

            parentQuestion.querySelectorAll('.answer-btn').forEach(btn => {
                btn.classList.remove('selected');
            });

            button.classList.add('selected');

            noteDiv.textContent = noteText;
            noteDiv.className = 'note'; // Сбрасываем классы
            if (isCorrect) {
                noteDiv.classList.add('correct');
            } else {
                noteDiv.classList.add('incorrect');
            }
            noteDiv.style.display = 'block';
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
                
                if(currentLangDesktop) currentLangDesktop.textContent = selectedLang;
                if(currentLangMobileIcon) currentLangMobileIcon.textContent = selectedLang;

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
        themeSwitch.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            
            // Сохраняем выбор пользователя
            if (body.classList.contains('dark-theme')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.setItem('theme', 'light');
            }

            // Меняем активную иконку
            const themeItems = themeSwitch.querySelectorAll('.theme-item');
            themeItems.forEach(item => item.classList.toggle('active'));
        });
    }

    // Проверяем сохраненную тему при загрузке страницы
    if (themeSwitch && localStorage.getItem('theme') === 'dark') {
        body.classList.add('dark-theme');
        const themeItems = themeSwitch.querySelectorAll('.theme-item');
        themeItems.forEach(item => item.classList.toggle('active'));
    }

    // --- ОБЩАЯ ЛОГИКА МОДАЛЬНЫХ ОКОН ---
    let activeModal = null;
    let activeNoteElement = null;

    function openModal(modalId, noteElement) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        activeModal = modal;
        activeNoteElement = noteElement; // Сохраняем ссылку на заметку

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('visible'), 10);

        document.addEventListener('keydown', handleEscKey);
        modal.addEventListener('click', handleOverlayClick);
    }

    function closeModal() {
        if (!activeModal) return;

        activeModal.classList.remove('visible');
        setTimeout(() => {
            activeModal.style.display = 'none';
            activeModal = null;
            activeNoteElement = null;
        }, 300);

        document.removeEventListener('keydown', handleEscKey);
    }

    function handleEscKey(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    function handleOverlayClick(e) {
        // Закрываем по клику на оверлей ИЛИ на кнопку с крестиком
        if (e.target.classList.contains('modal-overlay') || e.target.closest('.close-modal-btn')) {
            closeModal();
        }
    }

    // --- Логика управления заметками ---
    const noteList = document.querySelector('.note-list');
    const deleteModal = document.getElementById('delete-note-modal');
    const editModal = document.getElementById('edit-note-modal');

    if (noteList && deleteModal && editModal) {
        // Клик по иконкам в заметке
        noteList.addEventListener('click', (e) => {
            const noteElement = e.target.closest('.note');
            if (!noteElement) return;

            if (e.target.closest('.edit-note')) {
                openModal('edit-note-modal', noteElement);
                const textarea = editModal.querySelector('#edit-note-textarea');
                textarea.value = noteElement.querySelector('.note-text').textContent;
                setTimeout(() => textarea.focus(), 50); // Фокус с небольшой задержкой
            }

            if (e.target.closest('.delete-note')) {
                openModal('delete-note-modal', noteElement);
            }
        });

        function showConfirmation(modal) {
            const mainContent = modal.querySelector('.modal-main-content');
            const confirmContent = modal.querySelector('.modal-confirmation-content');
            mainContent.style.display = 'none';
            confirmContent.style.display = 'flex';
        }

        function hideConfirmation(modal) {
            const mainContent = modal.querySelector('.modal-main-content');
            const confirmContent = modal.querySelector('.modal-confirmation-content');
            mainContent.style.display = 'block'; // или 'flex' в зависимости от вашей верстки
            confirmContent.style.display = 'none';
        }

        // Переопределяем openModal чтобы сбрасывать состояние
        const originalOpenModal = openModal;
        openModal = (modalId, noteElement) => {
            const modal = document.getElementById(modalId);
            if(modal) hideConfirmation(modal);
            originalOpenModal(modalId, noteElement);
        }

        // --- Логика модального окна удаления ---
        const confirmDeleteBtn = deleteModal.querySelector('#confirm-delete-btn');
        const cancelDeleteBtn = deleteModal.querySelector('#cancel-delete-btn');
        const goToEditLink = deleteModal.querySelector('#go-to-edit-link');

        confirmDeleteBtn.addEventListener('click', () => {
            const noteToRemove = activeNoteElement; // Сохраняем ссылку локально
            showConfirmation(deleteModal);
            
            setTimeout(() => {
                closeModal();
                if (noteToRemove) {
                    // Этап 1: Дрожание и сдвиг
                    noteToRemove.classList.add('is-deleting');
                    
                    // Этап 2: Коллапс после первой анимации
                    noteToRemove.addEventListener('animationend', () => {
                        noteToRemove.classList.add('is-collapsing');
                        
                        // Этап 3: Удаление из DOM после второй анимации
                        noteToRemove.addEventListener('transitionend', () => {
                            noteToRemove.remove();
                        }, { once: true });

                    }, { once: true });
                }
            }, 1000);
        });

        cancelDeleteBtn.addEventListener('click', closeModal);

        goToEditLink.addEventListener('click', (e) => {
            e.preventDefault();
            const noteToEdit = activeNoteElement;
            closeModal();
            setTimeout(() => {
                openModal('edit-note-modal', noteToEdit);
                const textarea = editModal.querySelector('#edit-note-textarea');
                textarea.value = noteToEdit.querySelector('.note-text').textContent;
                setTimeout(() => textarea.focus(), 50);
            }, 300);
        });

        // --- Логика модального окна редактирования ---
        const saveNoteBtn = editModal.querySelector('#save-note-btn');
        const cancelEditBtn = editModal.querySelector('#cancel-edit-btn');
        const editTextarea = editModal.querySelector('#edit-note-textarea');

        saveNoteBtn.addEventListener('click', () => {
            if (activeNoteElement) {
                const newText = editTextarea.value;
                activeNoteElement.querySelector('.note-text').textContent = newText;
                showConfirmation(editModal);
                setTimeout(() => {
                    closeModal();
                }, 1000);
            } else {
                closeModal();
            }
        });

        cancelEditBtn.addEventListener('click', closeModal);
    }

    // --- Логика добавления новой заметки ---
    const noteForm = document.querySelector('.note-form form');
    if (noteForm) {
        const noteTextarea = noteForm.querySelector('textarea');
        const saveButton = noteForm.querySelector('.btn');

        const addNote = () => {
            const text = noteTextarea.value.trim();
            if (text) {
                const newNote = document.createElement('div');
                newNote.className = 'note';
                newNote.innerHTML = `
                    <span class="note-text">${text}</span>
                    <div class="note-actions">
                        <i data-lucide="pencil" class="edit-note"></i>
                        <i data-lucide="trash-2" class="delete-note"></i>
                    </div>
                `;
                noteList.appendChild(newNote);
                lucide.createIcons({
                    nodes: [newNote.querySelector('.note-actions')]
                });
                noteTextarea.value = '';
                noteList.scrollTop = noteList.scrollHeight;
            }
        };

        saveButton.addEventListener('click', addNote);
        noteTextarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                addNote();
            }
        });
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
    handleResize();
    lucide.createIcons();

    // Повторная инициализация иконок после возможной смены темы при загрузке
    if (localStorage.getItem('theme') === 'dark') {
        // Небольшая задержка, чтобы убедиться, что все DOM-изменения применились
        setTimeout(() => lucide.createIcons(), 50);
    }
});