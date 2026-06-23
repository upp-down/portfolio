/**
 * Profile Card - 3D 倾斜卡片动效
 * 移植自 ReactBits ProfileCard，纯 JS 实现
 * 保留原始动画曲线和延迟参数
 */

(function () {
  'use strict';

  // ===== 动画配置（与 React 版完全一致） =====
  const ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180
  };

  // ===== 工具函数 =====
  const clamp = (v, min = 0, max = 100) => Math.min(Math.max(v, min), max);
  const round = (v, precision = 3) => parseFloat(v.toFixed(precision));
  const adjust = (v, fMin, fMax, tMin, tMax) =>
    round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

  // ===== 倾斜引擎 =====
  function createTiltEngine(wrapEl, shellEl) {
    let rafId = null;
    let running = false;
    let lastTs = 0;

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    const DEFAULT_TAU = 0.14;
    const INITIAL_TAU = 0.6;
    let initialUntil = 0;

    function setVarsFromXY(x, y) {
      const width = shellEl.clientWidth || 1;
      const height = shellEl.clientHeight || 1;

      const percentX = clamp((100 / width) * x);
      const percentY = clamp((100 / height) * y);

      const centerX = percentX - 50;
      const centerY = percentY - 50;

      const props = {
        '--pc-pointer-x': `${percentX}%`,
        '--pc-pointer-y': `${percentY}%`,
        '--pc-background-x': `${adjust(percentX, 0, 100, 35, 65)}%`,
        '--pc-background-y': `${adjust(percentY, 0, 100, 35, 65)}%`,
        '--pc-pointer-from-center': `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        '--pc-pointer-from-top': `${percentY / 100}`,
        '--pc-pointer-from-left': `${percentX / 100}`,
        '--pc-rotate-x': `${round(-(centerX / 5))}deg`,
        '--pc-rotate-y': `${round(centerY / 4)}deg`
      };

      for (const [k, v] of Object.entries(props)) {
        wrapEl.style.setProperty(k, v);
      }
    }

    function step(ts) {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;

      // 初始阶段用更快的响应（INITIAL_TAU），之后用 DEFAULT_TAU
      const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
      const k = 1 - Math.exp(-dt / tau);

      currentX += (targetX - currentX) * k;
      currentY += (targetY - currentY) * k;

      setVarsFromXY(currentX, currentY);

      const stillFar =
        Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

      if (stillFar || document.hasFocus()) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
        lastTs = 0;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    }

    function start() {
      if (running) return;
      running = true;
      lastTs = 0;
      rafId = requestAnimationFrame(step);
    }

    return {
      setImmediate(x, y) {
        currentX = x;
        currentY = y;
        setVarsFromXY(currentX, currentY);
      },
      setTarget(x, y) {
        targetX = x;
        targetY = y;
        start();
      },
      toCenter() {
        this.setTarget(shellEl.clientWidth / 2, shellEl.clientHeight / 2);
      },
      beginInitial(durationMs) {
        initialUntil = performance.now() + durationMs;
        start();
      },
      getCurrent() {
        return { x: currentX, y: currentY, tx: targetX, ty: targetY };
      },
      cancel() {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        running = false;
        lastTs = 0;
      }
    };
  }

  // ===== 初始化单个卡片 =====
  function initProfileCard(wrapper) {
    const shell = wrapper.querySelector('.pc-card-shell');
    if (!shell) return;

    const enterTimerRef = { id: null };
    const leaveRafRef = { id: null };
    const tiltEngine = createTiltEngine(wrapper, shell);

    function getOffsets(evt, el) {
      const rect = el.getBoundingClientRect();
      return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    }

    function handlePointerMove(event) {
      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    }

    function handlePointerEnter(event) {
      shell.classList.add('active');
      shell.classList.add('entering');
      if (enterTimerRef.id) clearTimeout(enterTimerRef.id);
      enterTimerRef.id = setTimeout(() => {
        shell.classList.remove('entering');
      }, ANIMATION_CONFIG.ENTER_TRANSITION_MS);

      const { x, y } = getOffsets(event, shell);
      tiltEngine.setTarget(x, y);
    }

    function handlePointerLeave() {
      tiltEngine.toCenter();

      function checkSettle() {
        const { x, y, tx, ty } = tiltEngine.getCurrent();
        const settled = Math.hypot(tx - x, ty - y) < 0.6;
        if (settled) {
          shell.classList.remove('active');
          leaveRafRef.id = null;
        } else {
          leaveRafRef.id = requestAnimationFrame(checkSettle);
        }
      }
      if (leaveRafRef.id) cancelAnimationFrame(leaveRafRef.id);
      leaveRafRef.id = requestAnimationFrame(checkSettle);
    }

    // 绑定事件
    shell.addEventListener('pointerenter', handlePointerEnter);
    shell.addEventListener('pointermove', handlePointerMove);
    shell.addEventListener('pointerleave', handlePointerLeave);

    // 初始动画：从右上角滑入中心
    const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
    tiltEngine.setImmediate(initialX, initialY);
    tiltEngine.toCenter();
    tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

    // 清理函数
    return () => {
      shell.removeEventListener('pointerenter', handlePointerEnter);
      shell.removeEventListener('pointermove', handlePointerMove);
      shell.removeEventListener('pointerleave', handlePointerLeave);
      if (enterTimerRef.id) clearTimeout(enterTimerRef.id);
      if (leaveRafRef.id) cancelAnimationFrame(leaveRafRef.id);
      tiltEngine.cancel();
      shell.classList.remove('entering');
    };
  }

  // ===== 全局初始化 =====
  window.ProfileCard = {
    init(container) {
      const wrappers = (container || document).querySelectorAll('.pc-card-wrapper');
      const cleanups = [];
      wrappers.forEach(w => {
        const cleanup = initProfileCard(w);
        if (cleanup) cleanups.push(cleanup);
      });
      return cleanups;
    }
  };

  // 自动初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.ProfileCard.init());
  } else {
    window.ProfileCard.init();
  }
})();
