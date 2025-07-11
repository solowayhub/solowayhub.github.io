document.addEventListener('DOMContentLoaded', () => {

    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
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

    function closeSidebar() {
        body.classList.remove('sidebar-open');
        sidebar.classList.remove('visible');
        if (!isDesktop) {
            overlay.classList.remove('visible');
        }
    }
    
    function handleResize() {
        isDesktop = window.innerWidth > DESKTOP_BREAKPOINT;
        if (isDesktop) {
            body.classList.add('desktop');
            openSidebar(); // Открываем по умолчанию на десктопе
        } else {
            body.classList.remove('desktop');
            closeSidebar(); // Закрываем на мобильных по умолчанию
        }
    }

    openSidebarBtn.addEventListener('click', openSidebar);
    closeSidebarBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);

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
                const headerOffset = 20;
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

    // Инициализация при загрузке
    handleResize();
    lucide.createIcons();
});