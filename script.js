/**
 * 周思霞个人作品集 - 交互逻辑
 * 风格：艺术策展/画廊风格，交互克制有质感
 */

// ===== DOM 元素 =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const fadeElements = document.querySelectorAll('.fade-up');
const navLinkItems = document.querySelectorAll('.nav-link');

// ===== 1. 导航栏滚动高亮 =====

function updateNavigation() {
  const scrollY = window.scrollY + 100;

  // 导航栏滚动阴影
  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 1px 0 var(--divider)';
  } else {
    navbar.style.boxShadow = 'none';
  }

  // 高亮当前板块
  const sections = document.querySelectorAll('section[id]');
  let current = 'home';

  sections.forEach(section => {
    if (scrollY >= section.offsetTop - 100) {
      current = section.getAttribute('id');
    }
  });

  navLinkItems.forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-section') === current);
  });
}

let scrollTimer = null;
window.addEventListener('scroll', () => {
  if (scrollTimer) return;
  scrollTimer = setTimeout(() => {
    updateNavigation();
    scrollTimer = null;
  }, 50);
});
updateNavigation();

// ===== 2. 移动端菜单 =====

function toggleMenu() {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
}

hamburger.addEventListener('click', toggleMenu);

navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('active')) toggleMenu();
  });
});

document.addEventListener('click', e => {
  if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
    toggleMenu();
  }
});

// ===== 3. 滚动淡入动画 =====

function initScrollAnimations() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  fadeElements.forEach(el => observer.observe(el));
}

initScrollAnimations();

// ===== 4. 平滑滚动 =====

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 64,
        behavior: 'smooth'
      });
    }
  });
});

// ===== 5. 图片懒加载 =====

function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.src = entry.target.dataset.src;
        entry.target.removeAttribute('data-src');
        observer.unobserve(entry.target);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}

initLazyLoading();

// ===== 控制台 =====
console.log('%c👋 欢迎查看周思霞的个人作品集', 'color: #C49A6C; font-size: 14px; font-weight: 600;');
