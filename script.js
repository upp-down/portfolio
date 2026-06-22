/**
 * 周思霞个人作品集 - 交互逻辑
 * 风格：艺术策展/画廊风格，交互克制有质感
 * 动效：GSAP 驱动的页面过渡 + 滚动动画
 */

// ===== DOM 元素 =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const fadeElements = document.querySelectorAll('.fade-up');
const navLinkItems = document.querySelectorAll('.nav-link');
const overlay = document.getElementById('pageOverlay');

// ===== 1. 页面入场动画（遮罩层展开） =====

function pageEnterAnimation() {
  // 等 GSAP 加载完成
  if (typeof gsap === 'undefined') {
    // GSAP 未加载时直接隐藏遮罩
    if (overlay) overlay.style.display = 'none';
    initAfterLoad();
    return;
  }

  // 检查是否有从详情页返回的标记（不需要入场动画）
  const isBack = sessionStorage.getItem('pageTransition') === 'back';
  if (isBack) {
    sessionStorage.removeItem('pageTransition');
    gsap.set(overlay, { opacity: 0, display: 'none' });
    initAfterLoad();
    return;
  }

  // 入场：遮罩层从上往下收起，露出页面
  gsap.set(overlay, { transformOrigin: 'top', scaleY: 1, opacity: 1, display: 'block' });
  gsap.to(overlay, {
    scaleY: 0,
    duration: 0.8,
    ease: 'power3.inOut',
    delay: 0.1,
    onComplete: () => {
      gsap.set(overlay, { display: 'none' });
      initAfterLoad();
    }
  });
}

// 页面加载后执行入场动画
window.addEventListener('DOMContentLoaded', () => {
  // 等字体加载后执行，避免布局跳动
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => pageEnterAnimation());
  } else {
    setTimeout(pageEnterAnimation, 100);
  }
});

// ===== 2. 页面退场动画（遮罩层展开覆盖） =====

/**
 * 点击项目卡片时触发退场动画
 * @param {MouseEvent} e - 点击事件
 * @param {string} targetUrl - 目标页面 URL
 */
function pageExitAnimation(e, targetUrl) {
  e.preventDefault();

  // 获取点击的卡片信息
  const card = e.currentTarget.closest('.project-entry');
  const cover = card.querySelector('.project-cover-wrap');
  const rect = cover.getBoundingClientRect();

  // 存储卡片位置信息到 sessionStorage
  sessionStorage.setItem('flipData', JSON.stringify({
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    projectId: targetUrl.replace('.html', '')
  }));

  if (typeof gsap === 'undefined') {
    window.location.href = targetUrl;
    return;
  }

  // 退场动画：遮罩层从下往上展开，覆盖页面
  gsap.set(overlay, { transformOrigin: 'bottom', scaleY: 0, opacity: 1, display: 'block' });
  gsap.to(overlay, {
    scaleY: 1,
    duration: 0.6,
    ease: 'power3.inOut',
    onComplete: () => {
      window.location.href = targetUrl;
    }
  });
}

// ===== 3. 项目卡片绑定跳转动效 =====

function bindProjectTransitions() {
  document.querySelectorAll('.project-link a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function (e) {
      pageExitAnimation(e, this.getAttribute('href'));
    });
  });
}

// ===== 4. 导航栏滚动高亮 =====

function updateNavigation() {
  const scrollY = window.scrollY + 100;

  if (window.scrollY > 20) {
    navbar.style.boxShadow = '0 1px 0 var(--divider)';
  } else {
    navbar.style.boxShadow = 'none';
  }

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

// ===== 5. 移动端菜单 =====

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

// ===== 6. 滚动淡入动画（GSAP 增强版） =====

function initScrollAnimations() {
  if (typeof gsap === 'undefined') {
    // 降级：使用原生 IntersectionObserver
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
    return;
  }

  // GSAP 版本：更流畅的淡入
  fadeElements.forEach((el, i) => {
    gsap.set(el, { opacity: 0, y: 30 });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            delay: 0.05
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.1 }
  );

  fadeElements.forEach(el => observer.observe(el));
}

// ===== 7. 平滑滚动 =====

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

// ===== 8. 图片懒加载 =====

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

// ===== 9. 入场后的初始化 =====

function initAfterLoad() {
  updateNavigation();
  bindProjectTransitions();
  initScrollAnimations();
  initLazyLoading();
}

// ===== 控制台 =====
console.log('%c👋 欢迎查看周思霞的个人作品集', 'color: #C49A6C; font-size: 14px; font-weight: 600;');
