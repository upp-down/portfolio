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

// ===== P1: 鼠标悬停标签行时，滚轮横向滚动 =====

function initMarquee() {
  const marquee = document.getElementById('skillsMarquee');
  if (!marquee) return;

  const tracks = marquee.querySelectorAll('.marquee-track');
  if (!tracks.length) return;

  // 每行的当前偏移量
  const offsets = [0, 0];
  const targetOffsets = [0, 0];
  let animating = false;

  // 计算每行最大可滚动距离
  function getMaxScroll(track) {
    return Math.max(0, track.scrollWidth - marquee.clientWidth);
  }

  // 惯性动画
  function animate() {
    let needsUpdate = false;

    tracks.forEach((track, i) => {
      const diff = targetOffsets[i] - offsets[i];
      if (Math.abs(diff) > 0.5) {
        offsets[i] += diff * 0.12;
        track.style.transform = `translateX(${-offsets[i]}px)`;
        needsUpdate = true;
      } else {
        offsets[i] = targetOffsets[i];
        track.style.transform = `translateX(${-offsets[i]}px)`;
      }
    });

    if (needsUpdate) {
      requestAnimationFrame(animate);
    } else {
      animating = false;
    }
  }

  function startAnimate() {
    if (!animating) {
      animating = true;
      animate();
    }
  }

  // 滚轮事件：鼠标悬停在标签行上时，横向滚动
  marquee.addEventListener('wheel', (e) => {
    e.preventDefault();

    const delta = e.deltaY || e.deltaX;

    tracks.forEach((track, i) => {
      const max = getMaxScroll(track);
      // 两行反向滚动
      const direction = i === 0 ? 1 : -1;
      targetOffsets[i] = Math.max(0, Math.min(max, targetOffsets[i] + delta * direction));
    });

    startAnimate();
  }, { passive: false });

  // 触摸支持（移动端）
  let touchStartX = 0;
  let touchStartOffsets = [0, 0];

  marquee.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartOffsets = [...targetOffsets];
  }, { passive: true });

  marquee.addEventListener('touchmove', (e) => {
    const delta = touchStartX - e.touches[0].clientX;

    tracks.forEach((track, i) => {
      const max = getMaxScroll(track);
      const direction = i === 0 ? 1 : -1;
      targetOffsets[i] = Math.max(0, Math.min(max, touchStartOffsets[i] + delta * direction));
    });

    startAnimate();
  }, { passive: true });

  // 添加提示：鼠标悬停时显示可横向滚动
  marquee.style.cursor = 'grab';
  marquee.addEventListener('mouseenter', () => { marquee.style.cursor = 'grab'; });
  marquee.addEventListener('mousedown', () => { marquee.style.cursor = 'grabbing'; });
  marquee.addEventListener('mouseup', () => { marquee.style.cursor = 'grab'; });
}

// ===== P2: 粘性堆叠卡片 =====

function initStickyStack() {
  const stack = document.getElementById('stickyStack');
  if (!stack) return;

  const cards = stack.querySelectorAll('.stack-card');
  if (!cards.length) return;

  // 设置初始 z-index：越靠后的卡片层级越高
  cards.forEach((card, i) => {
    card.style.zIndex = i + 1;
  });

  let ticking = false;

  function updateStack() {
    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const threshold = 100;
      const scrollPast = threshold - rect.top;

      if (index === cards.length - 1) {
        // 最后一张卡片不参与堆叠
        card.classList.remove('is-stacking', 'is-hidden');
        card.style.transform = '';
        card.style.opacity = '';
        return;
      }

      if (scrollPast > 0 && scrollPast < 250) {
        // 堆叠中：缩小 + 偏移 + 阴影
        const progress = Math.min(scrollPast / 200, 1);
        const scale = 1 - progress * 0.04;
        const translateY = -progress * 8;
        const opacity = 1 - progress * 0.1;

        card.classList.add('is-stacking');
        card.classList.remove('is-hidden');
        card.style.transform = `scale(${scale}) translateY(${translateY}px)`;
        card.style.opacity = opacity;
      } else if (scrollPast >= 250) {
        // 完全隐藏
        card.classList.add('is-hidden');
        card.classList.remove('is-stacking');
        card.style.transform = '';
        card.style.opacity = '';
      } else {
        // 默认状态
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
