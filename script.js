/* ===== НАСТРОЙКИ ОТПРАВКИ ===== */

// Google Apps Script: URL веб-приложения
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbx2oQCy5ecDw95_HteWWcNw1BWnm0YvvRcpRxruyWGWMeT-uFSiem_hF7l7LwRWAFGm/exec";

// Web3Forms
const WEB3FORMS_URL = "https://api.web3forms.com/submit";


/* ===== ШАПКА И ПРОГРЕСС ===== */

const hdr = document.getElementById('hdr');
const prog = document.getElementById('progress');

addEventListener('scroll', () => {
  if (hdr) {
    hdr.classList.toggle('scrolled', scrollY > 10);
  }

  if (prog) {
    const h = document.documentElement;
    const maxScroll = h.scrollHeight - h.clientHeight;

    const percent = maxScroll > 0
      ? (scrollY / maxScroll) * 100
      : 0;

    prog.style.width = percent + '%';
  }
}, { passive: true });


/* ===== АНИМАЦИИ ПРИ ПРОКРУТКЕ ===== */

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.rv').forEach(el => {
  io.observe(el);
});


/* ===== ДЕМО ЧАТА ===== */

const msgs = [...document.querySelectorAll('#chat .msg')];
const widget = document.getElementById('widget');

function countUp() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const to = Number(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const duration = 1400;

    (function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.round(
        to * (1 - Math.pow(1 - progress, 3))
      );

      el.textContent = prefix + value + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    })(start);
  });
}

function playDemo() {
  msgs.forEach(msg => msg.classList.remove('show'));

  if (widget) {
    widget.classList.remove('show');
  }

  msgs.forEach((msg, index) => {
    setTimeout(() => {
      msg.classList.add('show');
    }, 400 + index * 700);
  });

  setTimeout(() => {
    if (widget) {
      widget.classList.add('show');
      countUp();
    }
  }, 400 + msgs.length * 700 + 300);
}

const demo = document.getElementById('demo');

if (demo) {
  const demoIO = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      playDemo();
      demoIO.disconnect();

      setInterval(playDemo, 12000);
    }
  }, { threshold: 0.3 });

  demoIO.observe(demo);
}


