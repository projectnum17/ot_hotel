'use strict';

const loader = document.querySelector('.js-loader');
let loaderHidden = false;

const hideLoader = () => {
    if (loader && !loaderHidden) {
        loaderHidden = true;
        loader.classList.add('is-hide');

        setTimeout(() => loader.remove(), 500);
    }
};

if (document.readyState === 'complete') {
    hideLoader();
} else {
    window.addEventListener('load', hideLoader);
}

setTimeout(hideLoader, 7000);

const initAudioBG = () => {
    const audio = document.querySelector('#bgMusic');
    if (!audio) return;

    audio.volume = 0;

    let started = false;

    const tryStart = async () => {
        if (started) return;

        try {
            await audio.play();
            started = true;
            fadeInAudio(audio, 1, 3000);
            removeListeners();
        } catch (err) {}
    };

    const removeListeners = () => {
        window.removeEventListener('click', tryStart);
        window.removeEventListener('pointerdown', tryStart);
        window.removeEventListener('keydown', tryStart);
        window.removeEventListener('wheel', tryStart);
        window.removeEventListener('touchstart', tryStart);
    };

    window.addEventListener('click', tryStart);
    window.addEventListener('pointerdown', tryStart);
    window.addEventListener('keydown', tryStart);
    window.addEventListener('wheel', tryStart);
    window.addEventListener('touchstart', tryStart);
    function fadeInAudio(audio, targetVolume = 1, duration = 3000) {
        const start = performance.now();

        const animate = (time) => {
            const progress = Math.min((time - start) / duration, 1);

            audio.volume = progress * targetVolume;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
};

const initVideoAutoplay = () => {
    const lazyVideos = Array.from(
        document.querySelectorAll('.js-video-autoplay'),
    );

    if (!lazyVideos.length) return;

    const loadAndPlayVideo = (video) => {
        const sources = video.querySelectorAll('source[data-src]');
        sources.forEach((source) => {
            source.src = source.dataset.src;
        });

        video.load();

        video.play().catch((e) => {
            console.warn('Video autoplay failed:', e);
        });

        video.classList.remove('lazyVideo');
    };

    if ('IntersectionObserver' in window) {
        const lazyVideoObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const video = entry.target;
                        loadAndPlayVideo(video);
                        observer.unobserve(video);
                    }
                });
            },
        );

        lazyVideos.forEach((video) => {
            lazyVideoObserver.observe(video);
        });
    } else {
        lazyVideos.forEach(loadAndPlayVideo);
    }
};

const initHeader = () => {
    const header = document.querySelector('.js-header');
    if (!header) return;

    let lastScroll = 0;
    const scrollWay = innerHeight / 2;

    const menuBox = document.querySelector('.js-menu');
    const trigger = document.querySelector('.js-menu-trigger');

    if (!menuBox || !trigger) return;

    const getShouldBeScrolled = () => {
        const scrollY = window.scrollY;
        return scrollY > 50;
    };

    const handleScroll = () => {
        const currentScroll = window.scrollY;

        const shouldBeScrolled = currentScroll > 20;

        if (!header.dataset.menuForced) {
            header.classList.toggle('is-scrolled', shouldBeScrolled);
        }

        if (currentScroll > lastScroll && currentScroll > scrollWay) {
            header.classList.add('is-transform');
        } else {
            header.classList.remove('is-transform');
        }

        lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();

        trigger.classList.toggle('is-active');
        menuBox.classList.toggle('is-open');
        document.body.classList.toggle('is-locked');

        const isForced = header.dataset.menuForced === 'true';

        if (!isForced) {
            header.dataset.menuForced = 'true';
            header.classList.add('is-scrolled');
        } else {
            delete header.dataset.menuForced;
            header.classList.toggle('is-scrolled', window.scrollY > 50);
        }
    });

    const ddMenuTriggers = menuBox.querySelectorAll(
        '.aside-menu__main > ul > li:has(> ul) > a',
    );
    ddMenuTriggers.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const li = link.closest('li');

            link.classList.toggle('is-open');
            li.classList.toggle('is-open');
        });
    });
};

