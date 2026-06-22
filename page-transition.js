/**
 * 详情页入场动效
 * 在每个详情页引入此脚本，自动处理 FLIP 入场动画
 * 用法：<script src="page-transition.js" defer></script>
 */

(function () {
  const overlay = document.getElementById('pageOverlay');
  const mainImage = document.querySelector('.detail-hero-image, .project-main-image');

  function runEntrance() {
    if (typeof gsap === 'undefined') {
      if (overlay) overlay.style.display = 'none';
      return;
    }

    // 读取 FLIP 数据
    const flipRaw = sessionStorage.getItem('flipData');
    sessionStorage.removeItem('flipData');

    if (!flipRaw || !mainImage) {
      // 无 FLIP 数据，普通入场
      simpleEntrance();
      return;
    }

    const flip = JSON.parse(flipRaw);
    const targetRect = mainImage.getBoundingClientRect();

    // 将主图初始定位到旧卡片位置
    gsap.set(mainImage, {
      position: 'fixed',
      left: flip.x,
      top: flip.y,
      width: flip.width,
      height: flip.height,
      borderRadius: '2px',
      zIndex: 10000,
      objectFit: 'cover'
    });

    // 隐藏遮罩
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out',
      onComplete: () => gsap.set(overlay, { display: 'none' })
    });

    // FLIP 动画：从旧位置飞到新位置
    gsap.to(mainImage, {
      left: targetRect.left,
      top: targetRect.top,
      width: targetRect.width,
      height: targetRect.height,
      duration: 0.9,
      ease: 'power3.out',
      delay: 0.15,
      onComplete: () => {
        // 恢复正常布局
        gsap.set(mainImage, {
          position: '',
          left: '',
          top: '',
          width: '',
          height: '',
          borderRadius: '',
          zIndex: '',
          objectFit: ''
        });
        // 淡入页面其他内容
        revealContent();
      }
    });
  }

  function simpleEntrance() {
    gsap.set(overlay, { transformOrigin: 'top', scaleY: 1, opacity: 1, display: 'block' });
    gsap.to(overlay, {
      scaleY: 0,
      duration: 0.8,
      ease: 'power3.inOut',
      delay: 0.1,
      onComplete: () => {
        gsap.set(overlay, { display: 'none' });
        revealContent();
      }
    });
  }

  function revealContent() {
    // 淡入详情页各板块
    const sections = document.querySelectorAll('.detail-section, .detail-content, .fade-up');
    if (sections.length && typeof gsap !== 'undefined') {
      gsap.from(sections, {
        opacity: 0,
        y: 24,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08
      });
    }
  }

  // 返回按钮：标记不需要入场动画
  document.querySelectorAll('a[href="index.html"], a[href="./"], .back-link').forEach(link => {
    link.addEventListener('click', () => {
      sessionStorage.setItem('pageTransition', 'back');
    });
  });

  // 页面加载后执行
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => runEntrance());
  } else {
    setTimeout(runEntrance, 100);
  }
})();