/* ===== ЭФФЕКТ КАРТОЧЕК ===== */

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('mousemove', event => {
    const rect = card.getBoundingClientRect();

    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform =
      `translateY(-6px) perspective(700px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


/* ===== ОПРОС ===== */

const form = document.getElementById('survey-form');
const qs = [...document.querySelectorAll('.q')];
const bars = [...document.querySelectorAll('#stepper i')];

const next = document.getElementById('next');
const prev = document.getElementById('prev');
const err = document.getElementById('err');
const note = document.getElementById('stepnote');

let step = 0;

function show() {
  qs.forEach((question, index) => {
    question.classList.toggle('active', index === step);
  });

  bars.forEach((bar, index) => {
    bar.classList.toggle('done', index <= step);
  });

  if (prev) {
    prev.style.visibility = step ? 'visible' : 'hidden';
  }

  if (next) {
    next.textContent =
      step === qs.length - 1
        ? 'Завершить'
        : 'Далее →';
  }

  if (note) {
    note.textContent = `Шаг ${step + 1} из ${qs.length}`;
  }

  if (err) {
    err.style.display = 'none';
  }
}

function fail(message) {
  if (err) {
    err.textContent = message;
    err.style.display = 'block';
  }

  return false;
}

function valid() {
  const question = qs[step];

  if (!question) {
    return fail('Не удалось найти текущий вопрос.');
  }

  // Последний шаг: контакты необязательны.
  if (step === qs.length - 1) {
    const emailInput = question.querySelector('input[type="email"]');

    if (emailInput) {
      const email = emailInput.value.trim();

      if (
        email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return fail('Проверьте email или оставьте поле пустым.');
      }
    }

    return true;
  }

  // Проверяем наличие выбранного варианта.
  if (!question.querySelector('input:checked')) {
    return fail('Выберите хотя бы один вариант.');
  }

  return true;
}


/* ===== МОДАЛЬНОЕ ОКНО ===== */

const modal = document.getElementById('modal');

function openModal() {
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}

const modalClose = document.getElementById('modal-close');
const modalSkip = document.getElementById('modal-skip');

if (modalClose) {
  modalClose.onclick = closeModal;
}

if (modalSkip) {
  modalSkip.onclick = closeModal;
}

if (modal) {
  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });
}

addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal();
  }
});


/* ===== СБОР ДАННЫХ ФОРМЫ ===== */

function collect() {
  const result = {};

  if (!form) {
    return result;
  }

  new FormData(form).forEach((value, key) => {
    if (result[key]) {
      result[key] += ', ' + value;
    } else {
      result[key] = value;
    }
  });

  return result;
}


/* ===== ОТПРАВКА В GOOGLE ТАБЛИЦУ ===== */

async function sendToSheets(data) {
  if (!SHEETS_URL) {
    console.warn('Google Sheets: URL не указан.');
    return false;
  }

  const row = { ...data };

  // Не передаём служебные поля Web3Forms.
  delete row.access_key;
  delete row.subject;
  delete row.from_name;
  delete row.botcheck;

  try {
    const response = await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(row)
    });

    /*
      В режиме no-cors браузер обычно возвращает opaque response.
      Мы не можем прочитать ответ Apps Script и проверить запись.
      Поэтому true здесь означает только отсутствие доступной
      браузеру ошибки отправки, а не подтверждённую запись.
    */

    console.log(
      'Google Sheets: запрос отправлен. Проверьте запись в таблице.'
    );

    return response.type === 'opaque'
      ? 'unknown'
      : response.ok;

  } catch (error) {
    console.error(
      'Google Sheets: ошибка отправки',
      error
    );

    return false;
  }
}


/* ===== ОТПРАВКА В WEB3FORMS ===== */

async function sendToMail(data) {
  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error(
        'Web3Forms: сервер вернул ошибку',
        result
      );

      return {
        success: false,
        message: result.message || 'Ошибка отправки письма'
      };
    }

    console.log('Web3Forms: письмо успешно отправлено.');

    return {
      success: true
    };

  } catch (error) {
    console.error(
      'Web3Forms: ошибка запроса',
      error
    );

    return {
      success: false,
      message: error.message
    };
  }
}


/* ===== ОБЩАЯ ОТПРАВКА ===== */

let isSubmitting = false;

async function submit() {
  if (isSubmitting) return;

  isSubmitting = true;

  const data = collect();

  // Защита от автоматической отправки ботами.
  if (data.botcheck) {
    isSubmitting = false;
    return;
  }

  delete data.botcheck;

  next.disabled = true;
  next.textContent = 'Отправляем...';

  try {
    // Запускаем обе отправки независимо.
    const [sheetsResult, mailResult] = await Promise.all([
      sendToSheets(data),
      sendToMail(data)
    ]);

    console.log('Результат Google Sheets:', sheetsResult);
    console.log('Результат Web3Forms:', mailResult);

    /*
      Успех Web3Forms подтверждается ответом сервера.
      Google Sheets в режиме no-cors не может подтвердить запись.

      Поэтому не считаем Google Sheets успешно записанным
      только на основании отправки запроса.
    */

    const mailSuccess = mailResult.success;

    if (mailSuccess) {
      form.style.display = 'none';
      openModal();
      confetti();

      return;
    }

    /*
      Если Web3Forms не сработал, но запрос Google Sheets
      был отправлен, показываем сообщение, не утверждая,
      что данные точно записаны.
    */

    if (sheetsResult === 'unknown') {
      form.style.display = 'none';
      openModal();
      confetti();

      console.warn(
        'Запрос Google Sheets отправлен, но запись не подтверждена. ' +
        'Проверьте таблицу и журнал выполнений Apps Script.'
      );

      return;
    }

    next.disabled = false;
    next.textContent = 'Завершить';

    fail(
      'Не удалось подтвердить отправку. ' +
      'Проверьте соединение и попробуйте ещё раз.'
    );

  } catch (error) {
    console.error('Ошибка отправки формы:', error);

    next.disabled = false;
    next.textContent = 'Завершить';

    fail(
      'Произошла ошибка при отправке. Попробуйте ещё раз.'
    );

  } finally {
    isSubmitting = false;
  }
}


/* ===== КНОПКИ ОПРОСА ===== */

if (next) {
  next.onclick = () => {
    if (!valid()) return;

    if (step < qs.length - 1) {
      step++;
      show();
      return;
    }

    submit();
  };
}

if (prev) {
  prev.onclick = () => {
    if (step > 0) {
      step--;
      show();
    }
  };
}

show();


/* ===== КОНФЕТТИ ===== */

function confetti() {
  const canvas = document.createElement('canvas');

  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:200';

  document.body.appendChild(canvas);

  const context = canvas.getContext('2d');

  if (!context) {
    canvas.remove();
    return;
  }

  canvas.width = innerWidth;
  canvas.height = innerHeight;

  const colors = [
    '#4f46e5',
    '#7c5cf0',
    '#10b981',
    '#fbbf24',
    '#f472b6'
  ];

  const particles = Array.from({ length: 120 }, () => ({
    x: innerWidth / 2,
    y: innerHeight / 2,
    vx: (Math.random() - 0.5) * 16,
    vy: Math.random() * -14 - 2,
    size: Math.random() * 7 + 3,
    color: colors[Math.random() * colors.length | 0],
    rotation: Math.random() * 6
  }));

  let frame = 0;

  (function animate() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(particle => {
      particle.vy += 0.35;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += 0.2;

      context.fillStyle = particle.color;

      context.save();

      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);

      context.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size * 0.6
      );

      context.restore();
    });

    frame++;

    if (frame < 140) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  })();
}