const initSVGAnimation = () => {
    const sections = document.querySelectorAll('section:has(.svg-line)');

    if (!sections.length) return;
    if (!('IntersectionObserver' in window)) return;

    const sectionObserve = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-show');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
        },
    );

    sections.forEach((section) => {
        sectionObserve.observe(section);
    });
};

const initGallerySlider = () => {
    const previewLg = document.querySelector('.js-gallery-lg');
    const previewSm = document.querySelector('.js-gallery-sm');

    if (!previewLg || !previewSm) return;

    const thumbsSlider = new Swiper(previewSm, {
        spaceBetween: 21,
        slidesPerView: 5,
        speed: 900,
        freeMode: true,
        watchSlidesProgress: true,
        breakpoints: {
            0: {
                spaceBetween: 4,
                slidesPerView: 3.2,
            },
            768: {
                spaceBetween: 21,
                slidesPerView: 5,
            },
        },
    });

    const mainSlider = new Swiper(previewLg, {
        spaceBetween: 10,
        grabCursor: true,
        speed: 900,
        thumbs: {
            swiper: thumbsSlider,
        },
        0: {
            spaceBetween: 4,
        },
        768: {
            spaceBetween: 10,
        },
    });
};

const initBenefitsShow = () => {
    const benefitsSection = document.querySelector('.benefits');
    const itemsContainer = document.querySelector('.benefits__items');
    const itemsInner = document.querySelector('.benefits__items-inner');

    if (benefitsSection && itemsInner) {
        const titles = benefitsSection.querySelectorAll('.section-heading');
        const previews = benefitsSection.querySelectorAll('.benefits__preview');
        let currentActiveIndex = null;

        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0,
        };
        const isMobile = window.innerWidth <= 991;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                const index = Array.from(previews).indexOf(entry.target);

                if (index === currentActiveIndex || !titles[index]) return;

                currentActiveIndex = index;

                titles.forEach((t) => t.classList.remove('is-active'));
                previews.forEach((p) => p.classList.remove('is-active'));

                titles[index].classList.add('is-active');
                entry.target.classList.add('is-active');

                const activeTitle = titles[index];

                if (isMobile) {
                    const gutter = window.innerWidth <= 767 ? 24 : 100;
                    const translateX = -(activeTitle.offsetLeft - gutter);
                    itemsInner.style.transform = `translateX(${translateX}px)`;
                } else {
                    const containerHeight = itemsContainer.offsetHeight;
                    const titleHeight = activeTitle.offsetHeight;
                    const titleOffset = activeTitle.offsetTop;

                    const centerOffset = titleOffset + titleHeight / 2;
                    const translateY = containerHeight / 2 - centerOffset;

                    itemsInner.style.transform = `translateY(${translateY}px)`;
                }
            });
        }, observerOptions);

        previews.forEach((preview) => observer.observe(preview));
    }
};

const initBlogSlider = () => {
    if (typeof Swiper === 'undefined') return;

    const sliderBlock = document.querySelector('.js-blog-slider');
    if (!sliderBlock) return;

    new Swiper(sliderBlock, {
        spaceBetween: 30,
        slidesPerView: 'auto',
        speed: 900,
        grabCursor: true,
        navigation: {
            nextEl: '.js-blog-next',
            prevEl: '.js-blog-prev',
        },
        breakpoints: {
            0: {
                spaceBetween: 12,
            },
            768: {
                spaceBetween: 30,
            },
        },
    });
};

const initFAQBox = () => {
    const faqBoxes = document.querySelectorAll('.js-faq-trigger');
    if (!faqBoxes.length) return;

    faqBoxes[0].classList.add('is-clicked');

    faqBoxes.forEach((box) => {
        box.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = box.classList.contains('is-clicked');

            faqBoxes.forEach((el) => el.classList.remove('is-clicked'));

            if (!isOpen) box.classList.add('is-clicked');
        });
    });
};

const initToggleClasses = ({ selector, className }) => {
    const triggers = document.querySelectorAll(selector);
    if (!triggers.length) return;

    triggers.forEach((el) => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            el.classList.toggle(className);
        });
    });
};

