document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const panel = document.getElementById('panel');
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
                if (chatList) {
                    setTimeout(() => {
                        chatList.scrollTop = chatList.scrollHeight;
                    }, 0);
                }
            }
            if (tabId === 'note') {
                const chatList = document.querySelector('.note-list');
                if (chatList) {
                    setTimeout(() => {
                        chatList.scrollTop = chatList.scrollHeight;
                    }, 0);
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
    closeSidebarBtn.addEventListener('click', closeSidebar);
    closePanelBtn.addEventListener('click', closePanel);

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
        closeSidebar();
        closePanel();
    });

    window.addEventListener('resize', handleResize);

    // --- Логика для свайпов на мобильных устройствах ---
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (isDesktop) return; // Не обрабатываем свайпы на десктопе
        const swipeThreshold = 50; // Минимальная длина свайпа
        // Свайп вправо
        if (touchEndX > touchStartX + swipeThreshold) {
            if (touchStartX < 50) { // Открываем только если свайп от края экрана
                openSidebar();
            }
        }
        // Свайп влево
        if (touchEndX < touchStartX - swipeThreshold) {
            closeSidebar();
        }
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
    if (langBtn) {
        const currentLang = langBtn.querySelector('.current-lang');
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
                currentLang.textContent = selectedLang;
                langLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                langBtn.classList.remove('open'); // Закрываем меню после выбора
            });
        });

        document.addEventListener('click', () => {
            if (langBtn.classList.contains('open')) {
                langBtn.classList.remove('open');
            }
        });
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
        if (e.target === activeModal) {
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

        // --- Логика модального окна удаления ---
        const confirmDeleteBtn = deleteModal.querySelector('#confirm-delete-btn');
        const cancelDeleteBtn = deleteModal.querySelector('#cancel-delete-btn');
        const goToEditLink = deleteModal.querySelector('#go-to-edit-link');

        confirmDeleteBtn.addEventListener('click', () => {
            if (activeNoteElement) {
                activeNoteElement.remove();
            }
            closeModal();
        });

        cancelDeleteBtn.addEventListener('click', closeModal);

        goToEditLink.addEventListener('click', (e) => {
            e.preventDefault();
            const noteToEdit = activeNoteElement;
            closeModal();
            // Открываем окно редактирования для той же заметки
            setTimeout(() => openModal('edit-note-modal', noteToEdit), 300);
            const textarea = editModal.querySelector('#edit-note-textarea');
            textarea.value = noteToEdit.querySelector('.note-text').textContent;
            setTimeout(() => textarea.focus(), 350);
        });

        // --- Логика модального окна редактирования ---
        const saveNoteBtn = editModal.querySelector('#save-note-btn');
        const cancelEditBtn = editModal.querySelector('#cancel-edit-btn');
        const editTextarea = editModal.querySelector('#edit-note-textarea');

        saveNoteBtn.addEventListener('click', () => {
            if (activeNoteElement) {
                const newText = editTextarea.value;
                activeNoteElement.querySelector('.note-text').textContent = newText;
            }
            closeModal();
        });

        cancelEditBtn.addEventListener('click', closeModal);
    }


    // Инициализация при загрузке
    handleResize();
    lucide.createIcons();
});