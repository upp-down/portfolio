/**
 * 周思霞个人作品集 - 交互逻辑
 * 动效：P1 滚动驱动横向移动 + P2 粘性堆叠卡片
 */

// ===== DOM 元素 =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navbar = document.getElementById('navbar');
const navLinkItems = document.querySelectorAll('.nav-link');
const fadeElements = document.querySelectorAll('.fade-up');

// ===== P1: 滚动驱动横向移动（技能标签带） =====

function initMarquee() {
  const marquee = document.getElementById('skillsMarquee');
  if (!marquee) return;

  const rows = marquee.querySelectorAll('.marquee-row');
  const speeds = [0.3, -0.2]; // 第一行向左，第二行向右

  let ticking = false;

  function updateMarquee() {
    const rect = marquee.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // 只在元素可见时计算
    if (rect.bottom < 0 || rect.top > windowHeight) {
      ticking = false;
      return;
    }

    // 计算滚动进度（0~1）
    const progress = (windowHeight - rect.top) / (windowHeight + rect.height);

    rows.forEach((row, i) => {
      const track = row.querySelector('.marquee-track');
      if (!track) return;

      // 计算偏移量
      const maxOffset = track.scrollWidth / 2; // 一半宽度（因为有重复内容）
      const offset = progress * maxOffset * speeds[i];

      track.style.transform = `translateX(${offset}px)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateMarquee);
      ticking = true;
    }
  }, { passive: true });

  // 初始执行一次
  updateMarquee();
}

// ===== P2: 粘性堆叠卡片 =====

function initStickyStack() {
  const stack = document.getElementById('stickyStack');
  if (!stack) return;

  const cards = stack.querySelectorAll('.stack-card');
  if (!cards.length) return;

  let ticking = false;

  function updateStack() {
    const stackRect = stack.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;

      // 当前卡片已经滚过视口顶部一定距离时，开始缩小
      const threshold = 120; // 距离顶部多少像素开始效果
      const scrollPast = threshold - rect.top;

      if (scrollPast > 0 && index < cards.length - 1) {
        // 计算缩小进度（0~1）
        const progress = Math.min(scrollPast / 200, 1);

        card.classList.add('is-stacking');
        card.classList.remove('is-hidden');

        // 动态缩放
        const scale = 1 - progress * 0.03; // 从 1 缩到 0.97
        const opacity = 1 - progress * 0.15; // 从 1 降到 0.85
        card.style.transform = `scale(${scale})`;
        card.style.opacity = opacity;
      } else if (scrollPast > 300 && index < cards.length - 1) {
        // 完全隐藏
        card.classList.add('is-hidden');
        card.classList.remove('is-stacking');
        card.style.transform = '';
        card.style.opacity = '';
      } else {
        // 恢复默认
        card.classList.remove('is-stacking', 'is-hidden');
        card.style.transform = '';
        card.style.opacity = '';
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateStack);
      ticking = true;
    }
  }, { passive: true });

  // 初始执行一次
  updateStack();
}

// ===== 导航栏滚动高亮 =====

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

// ===== 移动端菜单 =====

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

// ===== 滚动淡入动画 =====

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

// ===== 平滑滚动 =====

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

// ===== 图片懒加载 =====

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

// ===== 项目卡片跳转动效 =====

function bindProjectTransitions() {
  const overlay = document.getElementById('pageOverlay');

  document.querySelectorAll('.project-link a[href$=".html"]').forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const url = this.getAttribute('href');

      if (!overlay) {
        window.location.href = url;
        return;
      }

      // 退场动画
      overlay.style.transformOrigin = 'bottom';
      overlay.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
      overlay.style.transform = 'scaleY(1)';

      setTimeout(() => {
        window.location.href = url;
      }, 600);
    });
  });
}

// ===== 入场动画 =====

function pageEnterAnimation() {
  const overlay = document.getElementById('pageOverlay');
  if (!overlay) return;

  // 检查是否从详情页返回
  const isBack = sessionStorage.getItem('pageTransition') === 'back';
  if (isBack) {
    sessionStorage.removeItem('pageTransition');
    overlay.style.display = 'none';
    initAll();
    return;
  }

  // 入场：遮罩从上收起
  overlay.style.transformOrigin = 'top';
  overlay.style.transition = 'transform 0.8s cubic-bezier(0.65, 0, 0.35, 1)';
  overlay.style.transform = 'scaleY(0)';

  setTimeout(() => {
    overlay.style.display = 'none';
    initAll();
  }, 800);
}

// ===== 统一初始化 =====

function initAll() {
  updateNavigation();
  initMarquee();
  initStickyStack();
  initScrollAnimations();
  initLazyLoading();
  bindProjectTransitions();
}

// 页面加载后执行
window.addEventListener('DOMContentLoaded', () => {
  pageEnterAnimation();
});

// ===== 控制台 =====
console.log('%c👋 欢迎查看周思霞的个人作品集', 'color: #C49A6C; font-size: 14px; font-weight: 600;');
