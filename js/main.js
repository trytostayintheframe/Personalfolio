    /* ========== АДАПТИВНОЕ МАСШТАБИРОВАНИЕ через transform: scale ==========
       Что делаем:
       1) --frame-zoom обновляется на resize (начальное значение — inline-скрипт в <head>).
       2) .frame.height подгоняется под реальный низ #footer-block (а не 3962/calc-артборд),
          чтобы на scale=1 под футером не висела пустая полоса (макет выше контента).
       3) При scale<1 transform не уменьшает layout-высоту — добавляем отрицательный
          margin-bottom на .frame: внешний кросс-размер flex-item = height + margin-bottom =
          = visualH, и body схлопывается ровно до визуальной высоты без вложенного скролла. */
    (function adaptiveScale() {
      var root = document.documentElement;
      /* На macOS rubber-band overscroll отключён (см. CSS), но transform: scale
         ещё и округляется браузером иначе — даём лишний пиксель запаса, чтобы
         под футером не проявлялась белая полоска. */
      var isMac = /Mac/.test(navigator.platform || '') || /Mac OS X/.test(navigator.userAgent || '');

      function compute(w) {
        if (w < 1440) return w / 1440;
        if (w >= 1520 && w < 1920) return w / 1920;
        return 1;
      }

      /* Низ #footer-block относительно .frame в layout-координатах (без учёта transform). */
      function measureContentHeight(frame) {
        var footer = document.getElementById('footer-block');
        if (!footer) return frame.offsetHeight;
        var el = footer;
        var offset = 0;
        while (el && el !== frame) {
          offset += el.offsetTop || 0;
          el = el.offsetParent;
        }
        return offset + footer.offsetHeight;
      }

      function apply() {
        var frame = document.querySelector('.frame');
        if (!frame) return;

        var w = window.innerWidth;
        var z = compute(w);
        root.style.setProperty('--frame-zoom', z < 1 ? z.toFixed(6) : '1');

        /* Сбрасываем прошлые override'ы перед измерением, иначе при повторных вызовах
           намерили бы уже сжатый layout и сами себя зажали. */
        frame.style.height = '';
        document.body.style.height = '';
        document.body.style.overflowY = '';

        var contentH = measureContentHeight(frame);
        frame.style.height = contentH + 'px';

        if (z < 1) {
          /* Визуальная высота сжатого фрейма. Явно задаём body height под неё и
             прячем вертикальный overflow body, чтобы невидимый layout-хвост (transform
             не уменьшает layout-размер) не создавал скроллбар внутри body.
             Основной page-scroll остаётся на html — он всё равно сам пересчитает
             свою высоту под body.

             Math.floor (а не round) — чтобы при суб-пиксельном результате body НЕ оказался
             выше визуального низа фрейма. Иначе под футером остаётся тонкая (0.3–0.7px)
             белая полоска. Потерянные пол-пикселя визуала незаметно обрежет overflow:hidden.
             На Mac дополнительно срезаем 1px — там transform округляется агрессивнее. */
          var bodyH = Math.floor(contentH * z);
          if (isMac) bodyH = Math.max(0, bodyH - 1);
          document.body.style.height = bodyH + 'px';
          document.body.style.overflowY = 'hidden';
        }
      }

      window.addEventListener('resize', apply);
      window.addEventListener('load', apply);
      /* Повторный прогон после загрузки шрифтов/картинок — их реальные размеры могут
         чуть сдвинуть низ футера. */
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(apply).catch(function () {});
      }
      if (document.readyState !== 'loading') apply();
      else document.addEventListener('DOMContentLoaded', apply);
    })();

    const STORY_DURATION = 7000;
    const CIRCUMFERENCE = 276.5;
    const storyIds = ['story-1', 'story-2'];
    /** Ссылки «смотреть кейс» (клик по зоне с кастомным курсором, не по story-кружкам) */
    const CASE_URL_MTS_TRAVEL =
      'https://buildin.ai/share/c93eb7f2-3a7c-4168-afd9-a662e0c791c9?code=6DNLF1';
    const CASE_URL_ALFA_BANK =
      'https://buildin.ai/share/333279b4-68dd-4a17-abdc-b020e2ed0791?code=6DNLF1';
    let currentIndex = 0;
    let timer = null;

    function openCaseStudyFromCursorZone() {
      /* По фону, а не по currentIndex — так ссылка всегда совпадает с тем, что на экране */
      var pink = document.getElementById('bg-pink');
      var isAlfaCase = pink && String(pink.style.opacity) === '1';
      var url = isAlfaCase ? CASE_URL_ALFA_BANK : CASE_URL_MTS_TRAVEL;
      if (url && url.indexOf('http') === 0) {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }

    function activateStory(index) {
      clearTimeout(timer);
      currentIndex = index;

      // Переключаем фон и контент
      const bgBlue = document.getElementById('bg-blue');
      const bgPink = document.getElementById('bg-pink');
      const title1  = document.getElementById('case-title-1');
      const sub1    = document.getElementById('case-sub-1');
      const img1    = document.getElementById('case-img-1');
      const title2  = document.getElementById('case-title-2');
      const sub2    = document.getElementById('case-sub-2');
      const img2    = document.getElementById('case-img-2');

      if (index === 1) {
        bgBlue.style.opacity  = '0';
        bgPink.style.opacity  = '1';
        title1.style.opacity  = '0';
        sub1.style.opacity    = '0';
        img1.style.opacity    = '0';
        title2.style.opacity  = '1';
        sub2.style.opacity    = '1';
        img2.style.opacity    = '1';
      } else {
        bgBlue.style.opacity  = '1';
        bgPink.style.opacity  = '0';
        title1.style.opacity  = '1';
        sub1.style.opacity    = '1';
        img1.style.opacity    = '1';
        title2.style.opacity  = '0';
        sub2.style.opacity    = '0';
        img2.style.opacity    = '0';
      }

      // Все кольца сбрасываем в скрытое состояние
      storyIds.forEach(function (id) {
        const ring = document.querySelector('#' + id + ' .story-ring-progress');
        ring.style.animation = 'none';
        ring.getBoundingClientRect(); // force reflow
        ring.style.strokeDashoffset = CIRCUMFERENCE;
      });

      // Запускаем анимацию текущего
      const activeRing = document.querySelector('#' + storyIds[index] + ' .story-ring-progress');
      activeRing.style.animation = 'story-ring-fill ' + STORY_DURATION + 'ms linear forwards';

      timer = setTimeout(function () {
        // Прячем кольцо текущего после завершения
        activeRing.style.animation = 'none';
        activeRing.getBoundingClientRect();
        activeRing.style.strokeDashoffset = CIRCUMFERENCE;

        // Переход к следующему
        const next = (index + 1) % storyIds.length;
        activateStory(next);
      }, STORY_DURATION);
    }

    document.addEventListener('DOMContentLoaded', function () {
      activateStory(0);

      var footerLinkUp = document.getElementById('footer-link-up');
      if (footerLinkUp) {
        footerLinkUp.addEventListener('click', function (e) {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // Кастомный курсор в зоне кейсов
      const cursor = document.getElementById('custom-cursor');

      const caseZoneIds = new Set([
        'bg-blue', 'bg-pink',
        'case-title-1', 'case-title-2',
        'case-sub-1', 'case-sub-2',
        'case-img-1', 'case-img-2'
      ]);

      /** Та же логика, что показывает кастомный курсор «смотреть кейс» */
      function isCaseViewCursorActive(clientX, clientY) {
        const els = document.elementsFromPoint(clientX, clientY);
        const onStory = els.some(function (el) {
          return el.closest && el.closest('.story-wrapper');
        });
        const inCaseZone = els.some(function (el) {
          return caseZoneIds.has(el.id) || el.classList.contains('cases-title');
        });
        return inCaseZone && !onStory;
      }

      document.addEventListener('mousemove', function (e) {
        if (isCaseViewCursorActive(e.clientX, e.clientY)) {
          cursor.style.display = 'block';
          cursor.style.left = e.clientX + 'px';
          cursor.style.top  = e.clientY + 'px';
        } else {
          cursor.style.display = 'none';
        }
      });

      document.addEventListener('click', function (e) {
        if (!isCaseViewCursorActive(e.clientX, e.clientY)) return;
        openCaseStudyFromCursorZone();
      });

      // Кнопка НАПИСАТЬ — скрывать при появлении футера
      const btnNapisat = document.querySelector('.btn-napisat');
      const footerBlock = document.getElementById('footer-block');

      if (btnNapisat && footerBlock) {
        btnNapisat.style.transition = 'opacity 0.4s ease';

        const footerObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              btnNapisat.style.opacity = '0';
              btnNapisat.style.pointerEvents = 'none';
            } else {
              btnNapisat.style.opacity = '1';
              btnNapisat.style.pointerEvents = 'auto';
            }
          });
        }, { threshold: 0.1 });

        footerObserver.observe(footerBlock);
      }

      // Parallax float effect for footer avatars
      var bogdan = document.getElementById('footer-bogdan');
      var sasha  = document.getElementById('footer-sasha');
      var max    = document.getElementById('footer-max');

      var targetBogdan = { x: 0, y: 0 };
      var targetSasha  = { x: 0, y: 0 };
      var targetMax    = { x: 0, y: 0 };
      var currentBogdan = { x: 0, y: 0 };
      var currentSasha  = { x: 0, y: 0 };
      var currentMax    = { x: 0, y: 0 };
      var rafId = null;
      var footerActive = false;
      /** Лёгкий сдвиг при hover на Сашу — визуальный зазор стрелки и «обводки» в SVG */
      var sashaHoverNudge = { x: 0, y: 0 };
      var SASHA_HOVER_GAP = { x: -2.5, y: -2.5 };

      function lerp(a, b, t) { return a + (b - a) * t; }

      function tickParallax() {
        var ease = 0.1;
        currentBogdan.x = lerp(currentBogdan.x, targetBogdan.x, ease);
        currentBogdan.y = lerp(currentBogdan.y, targetBogdan.y, ease);
        currentSasha.x  = lerp(currentSasha.x,  targetSasha.x,  ease);
        currentSasha.y  = lerp(currentSasha.y,  targetSasha.y,  ease);
        currentMax.x    = lerp(currentMax.x,    targetMax.x,    ease);
        currentMax.y    = lerp(currentMax.y,    targetMax.y,    ease);

        bogdan.style.transform = 'translate(' + currentBogdan.x.toFixed(2) + 'px, ' + currentBogdan.y.toFixed(2) + 'px)';
        sasha.style.transform  = 'translate(' + currentSasha.x.toFixed(2)  + 'px, ' + currentSasha.y.toFixed(2)  + 'px)';
        max.style.transform    = 'translate(' + currentMax.x.toFixed(2)    + 'px, ' + currentMax.y.toFixed(2)    + 'px)';

        /* После ухода курсора — доводим до нуля и останавливаем RAF (раньше цикл крутился бесконечно). */
        if (!footerActive) {
          var settled =
            Math.abs(currentBogdan.x) < 0.05 && Math.abs(currentBogdan.y) < 0.05 &&
            Math.abs(currentSasha.x) < 0.05 && Math.abs(currentSasha.y) < 0.05 &&
            Math.abs(currentMax.x) < 0.05 && Math.abs(currentMax.y) < 0.05;
          if (settled) {
            rafId = null;
            return;
          }
        }

        rafId = requestAnimationFrame(tickParallax);
      }

      if (footerBlock && bogdan && sasha && max) {
        footerBlock.addEventListener('mouseenter', function () {
          footerActive = true;
          if (!rafId) rafId = requestAnimationFrame(tickParallax);
        });

        footerBlock.addEventListener('mouseleave', function () {
          footerActive = false;
          sashaHoverNudge.x = 0;
          sashaHoverNudge.y = 0;
          targetBogdan.x = 0; targetBogdan.y = 0;
          targetSasha.x  = 0; targetSasha.y  = 0;
          targetMax.x    = 0; targetMax.y    = 0;
        });

        sasha.addEventListener('mouseenter', function () {
          sashaHoverNudge.x = SASHA_HOVER_GAP.x;
          sashaHoverNudge.y = SASHA_HOVER_GAP.y;
        });
        sasha.addEventListener('mouseleave', function () {
          sashaHoverNudge.x = 0;
          sashaHoverNudge.y = 0;
        });

        footerBlock.addEventListener('mousemove', function (e) {
          /* Не завязываемся только на mouseenter: при наведении сразу обновляем цели */
          if (!rafId) {
            footerActive = true;
            rafId = requestAnimationFrame(tickParallax);
          }
          var rect = footerBlock.getBoundingClientRect();
          // Normalised -1 … +1 from center
          var nx = (e.clientX - rect.left  - rect.width  / 2) / (rect.width  / 2);
          var ny = (e.clientY - rect.top   - rect.height / 2) / (rect.height / 2);

          // Притягивание к центру блока «обсудим задачу» — сильнее, когда курсор ближе к кнопке
          var taskLink = document.getElementById('footer-task-question-link');
          var pullBx = 0, pullBy = 0, pullSx = 0, pullSy = 0, pullMx = 0, pullMy = 0;
          if (taskLink) {
            var tr = taskLink.getBoundingClientRect();
            var tcx = tr.left + tr.width / 2;
            var tcy = tr.top + tr.height / 2;
            var mouseDist = Math.hypot(e.clientX - tcx, e.clientY - tcy);
            var PROXIMITY_RADIUS = 420;
            var proximity = Math.max(0, Math.min(1, 1 - mouseDist / PROXIMITY_RADIUS));
            var PULL_MAX = 34;

            function pullTowardTask(el) {
              var r = el.getBoundingClientRect();
              var ax = r.left + r.width / 2;
              var ay = r.top + r.height / 2;
              var dx = tcx - ax;
              var dy = tcy - ay;
              var dist = Math.max(1, Math.hypot(dx, dy));
              return {
                x: (dx / dist) * proximity * PULL_MAX,
                y: (dy / dist) * proximity * PULL_MAX
              };
            }

            var pb = pullTowardTask(bogdan);
            var ps = pullTowardTask(sasha);
            var pm = pullTowardTask(max);
            pullBx = pb.x; pullBy = pb.y;
            pullSx = ps.x; pullSy = ps.y;
            pullMx = pm.x; pullMy = pm.y;
          }

          // Each avatar gets a unique depth factor & direction for a 3-D feel
          targetBogdan.x = nx * -32 + pullBx;
          targetBogdan.y = ny * -24 + pullBy;

          targetSasha.x  = nx *  28 + pullSx + sashaHoverNudge.x;
          targetSasha.y  = ny * -30 + pullSy + sashaHoverNudge.y;

          targetMax.x    = nx *  22 + pullMx;
          targetMax.y    = ny *  26 + pullMy;
        });
      }
    });

    (function () {
      const preview = document.getElementById('brand-preview');
      const previewImg = document.getElementById('brand-preview-img');
      let currentRow = null;

      document.querySelectorAll('.brand-row').forEach(function (row) {
        row.addEventListener('mouseenter', function () {
          const src = row.getAttribute('data-hover-image');
          if (!src) return;
          previewImg.src = src;
          currentRow = row;
          preview.style.opacity = '1';
        });

        row.addEventListener('mousemove', function (e) {
          preview.style.left = e.clientX + 'px';
          preview.style.top  = e.clientY + 'px';
        });

        row.addEventListener('mouseleave', function () {
          preview.style.opacity = '0';
          currentRow = null;
        });
      });
    })();
