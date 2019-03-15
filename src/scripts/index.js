// Добавляем варианты в выпадающий список с выбором даты сеанса:
const now = new Date();

const dateSelect = document.querySelector('.date__select');
const dateSelectOptions = [now];

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

let newDate;

for (let i = 1; i < 8; i++) {
  newDate = addDays(new Date(), i);
  dateSelectOptions.push(newDate);
}

for (let i = 1; i < 8; i++) {
  newDate = addDays(new Date(), -i);
  dateSelectOptions.unshift(newDate);
}

let dateSelectOptionItem;
dateSelectOptions.forEach(item => {
  dateSelectOptionItem = document.createElement('option');
  dateSelect.appendChild(dateSelectOptionItem);
  dateSelectOptionItem.textContent = `${item.getDate()}.${item.getMonth() +
    1}.${item.getFullYear()}`;

  item === now ? dateSelectOptionItem.setAttribute('selected', true) : null;
});

// Отмечаем прошедшие сеансы добавлением класса к кнопкам:
const buttonsWrapper = document.querySelector('.time__buttons-wrapper');

const addPostClass = () => {
  [...buttonsWrapper.children].forEach(item => {
    item.classList.add('time__button--past');
  });
};

const removePostClass = () => {
  [...buttonsWrapper.children].forEach(item => {
    item.classList.remove('time__button--past');
  });
};

const selectPostSessions = () => {
  dateSelectOptions.forEach(item => {
    if (
      `${item.getDate()}.${item.getMonth() + 1}.${item.getFullYear()}` ===
      dateSelect.value
    ) {
      now.getTime() > item.getTime() ? addPostClass() : removePostClass();

      if (now.getDate() === item.getDate()) {
        [...buttonsWrapper.children].forEach(item => {
          if (
            Number(item.textContent.substring(0, 2)) <=
              Number(now.getHours()) &&
            Number(item.textContent.substring(3, 5)) < Number(now.getMinutes())
          ) {
            item.classList.add('time__button--past');
          }
        });
      }
    }
  });
};

selectPostSessions();
dateSelect.addEventListener('change', selectPostSessions);

// Помечаем активный/выбранный сеанс добавлением активного класса к выбранной кнопке:
const seatsSection = document.querySelector('.seat');

[...buttonsWrapper.children].forEach(item => {
  item.addEventListener('click', event => {
    seatsSection.classList.remove('seat-hidden');
    [...buttonsWrapper.children].forEach(item => {
      item.classList.remove('time__button--active');
    });
    event.target.classList.add('time__button--active');
  });
});

// Убираем активный класс у кнопки при изменении даты и скрываем выбор места при изменении даты:
dateSelect.addEventListener('change', () => {
  [...buttonsWrapper.children].forEach(item => {
    seatsSection.classList.add('seat-hidden');
    item.classList.remove('time__button--active');
  });
});

// Исключаем возможность бронирования мест на прошедшие сеансы, а также удаляем tagged и reserved классы у всех мест при изменении даты или времени
const seatsRow = document.querySelectorAll('.seat__row');

const clearClassesOfSeats = () => {
  [...seatsRow].forEach(row => {
    [...row.children].forEach(button => {
      button.classList.remove('seat__item--tagged');
      button.classList.remove('seat__item--reserved');
    });
  });
};

[...buttonsWrapper.children].forEach(item => {
  item.addEventListener('click', event => {
    if (
      item.classList.contains('time__button--active') &&
      item.classList.contains('time__button--past')
    ) {
      [...seatsRow].forEach(row => {
        [...row.children].forEach(button => {
          button.classList.add('seat__item--past');
          button.setAttribute('disabled', true);
        });
      });
    } else {
      [...seatsRow].forEach(row => {
        [...row.children].forEach(button => {
          button.classList.remove('seat__item--past');
          button.removeAttribute('disabled');
        });
      });
    }

    clearClassesOfSeats();
  });
});

dateSelect.addEventListener('change', clearClassesOfSeats);

// Достаём из LocalStrorage определённый сеанс при изменении значения в select или при выборе времени, и добавляем класс reserved к занятым местам
const getSession = () => {
  let textContentOfActiveButton;

  [...buttonsWrapper.children].forEach(button => {
    if (button.classList.contains('time__button--active')) {
      textContentOfActiveButton = button.textContent;
    }
  });

  let seatsOfSessions;

  if (textContentOfActiveButton && dateSelect.value) {
    seatsOfSessions = JSON.parse(
      localStorage.getItem(
        `date: ${dateSelect.value}, time: ${textContentOfActiveButton}`
      )
    );
  }

  if (seatsOfSessions) {
    for (let row in seatsOfSessions) {
      let matchedRow = document.querySelector(`.${row}`);
      seatsOfSessions[row].forEach(seatNumber => {
        [...matchedRow.children].forEach(seat => {
          if (seat.classList.contains(`seat-${seatNumber}`)) {
            seat.classList.add('seat__item--reserved');
            seat.setAttribute('disabled', true);
          }
        });
      });
    }
  }
};

[...buttonsWrapper.children].forEach(item => {
  item.addEventListener('click', getSession);
});

dateSelect.addEventListener('change', getSession);

// Помечаем выбранные места:
const seats = document.querySelectorAll('.seat__item');
[...seats].forEach(seat => {
  if (
    !seat.classList.contains('seat__item--past') &&
    !seat.classList.contains('seat__item--reserved')
  ) {
    seat.addEventListener('click', event => {
      event.target.classList.toggle('seat__item--tagged');
    });
  }
});

// Добавляем класс reserved к местам при бронировании
const buttonReserve = document.querySelector('.seat__button');
buttonReserve.addEventListener('click', event => {
  let textContentOfActiveButton;

  [...buttonsWrapper.children].forEach(button => {
    if (button.classList.contains('time__button--active')) {
      textContentOfActiveButton = button.textContent;
    }
  });

  let oldSession;

  if (textContentOfActiveButton && dateSelect.value) {
    oldSession = JSON.parse(
      localStorage.getItem(
        `date: ${dateSelect.value}, time: ${textContentOfActiveButton}`
      )
    );
  }

  const isEmpty = obj => {
    for (var key in obj) {
      return false;
    }
    return true;
  };

  let newSession;

  if (!isEmpty(oldSession)) {
    newSession = {
      'row-1': [...oldSession['row-1']],
      'row-2': [...oldSession['row-2']],
      'row-3': [...oldSession['row-3']],
      'row-4': [...oldSession['row-4']]
    };
  } else {
    newSession = {
      'row-1': [],
      'row-2': [],
      'row-3': [],
      'row-4': []
    };
  }

  [...seatsRow].forEach(row => {
    [...row.children].forEach(seat => {
      if (seat.classList.contains('seat__item--tagged')) {
        newSession[seat.getAttribute('data-row')].push(
          seat.getAttribute('data-seat')
        );
      }
    });
  });

  localStorage.setItem(
    `date: ${dateSelect.value}, time: ${textContentOfActiveButton}`,
    JSON.stringify({ ...newSession })
  );

  [...document.querySelectorAll('.seat__item--tagged')].forEach(item => {
    item.classList.add('seat__item--reserved');
    item.setAttribute('disabled', true);
    item.classList.remove('seat__item--tagged');
  });
});