const initAutoHeightHandler = () => {
    const sections = document.querySelectorAll('.details');
    if (!sections.length) return;

    sections.forEach((section) => {
        const textBox = section.querySelector('.js-seo-text');
        const btn = section.querySelector('.js-seo-more');

        if (!textBox || !btn) return;

        btn.addEventListener('click', () => {
            const fullHeight = textBox.scrollHeight;

            textBox.style.height = `${fullHeight}px`;

            textBox.classList.add('is-open');

            btn.classList.add('is-hidden');

            setTimeout(() => {
                textBox.style.height = 'auto';
            }, 500);
        });
    });
};

const initReviewsSlider = () => {
    if (typeof Swiper === 'undefined') return;

    const sliderBlock = document.querySelector('.js-reviews-slider');
    if (!sliderBlock) return;

    new Swiper(sliderBlock, {
        spaceBetween: 35,
        slidesPerView: 'auto',
        speed: 900,
        grabCursor: true,
        navigation: {
            nextEl: '.js-reviews-next',
            prevEl: '.js-reviews-prev',
        },
        breakpoints: {
            0: {
                spaceBetween: 12,
            },
            768: {
                spaceBetween: 35,
            },
        },
    });
};

const initCarousels = () => {
    if (typeof Swiper === 'undefined') return;

    const carouselBoxes = document.querySelectorAll('.js-carousel-box');
    if (!carouselBoxes.length) return;

    carouselBoxes.forEach((box) => {
        const sliderEl = box.querySelector('.swiper');
        const paginationEl = box.querySelector('.js-carousel-progress');
        const slidesCount = sliderEl.querySelectorAll('.swiper-slide').length;
        const isLoopMode = slidesCount >= 4;

        if (!isLoopMode) box.classList.add('is-sm');

        const swiper = new Swiper(sliderEl, {
            spaceBetween: 50,
            slidesPerView: 'auto',
            centeredSlides: slidesCount >= 4,
            loop: slidesCount >= 4,
            initialSlide: isLoopMode ? 1 : 0,
            speed: 900,
            grabCursor: true,
            pagination: {
                el: paginationEl,
                type: 'progressbar',
            },
            breakpoints: {
                0: {
                    spaceBetween: 12,
                },
                768: {
                    spaceBetween: 50,
                },
            },
        });
    });
};

const initClassActive = ({ selector }) => {
    const targets = document.querySelectorAll(selector);
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) return;

    const targetsObserver = new IntersectionObserver(
        (entires, obs) => {
            entires.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-show');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.7,
        },
    );

    targets.forEach((target) => {
        targetsObserver.observe(target);
    });
};

const initProcSlider = () => {
    if (typeof Swiper === 'undefined') return;

    const sliderBox = document.querySelector('.js-procedures-slider');
    if (!sliderBox) return;

    new Swiper(sliderBox, {
        slidesPerView: 'auto',
        spaceBetween: 28,
        speed: 900,
        grabCursor: true,
        pagination: {
            type: 'progressbar',
            el: '.js-procedures-progress',
        },
        breakpoints: {
            0: {
                spaceBetween: 12,
            },
            768: {
                spaceBetween: 28,
            },
        },
    });
};

const initContactForm = () => {
    const forms = document.querySelectorAll('form');
    if (!forms.length) return;

    const localeUk = {
        days: [
            'Неділя',
            'Понеділок',
            'Вівторок',
            'Середа',
            'Четвер',
            "П'ятниця",
            'Субота',
        ],
        daysShort: ['Нед', 'Пон', 'Вів', 'Сер', 'Чет', "П'ят", 'Суб'],
        daysMin: ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        months: [
            'Січень',
            'Лютий',
            'Березень',
            'Квітень',
            'Травень',
            'Червень',
            'Липень',
            'Серпень',
            'Вересень',
            'Жовтень',
            'Листопад',
            'Грудень',
        ],
        monthsShort: [
            'Січ',
            'Лют',
            'Бер',
            'Кві',
            'Тра',
            'Чер',
            'Лип',
            'Сер',
            'Вер',
            'Жов',
            'Лис',
            'Гру',
        ],
        today: 'Сьогодні',
        clear: 'Очистити',
        dateFormat: 'dd.MM.yyyy',
        timeFormat: 'HH:mm',
        firstDay: 1,
    };

    const localeEn = {
        days: [
            'Sunday',
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
        ],
        daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        months: [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December',
        ],
        monthsShort: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ],
        today: 'Today',
        clear: 'Clear',
        dateFormat: 'dd/MM/yyyy',
        timeFormat: 'HH:mm',
        firstDay: 1,
    };

    const currentLang = document.documentElement.lang;
    const selectedLang = currentLang === 'en' ? localeEn : localeUk;

    forms.forEach((form) => {
        const dateTriggers = form.querySelectorAll('.js-date-trigger');

        dateTriggers.forEach((trigger) => {
            const dp = new AirDatepicker(trigger, {
                locale: selectedLang,
                autoClose: true,
            });
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            form.reset();
        });
    });
};

const initArticlePage = () => {
    const targets = document.querySelectorAll('.js-article-content h2');
    const container = document.querySelector('.js-article-content');
    if (!targets.length || !container) return;

    targets.forEach((target) => target.classList.add('js-anchor-title'));
    const children = Array.from(container.children);

    let wrapper = null;

    children.forEach((el) => {
        if (el.tagName === 'H2') {
            wrapper = document.createElement('div');
            wrapper.classList.add('js-anchor-target');
            container.insertBefore(wrapper, el);
            wrapper.appendChild(el);
        } else {
            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.classList.add('js-anchor-target');
                container.prepend(wrapper);
                wrapper.appendChild(el);
            } else {
                wrapper.appendChild(el);
            }
        }
    });

    const anchorsContent = document.querySelector('.js-article-parent');
    if (!anchorsContent) return;

    const anchorsBtns = [
        ...anchorsContent.querySelectorAll('.js-article-anchor'),
    ];
    const anchorsTargets = [
        ...anchorsContent.querySelectorAll('.js-anchor-target'),
    ];
    const header = document.querySelector('.js-header');

    if (!anchorsBtns.length || !anchorsTargets.length) return;

    let isScrollingManual = false;

    const getHeaderOffset = (isScrollingUp) => {
        if (!header) return 0;

        const isTablet = window.innerWidth <= 991;

        if (isTablet) {
            return isScrollingUp ? 170 : 90;
        }

        return isScrollingUp ? 120 : 120;
    };

    const setActiveBtn = (index) => {
        anchorsBtns.forEach((btn) => btn.classList.remove('is-active'));

        const activeBtn = anchorsBtns[index];
        if (!activeBtn) return;

        activeBtn.classList.add('is-active');

        activeBtn.scrollIntoView({
            behavior: 'smooth',
            inline: 'center',
            block: 'nearest',
        });
    };

    anchorsBtns.forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const target = anchorsTargets[i];
            if (!target) return;

            isScrollingManual = true;

            const targetTop =
                target.getBoundingClientRect().top + window.scrollY;

            const isScrollingUp = targetTop < window.scrollY;
            const offset = getHeaderOffset(isScrollingUp);

            setActiveBtn(i);

            window.scrollTo({
                top: targetTop - offset,
                behavior: 'smooth',
            });

            const checkScrollEnd = () => {
                isScrollingManual = false;
                window.removeEventListener('scrollend', checkScrollEnd);
            };

            if ('onscrollend' in window) {
                window.addEventListener('scrollend', checkScrollEnd);
            } else {
                setTimeout(() => {
                    isScrollingManual = false;
                }, 800);
            }
        });
    });

    const observer = new IntersectionObserver(
        (entries) => {
            if (isScrollingManual) return;

            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = anchorsTargets.indexOf(entry.target);

                    if (index !== -1) {
                        setActiveBtn(index);
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: '-15% 0px -80% 0px',
            threshold: 0,
        },
    );

    anchorsTargets.forEach((target) => observer.observe(target));
};

document.addEventListener('DOMContentLoaded', () => {
    initAudioBG();
    initVideoAutoplay();
    initHeader();
    initSVGAnimation();
    initBenefitsShow();
    initGallerySlider();
    initBlogSlider();
    initFAQBox();
    initReviewsSlider();
    initAutoHeightHandler();
    initToggleClasses({
        selector: '.js-addit-service',
        className: 'is-active',
    });
    initCarousels();
    initClassActive({ selector: '.js-present-box' });
    initProcSlider();
    initContactForm();
    initArticlePage();
});
